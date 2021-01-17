export function toString(val: unknown): string {
    let value = String(val);
    if (value === '[object Object]') {
        try {
            value = JSON.stringify(val);
        } catch {}
    }
    return value;
}
