interface BaseResult<T, E> {
    map<T1>(fn: (ok: T) => T1): Result<T1, E>;
    map<T2>(fn: null | undefined, errFn: (err: E) => T2): Result<T, T2>;
    map<T1, T2>(fn: (ok: T) => T1, errFn: (err: E) => T2): Result<T1, T2>;

    /**
     * If the result has a value returns that value.  Otherwise returns the passed in value.
     * @param val the value to replace the error with
     */
    else<T2>(val: T2): T | T2;

    unwrap(): T;
    expect(msg: string): T;
    asErr(): Result<never, E>;
    asOk(): Result<T, never>;

    /**
     * This value doesn't exist at runtime! It's only used so that we can extract the type E given Result<T, E>
     */
    _e: E;

    /**
     * This value doesn't exist at runtime! It's only used so that we can extract the type T given Result<T, E>
     */
    _t: T;
}

export interface Ok<T = any, E = never> extends BaseResult<T, E> {
    readonly ok: true;
    readonly err: false;
    readonly val: T;
}

export interface Err<T = never, E = any> extends BaseResult<T, E> {
    readonly ok: false;
    readonly err: true;
    readonly val: E;
}

export type Result<T, E> = Ok<T, E> | Err<T, E>

export class ResultImpl<T, E> {
    public readonly err: boolean;
    public readonly ok: boolean;
    public readonly val: E | T;

    map<T1>(fn: (ok: T) => T1): Result<T1, E>
    map<T2>(fn: null | undefined, errFn: (err: E) => T2): Result<T, E>;
    map<T1, T2>(fn: (ok: T) => T1, errFn: (err: E) => T2): Result<T1, T2>
    map<T1, T2>(fn?: ((ok: T) => T1) | null, errFn?: (err: E) => T2): Result<T1 | T, T2 | E> {
        if (this.ok) {
            if (fn) {
                return Ok(fn(this.val as T));
            } else {
                return Ok(this.val as T);
            }
        } else {
            if (errFn) {
                return Err(errFn(this.val as E));
            } else {
                return Err(this.val as E);
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

    else<T2>(val: T2): T | T2 {
        if (this.ok) {
            return this.val as T;
        } else {
            return val;
        }
    }

    asErr(): Result<never, E> {
        return this as any;
    }

    asOk(): Result<T, never> {
        return this as any;
    }

    constructor(ok: false, val: E)
    constructor(ok: true, val: T)
    constructor(ok: boolean, val: E | T) {
        this.ok = ok;
        this.err = !ok;
        this.val = val;
    }
}

export function Ok<T, E = never>(val: T): Result<T, E> {
    return new ResultImpl<T, E>(true, val) as Result<T, E>;
}

export function Err<T= never, E = any>(val: E): Result<T, E> {
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
