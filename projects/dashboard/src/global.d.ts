import {TQuery} from "@smuzi/database";

declare global {
    const query: TQuery

    interface GlobalThis {
        query: TQuery;
    }
}

export {}

