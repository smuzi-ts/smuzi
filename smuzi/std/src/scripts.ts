import fs from "node:fs";
import path from "node:path";
import {pathToFileURL} from "node:url";
import {Ok, Result} from "#lib/result.js";

export async function runFromDir(
    dir: string,
    fileSuffix: string[] = ['.js'],
    recursive: boolean = false,
): Promise<Result<unknown[]>> {
    const results: unknown[] = []
    const entries = await fs.promises.readdir(dir, {withFileTypes: true});

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory() && recursive) {
            await runFromDir(fullPath);
            continue;
        }

        if (
            entry.isFile() &&
            fileSuffix.some(fileSuffix => entry.name.endsWith(fileSuffix))
        ) {
            results.push((await import(pathToFileURL(fullPath).href)).default);
        }
    }

    return Ok(results)
}
