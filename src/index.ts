function toString(val: unknown) {
    let value = ''.toString.call(val);
    if (value === '[object Object]') {
        try {
            value = JSON.stringify(value);
        } catch {}
    }
    return value
}
export class Err<E> {
    static readonly EMPTY = new Err<void>(undefined);

    readonly ok = false;
    readonly err = true;

    constructor(public readonly val: E) {
    }

    /**
     * If the result has a value returns that value.  Otherwise returns the passed in value.
     * @param val the value to replace the error with
     */
    else<T2>(val: T2): T2 {
        return val;
    }

    expect(msg: string): never {
        throw new Error(`${msg} - Error: ${toString(this.val)}`);
    }

    unwrap(): never {
        throw new Error(`Tried to unwrap Error: ${toString(this.val)}`);
    }

    map<T2>(_mapper: (val: never) => T2): Err<E> {
        return this;
    }

    mapErr<E2>(mapper: (err: E) => E2): Err<E2> {
        return new Err(mapper(this.val));
    }
}

export class Ok<T> {
    static readonly EMPTY = new Ok<void>(undefined);

    readonly ok = true;
    readonly err = false;

    constructor(public readonly val: T) {}

    /**
     * If the result has a value returns that value.  Otherwise returns the passed in value.
     * @param _val the value to replace the error with
     */
    else<T2>(_val: T2):  T {
        return this.val;
    }

    expect(_msg: string): T {
        return this.val;
    }

    unwrap(): T {
        return this.val;
    }

    map<T2>(mapper: (val: T) => T2): Ok<T2> {
        return new Ok(mapper(this.val));
    }

    mapErr<E2>(_mapper: (err: never) => E2): Ok<T> {
        return this;
    }
}

export type Result<T, E> = (Ok<T> | Err<E>) & {
    map<T2>(mapper: (val: T) => T2): Result<T2, E>;

    mapErr<E2>(mapper: (val: E) => E2): Result<T, E2>;
};

export type ResultOkType<T extends Result<any, any>> = T extends Result<infer U, any> ? U : never;
export type ResultErrType<T extends Result<any, any>> = T extends Result<any, infer U> ? U : never;

export function Results<T1, E1, T2, E2>(result1: Result<T1, E1>, result2: Result<T2, E2>): Result<[T1, T2], E1 | E2>
export function Results<T1, E1, T2, E2, T3, E3>(result1: Result<T1, E1>, result2: Result<T2, E2>, result3: Result<T3, E3>): Result<[T1, T2, T3], E1 | E2 | E3>
export function Results<T1, E1, T2, E2, T3, E3, T4, E4>(result1: Result<T1, E1>, result2: Result<T2, E2>, result3: Result<T3, E3>, result4: Result<T4, E4>): Result<[T1, T2, T3, T4], E1 | E2 | E3 | E4>
export function Results(...results: Result<any, any>[]): Result<any[], any>
export function Results(...results: Result<any, any>[]): Result<any[], any> {
    const okResult = [];
    for (let result of results) {
        if (result.ok) {
            okResult.push(result.val);
        } else {
            return new Err(result.val);
        }
    }
    return new Ok(okResult);
}
