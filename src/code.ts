
export function sum(a: number, b: number): number {
    return a + b;
}

export function minus(a: number, b: number): number {
    return a - b;
}

export function looper(l:Array<String|Number>, repeat:number, n:number) {

    if (repeat === 1) return l[n % l.length];
    else if (n % repeat === 0) {
        return l[(n / repeat) % repeat]
    } else {
        return false;
    }
}
