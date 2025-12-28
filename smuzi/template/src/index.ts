import * as fs from "node:fs";
import {path} from "@smuzi/std";

function getPath(pathDir: string, templateName: string, extension: string) {
    return path.join(pathDir, templateName + "." + extension)
}


export function template(pathDir: string = "templates", extension = ".jstempl")  {
    return {
        render(templateName: string, data: Record<string, unknown>): string {
            const template = fs.readFileSync(getPath(pathDir, templateName, extension), 'utf-8');

            return template.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (match, key) => {
                const value = key.split('.').reduce((obj: any, prop: string) => {
                    return obj?.[prop];
                }, {data});

                return value !== undefined && value !== null ? String(value) : '';
            });
        }
    }
}