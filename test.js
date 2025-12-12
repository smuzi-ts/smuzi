'use strict';

const express = require('express');
const router = express.Router();
const catalyst = require('zcatalyst-sdk-node');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { setTimeout: sleep } = require('timers/promises');
const ZohoCreator = require("../../../services/zohoCreator");
const { getInstance } = require("../../../services/workDrive");

module.exports = router.post('/download-files', async (req, res) => {
    console.log(`[${new Date().toISOString()}] Download request received`);

    if (!req.body.project_files || !Array.isArray(req.body.project_files) || req.body.project_files.length === 0) {
        return res.status(400).json({ success: false, message: "No files provided" });
    }

    res.status(202).json({
        success: true,
        message: "Processing started",
        total_files: req.body.project_files.length
    });

    processFilesInBackground(req).catch(err => {
        console.error(`Background error:`, err.message);
    });
});

async function processFilesInBackground(req) {
    console.log(`[${new Date().toISOString()}] Starting processing`);

    let catalystApp;
    let writeStream = null;
    let tempFilePath = null;

    try {
        catalystApp = catalyst.initialize(req);
        const { project_files, parent_id } = req.body;

        if (!project_files || !Array.isArray(project_files) || project_files.length === 0) return;

        const sortedFiles = [...project_files]
            .filter(f => f.id && f.file_name)
            .sort((a, b) => {
                const numA = parseInt(a.file_name.match(/\d+/)?.[0]) || 0;
                const numB = parseInt(b.file_name.match(/\d+/)?.[0]) || 0;
                return numA - numB;
            });

        if (sortedFiles.length === 0) return;

        const outputFilename = sortedFiles[0].file_name.replace(/_\d+\./, '.');
        const zohoService = ZohoCreator.getInstance(catalystApp, "Zoho");

        const tempDir = os.tmpdir();
        tempFilePath = path.join(tempDir, `concat-${Date.now()}.tmp`);
        writeStream = fs.createWriteStream(tempFilePath);

        let totalSize = 0;
        let downloadedCount = 0;
        let failedFiles = [];

        for (let i = 0; i < sortedFiles.length; i++) {
            const file = sortedFiles[i];
            const fileNumber = i + 1;

            try {
                const fileStream = await downloadSingleFileAsStream(zohoService, file, fileNumber);
                if (!fileStream) {
                    failedFiles.push(file.file_name);
                    continue;
                }

                const fileSize = await streamToFile(fileStream, writeStream, fileNumber);
                if (fileSize > 0) {
                    downloadedCount++;
                    totalSize += fileSize;
                } else {
                    failedFiles.push(file.file_name);
                }

                if (i < sortedFiles.length - 1) await sleep(1000);

            } catch (error) {
                failedFiles.push(file.file_name);
            }
        }

        writeStream.end();
        await new Promise(resolve => writeStream.on('close', resolve));

        if (downloadedCount === 0) {
            cleanupTempFile(tempFilePath);
            return;
        }

        console.log(`Uploading to WorkDrive...`);
        const workdrive = getInstance(catalystApp, 'Zoho');
        const stats = fs.statSync(tempFilePath);
        const readStream = fs.createReadStream(tempFilePath);

        let uploadResult;
        try {
            if (workdrive.uploadFileFromReadable) {
                uploadResult = await workdrive
                    .uploadFileFromReadable(
                        readStream,
                        outputFilename,
                        parent_id,
                        { overrideNameExist: true, size: stats.size }
                    )
                    .run({ timeout: 600000 });
            } else {
                uploadResult = await workdrive
                    .uploadFile(
                        tempFilePath,
                        parent_id,
                        { filename: outputFilename, overrideNameExist: true }
                    )
                    .run({ timeout: 600000 });
            }

            const resourceId = extractResourceId(uploadResult);

            await zohoService.updateRecord(
                sortedFiles[0].id,
                "Projects_Plans_Files_Report",
                {
                    Workdrive_Id: resourceId,
                    Catalyst_Done: "Yes",
                    Processed_Date: new Date().toISOString()
                }
            ).run({ timeout: 30000 });

        } catch (uploadErr) {
            if (uploadErr.code === 'ETIMEDOUT' || uploadErr.message.includes('timeout')) {
                await sleep(10000);
                cleanupTempFile(tempFilePath);
                return await processFilesInBackground(req);
            }
            throw uploadErr;
        }

    } catch (err) {
        console.error(`Processing error:`, err.message);
    } finally {
        if (tempFilePath) cleanupTempFile(tempFilePath);
        if (writeStream && !writeStream.closed) writeStream.destroy();
        console.log(`[${new Date().toISOString()}] Processing ended\n`);
    }
}

async function streamToFile(readStream, writeStream, fileNumber) {
    return new Promise((resolve, reject) => {
        let fileSize = 0;

        readStream.on('data', (chunk) => {
            fileSize += chunk.length;
            if (!writeStream.write(chunk)) readStream.pause();
        });

        writeStream.on('drain', () => readStream.resume());
        readStream.on('end', () => resolve(fileSize));
        readStream.on('error', reject);
    });
}

async function downloadSingleFileAsStream(zohoService, file, fileNumber) {
    for (let attempt = 0; attempt < 2; attempt++) {
        try {
            const response = await zohoService.downloadFile(
                file.id,
                "Chunk",
                "Projects_Plans_Files_Report"
            ).run({
                responseType: 'stream',
                timeout: 180000,
                headers: { 'Connection': 'keep-alive' }
            });
            return response.data;
        } catch (error) {
            if (attempt < 1) await sleep(2000);
        }
    }
    return null;
}

function extractResourceId(uploadResult) {
    return uploadResult[0]?.attributes?.resource_id ||
        uploadResult.resource_id ||
        uploadResult.id ||
        uploadResult.data?.resource_id ||
        'unknown';
}

function cleanupTempFile(filePath) {
    if (!filePath) return;
    try {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch (err) {}
}
