import * as fs from "node:fs";
import {uuid, HttpResponse, path, ResponseHttpHeaders, Some, None, Option} from "@smuzi/std";

function getPath(pathDir: string, templateName: string, extension: string) {
    return path.join(pathDir, templateName + "." + extension)
}

function getValue(key: string, obj: any): any {
    return key.split('.').reduce((current: any, prop: string) => {
        return current?.[prop];
    }, obj);
}
function evaluateExpression(expression: string, context: any): string {
    try {
        // Создаём функцию с контекстом
        const keys = Object.keys(context);
        const values = Object.values(context);

        const func = new Function(...keys, `return ${expression}`);
        const result = func(...values);

        return result !== undefined && result !== null ? String(result) : '';
    } catch (e) {
        throw new Error(`Failed to evaluate expression: ${expression}`);
    }
}

type InputData = Record<string, unknown>

class TemplateInputData <T extends InputData = InputData> {
    readonly data: T;
    readonly id: string
    constructor(data: T) {
        this.data = data;
        this.id = uuid();
    }

}

export function templateInputData<T extends InputData>(data: T) {
    return new TemplateInputData(data);
}

export function templateEngine(pathDir: string = "templates", extension = "jstempl")  {
    return {
        async render(templateName: string, inputData: TemplateInputData = new TemplateInputData({})): Promise<string> {
            const template = fs.readFileSync(getPath(pathDir, templateName, extension), 'utf-8');

            let result = template;

            // Обработка @foreach
            result = result.replace(
                /@foreach\s*\(\s*([\w.]+)\s+as\s+(\w+)\s*\)([\s\S]*?)@endforeach/g,
                (match, arrayKey, itemVar, content) => {
                    const array = getValue(arrayKey, inputData.data);

                    if (!Array.isArray(array)) return '';

                    return array.map(item => {
                        return content.replace(/\{\{\s*(.+?)\s*\}\}/g, (m, expression) => {
                            try {
                                // Создаём контекст для выполнения
                                const contextData = { ...inputData.data, [itemVar]: item };
                                return evaluateExpression(expression, contextData);
                            } catch (e) {
                                console.error('Template expression error:', e);
                                return '';
                            }
                        });
                    }).join('');
                }
            );

            // Обработка @if
            result = result.replace(
                /@if\s*\(\s*(.+?)\s*\)([\s\S]*?)@endif/g,
                (match, condition, content) => {
                    try {
                        const value = evaluateExpression(condition, inputData.data);
                        return value ? content : '';
                    } catch (e) {
                        console.error('Template condition error:', e);
                        return '';
                    }
                }
            );

            // Обработка @if...@else
            result = result.replace(
                /@if\s*\(\s*(.+?)\s*\)([\s\S]*?)@else([\s\S]*?)@endif/g,
                (match, condition, ifContent, elseContent) => {
                    try {
                        const value = evaluateExpression(condition, inputData.data);
                        return value ? ifContent : elseContent;
                    } catch (e) {
                        console.error('Template condition error:', e);
                        return elseContent;
                    }
                }
            );

            // Обработка простых переменных и выражений
            result = result.replace(/\{\{\s*(.+?)\s*\}\}/g, (match, expression) => {
                try {
                    return evaluateExpression(expression, inputData.data);
                } catch (e) {
                    console.error('Template expression error:', e);
                    return '';
                }
            });

            return result;
        },
        response: async (templateName: string,  inputData: TemplateInputData = new TemplateInputData({})) => {
            return new HttpResponse(
                {
                    body: await this.render(templateName, inputData),
                    headers: new ResponseHttpHeaders([
                        ["content-type", "text/html; charset=utf-8"]
                    ])
                }
            )
        }
    }
}

