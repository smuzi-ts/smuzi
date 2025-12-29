import * as fs from "node:fs";
import {
    uuid,
    HttpResponse,
    path,
    ResponseHttpHeaders,
    Some,
    None,
    Option,
    dump,
    Result,
    Err,
    Ok,
    transformError, StdError
} from "@smuzi/std";
import * as vm from "node:vm";

import * as _std from "@smuzi/std"

function getPath(pathDir: string, templateName: string, extension: string) {
    return path.join(pathDir, templateName + "." + extension)
}

function evaluateExpression(expression: string, context: any): string {
    try {
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
type TemplateEngineConfig = {
    pathDir: string,
    extension: string,
}

export function templateEngine({pathDir = "./src/templates", extension = "html"}: Partial<TemplateEngineConfig> = {}) {
    const render = async (templateName: string, inputData: InputData = {}): Promise<Result<string, StdError>> => {
        const template = fs.readFileSync(getPath(pathDir, templateName, extension), 'utf-8');

        let result = template;

        const context = vm.createContext({
            ...inputData,
            _output: '',
            _std,
        })

        try {
            return Ok(result.replace(/<script\b[^>]*\bastempl>([\s\S]*?)<\/script>/g, (match, code) => {

                code = `
                _output = '';
                ${code}
                function _print(html) {
                    _output += html
                }
                _output`
                const script = new vm.Script(code);

                const result = script.runInContext(context);
                return result !== undefined ? String(result) : '';

            }));
        } catch (err) {
            return Err(transformError(err));
        }

    };

    const response = async (templateName: string, inputData: InputData = {}) => {
        return (await render(templateName, inputData)).match({
            Err: err => err.message,
            Ok: html => html,
        });
    }


    return {
        render,
        response,
    }
}

