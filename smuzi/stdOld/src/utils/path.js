import * as path from "node:path"
import {fileURLToPath} from "node:url";
import {pipeIn} from "./fp.js";

export const relativeToUrl = (fromUrl, toPath) => {
    return pipeIn(fromUrl)
    (
        fileURLToPath,
        path.dirname,
        (dirname) => path.join(dirname, toPath),
    )
}

