export function date(start = new Date(2000, 0, 1), end = new Date()) {
    const timestamp = start.getTime() + Math.random() * (end.getTime() - start.getTime());

    return new Date(timestamp);
}