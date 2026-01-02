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
    transformError, StdError, panic, Pipe, regexp
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

async function runSSRCode(context, code: string): Promise<Result<string, StdError>> {
    const printFunc = `
                (async () => {
                function _print(html) {
                    _output += html
                }`;
    code = `
                _output = '';
                ${printFunc}
                ${code}
                return _output
                })()`
    const script = new vm.Script(code);

    const result = await script.runInContext(context);

    return Ok(result !== undefined ? String(result) : '');
}

async function parseCode(context: any, templateCode: string) {
    try {
        let result = (await regexp.asyncReplace(
            templateCode,
            /@for\s*\(\s*(\w+)\s+of\s+([^)]+)\s*\)([\s\S]*?)@end/g,
            async (match, item, iterable, body) => {
                const code = `
                            for (const ${item} of ${iterable}) {
                                const res = await _ssrEngine.parseCode({${item}}, \`${body}\`);
                                _output += res.unwrap();
                            }
                        `;

                return await runSSRCode(context, code);
            }
            ));

        return result.match({
            Err: err => Err(err),
            Ok: async templateCode => {
                return await regexp.asyncReplace(templateCode, /{{([\s\S]*?)}}/g, async (match, code) => {
                    return await runSSRCode(context, `_print(${code})`)
                });
            }
        })


        // const res1 = Ok(
        //     templateCode
        //         //@if(condition)...@else...@end or @if(condition)...@end
        //         .replace(/@if\s*\(\s*([^)]+)\s*\)([\s\S]*?)(?:@else([\s\S]*?))?@end/g, (match, condition, ifBody, elseBody) => {
        //             const code = `
        //                     _print((${condition}) ? \`${ifBody.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\` : \`${(elseBody || '').replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`);
        //                 `;
        //             return runSSRCode(context, code);
        //         })
        //         //<script ssr>...</script>
        //         .replace(/<script\b[^>]*\bssr>([\s\S]*?)<\/script>/g, (match, code) => runSSRCode(context, code))
        //
        //         //{{ ... }}
        //         .replace(/{{([\s\S]*?)}}/g, (match, code) => {
        //             return runSSRCode(context, `_print(${code})`)
        //         })
        // );
    } catch (err) {
        return Err(transformError(err));
    }
}

function createContext(inputData, pathDir, extension )
{
    return vm.createContext({
        ...inputData,
        _std,
        _output: '',
        _ssrEngine: {
            renderComponent: async (templateNameChild: string, inputDataChild) => {
                return (renderTemplate(pathDir, extension))(templateNameChild, inputDataChild)
            },
            parseCode: async (inputDataChild, templateCode) => {
                return parseCode(
                    createContext(
                        Object.assign(inputDataChild, inputData),
                        pathDir,
                        extension
                    ), templateCode)
            }
        },
    })
}

function renderTemplate(
    pathDir: string,
    extension: string,
): ( templateName: string,
     inputData: InputData,
     slots?: Option
) => Promise<Result<string, StdError>> {
    return async (
        templateName: string,
        inputData: InputData = {},
        slots: Option = None()
    ) => {

        let templateCode = fs.readFileSync(getPath(pathDir, templateName, extension), 'utf-8');

        const context = createContext(inputData, pathDir, extension);

        return parseCode(context, templateCode);
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

