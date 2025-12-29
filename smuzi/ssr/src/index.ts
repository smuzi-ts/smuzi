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

type InputData = Record<string, unknown>

type SSREngineConfig = {
    pathDir: string,
    extension: string,
}

function runSSRCode(context, code: string): string {
    const printFunc = `
                function _print(html) {
                    _output += html
                }`;
    code = `
                _output = '';
                ${printFunc}
                ${code}
                _output`
    const script = new vm.Script(code);

    const result = script.runInContext(context);
    return result !== undefined ? String(result) : '';
}

function renderTemplate(
    pathDir: string,
    extension: string,

): ( templateName: string,
     inputData: InputData,
     slots?: Option
) => Promise<Result<string, StdError>> {
    return async(
        templateName: string,
        inputData: InputData = {},
        slots: Option = None()
    ) => {
        let template = fs.readFileSync(getPath(pathDir, templateName, extension), 'utf-8');

        const context = vm.createContext({
            _data: inputData,
            _output: '',
            _ssrEngine: {
                renderComponent: renderTemplate(pathDir, extension)
            },
            _std,
        })

        const renderComponent = renderTemplate(pathDir, extension);

        try {
            return Ok(
                template
                    //<script ssr>...</script>
                    .replace(/<script\b[^>]*\bssr>([\s\S]*?)<\/script>/g, (match, code) => runSSRCode(context, code))
                    //{{ ... }}
                    .replace(/{{([\s\S]*?)}}/g, (match, code) => {
                        return runSSRCode(context, `_print(${code})`)
                    })
            );
        } catch (err) {
            return Err(transformError(err));
        }

    }
}

export function ssrEngine({pathDir = "./src/templates", extension = "html"}: Partial<SSREngineConfig> = {}) {

    const render = renderTemplate(pathDir, extension)

    const response = async (templateName: string, inputData: InputData = {}) => {
        return (await render(templateName, inputData)).match({
            Err: err => err,
            Ok: html => html,
        });
    }

    return {
        render,
        response,
    }
}

