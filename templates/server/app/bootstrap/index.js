import * as jis from "@juravel/core/index.js"
import {readonly} from "@juravel/core/stdlib/index.js";
import loadServices from "#app/bootstrap/services";

/**
 * First init base global variables that can be used
 * in next services
 */
global.core = jis.core
global.readonly = readonly

/**
 * Loading all configs to global space
 */
global.config = await import("#app/config/index").default

/**
 * Registration all services to Container
 */
loadServices()

global.logger = jis.logger()

export {}