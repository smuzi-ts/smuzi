export type LogDetails = {
    stream: Record<string, string|boolean|number>,
    value: string,
}

export interface Logger {
    info(log_details: LogDetails): Promise<void>
}

