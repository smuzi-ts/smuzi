import {readonly} from "#stdlib/types";

export function createContext(headers) {
    const request = readonly({
        path: headers[":path"],
        fullUrl: '',
        method: "GET",
    })
    
    return readonly({
        request
    })
}
