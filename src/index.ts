interface BaseResult<T, E> {
    map<T1>(fn: (ok: T) => T1): Result<T1, E>;
    map<T2>(fn: null | undefined, errFn: (err: E) => T2): Result<T, T2>;
    map<T1, T2>(fn: (ok: T) => T1, errFn: (err: E) => T2): Result<T1, T2>;

    /**
     * If the result has a value returns that value.  Otherwise returns the passed in value.
     * @param val the value to replace the error with
     */
    else(val: T): T;

    unwrap(): T;
    expect(msg: string): T;
}

interface OkResult<T, E> extends BaseResult<T, E>{
    readonly ok: false;
    readonly err: true;
    readonly val: E;
}

interface ErrorResult<T, E> extends BaseResult<T, E>{
    readonly ok: true;
    readonly err: false;
    readonly val: T;
}

export type Result<T, E> = OkResult<T, E> | ErrorResult<T, E>;

class ResultImpl<T, E> {
    public readonly err: boolean;
    public readonly ok: boolean;
    public readonly val: E | T;

    map<T1>(fn: (ok: T) => T1): Result<T1, E>
    map<T2>(fn: null | undefined, errFn: (err: E) => T2): Result<T, E>;
    map<T1, T2>(fn: (ok: T) => T1, errFn: (err: E) => T2): Result<T1, T2>
    map<T1, T2>(fn?: ((ok: T) => T1) | null, errFn?: (err: E) => T2): Result<T1 | T, T2 | E> {
        if (this.ok) {
            if (fn) {
                return Ok<T1, E | T2>(fn(this.val as T));
            } else {
                return Ok<T, E | T2>(this.val as T);
            }
        } else {
            if (errFn) {
                return Err<T1 | T, T2>(errFn(this.val as E));
            } else {
                return Err<T1 | T, E>(this.val as E);
            }
        }
    };

    unwrap(): T {
        if (this.ok) {
            return this.val as T;
        } else {
            throw this.val as E;
        }
    }

    expect(msg: string): T {
        if (this.ok) {
            return this.val as T;
        } else {
            throw new Error(`${msg} - Error: ${this.val.toString()}`);
        }
    }

    else(val: T): T {
        if (this.ok) {
            return this.val as T;
        } else {
            return val;
        }
    }

    constructor(ok: false, val: E)
    constructor(ok: true, val: T)
    constructor(ok: boolean, val: E | T) {
        this.ok = ok;
        this.err = !ok;
        this.val = val;
    }
}

export function Ok<T, E>(val: T): Result<T, E> {
    return new ResultImpl<T, E>(true, val) as Result<T, E>;
}

export function Err<T, E>(val: E): Result<T, E> {
    return new ResultImpl<T, E>(false, val) as Result<T, E>;
}

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
            return Err(result.val);
        }
    }
    return Ok(okResult);
}
