import {core} from "@juravel/core/index.js"
import {readonly} from "@juravel/core/stdlib/index.js";
import {providers} from "#app/bootstrap/providers";

global.core = core
global.readonly = readonly

core.config = (await import("#app/config/index")).default;
core.container.loadServices(providers)

export {}