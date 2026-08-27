import { Result, StdError } from "@smuzi/std";
import { BaseRequestConfig } from "./index.js";

export type Connector = (request: BaseRequestConfig) => Promise<Result<BaseRequestConfig,StdError>>