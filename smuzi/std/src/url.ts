export function resolve(protocol, host, port, path = ""): string {
    return protocol + "://" + host + ":" + port + "/" + path;
}
