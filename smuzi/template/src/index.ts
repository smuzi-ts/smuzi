import * as fs from "node:fs";
import {dump, HttpResponse, path, ResponseHttpHeaders} from "@smuzi/std";

function getPath(pathDir: string, templateName: string, extension: string) {
    return path.join(pathDir, templateName + "." + extension)
}

function getValue(key: string, obj: any): any {
    return key.split('.').reduce((current: any, prop: string) => {
        return current?.[prop];
    }, obj);
}

type InputData = {
    [key: string]: string | number | InputData | Array<string | number | InputData>;
}
export function templateEngine(pathDir: string = "templates", extension = "jstempl")  {
    return {
        async render(templateName: string, data: InputData = {}): Promise<string> {
            const wrappedData = { data }
            const template = fs.readFileSync(getPath(pathDir, templateName, extension), 'utf-8');

            let result = template;

            result = result.replace(
                /@foreach\s*\(\s*([\w.]+)\s+as\s+(\w+)\s*\)([\s\S]*?)@endforeach/g,
                (match, arrayKey, itemVar, content) => {
                    const array = getValue(arrayKey, wrappedData);

                    if (!Array.isArray(array)) return '';

                    return array.map(item => {
                        return content.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (m, key) => {
                            if (key.startsWith(itemVar + '.')) {
                                const prop = key.substring(itemVar.length + 1);
                                const value = getValue(prop, item);
                                return value !== undefined && value !== null ? String(value) : '';
                            }
                            const value = getValue(key, wrappedData);
                            return value !== undefined && value !== null ? String(value) : '';
                        });
                    }).join('');
                }
            );

            result = result.replace(
                /@if\s*\(\s*(\w+)\s*\)([\s\S]*?)@endif/g,
                (match, condition, content) => {
                    const value = getValue(condition, wrappedData);
                    return value ? content : '';
                }
            );

            result = result.replace(
                /@if\s*\(\s*(\w+)\s*\)([\s\S]*?)@else([\s\S]*?)@endif/g,
                (match, condition, ifContent, elseContent) => {
                    const value = getValue(condition, wrappedData);
                    return value ? ifContent : elseContent;
                }
            );

            result = result.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (match, key) => {
                const value = getValue(key, wrappedData);
                return value !== undefined && value !== null ? String(value) : '';
            });

            return result;
        },
        response: async (templateName: string, data: InputData = {}) => {
            return new HttpResponse(
                {
                    body: await this.render(templateName, data),
                    headers: new ResponseHttpHeaders([
                        ["content-type", "text/html; charset=utf-8"]
                    ])
                }
            )
        }
    }
}