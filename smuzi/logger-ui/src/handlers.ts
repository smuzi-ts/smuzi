import { readFile } from "node:fs/promises";
import { ServerResponse } from "node:http";
import { Action } from "@smuzi/http-server";
import { HttpResponse, ResponseHttpHeaders, Some } from "@smuzi/std";
import { LogsReader } from "@smuzi/logger";
import { parseLogsQuery } from "./query.js";

// Resolves to <package>/build/ui both from src/ (workspace) and from build/ (published).
const UI_DIR = new URL("../build/ui/", import.meta.url);

export enum UiAsset {
    script = "app.js",
    style = "app.css",
}

const ASSET_CONTENT_TYPES: Record<UiAsset, string> = {
    [UiAsset.script]: "text/javascript; charset=utf-8",
    [UiAsset.style]: "text/css; charset=utf-8",
};

function textResponse(body: string, content_type: string, status = 200): HttpResponse<string> {
    return new HttpResponse({
        status,
        body: Some(body),
        headers: new ResponseHttpHeaders([["content-type", content_type]]),
    });
}

async function readUiFile(file: string): Promise<string | null> {
    try {
        return await readFile(new URL(file, UI_DIR), "utf-8");
    } catch {
        return null;
    }
}

function assetsNotBuiltResponse(): HttpResponse<string> {
    return textResponse(
        "Logger UI assets are not built. Run: pnpm --filter @smuzi/logger-ui build:ui",
        "text/plain; charset=utf-8",
        503
    );
}

function escapeHtmlAttribute(value: string): string {
    return value
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

export function uiPageAction(base_path: string): Action<ServerResponse> {
    return async () => {
        const html = await readUiFile("index.html");
        if (html === null) {
            return assetsNotBuiltResponse();
        }

        return textResponse(
            html.replaceAll("{{base}}", escapeHtmlAttribute(base_path)),
            "text/html; charset=utf-8"
        );
    };
}

export function uiAssetAction(asset: UiAsset): Action<ServerResponse> {
    return async () => {
        const content = await readUiFile(asset);
        if (content === null) {
            return assetsNotBuiltResponse();
        }

        return textResponse(content, ASSET_CONTENT_TYPES[asset]);
    };
}

export function logsQueryAction(reader: LogsReader): Action<ServerResponse> {
    return async (context) => {
        const body = await context.request.body();
        if (body.isErr()) {
            return HttpResponse.asJson({ error: "Unable to read request body" }, 400);
        }

        const query = parseLogsQuery(body.unwrap());
        if (query.isErr()) {
            return HttpResponse.asJson({ error: query.unsafeSource() }, 422);
        }

        const page = await reader.queryGroups(query.unwrap());

        return page.match({
            Ok: (value) => HttpResponse.asJson(value),
            Err: (error) => HttpResponse.asJson({ error: error.message }, 500),
        });
    };
}
