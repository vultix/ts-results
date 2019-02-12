interface BaseResult<T, E> {
    map<T>(fn: (ok: T) => T): Result<T, E>;
    map<T2>(fn: null | undefined, errFn: (err: E) => T2): Result<T, T2>;
    map<T, T2>(fn: (ok: T) => T, errFn: (err: E) => T2): Result<T, T2>;

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

class ResultImpl<S, E> {
    public readonly err: boolean;
    public readonly ok: boolean;
    public readonly val: E | S;

    map<T>(fn: (ok: S) => T): Result<T, E>
    map<T2>(fn: null | undefined, errFn: (err: E) => T2): Result<S, E>;
    map<T, T2>(fn: (ok: S) => T, errFn: (err: E) => T2): Result<T, T2>
    map<T, T2>(fn?: ((ok: S) => T) | null, errFn?: (err: E) => T2): Result<T | S, T2 | E> {
        if (this.ok) {
            if (fn) {
                return Ok<T, E | T2>(fn(this.val as S));
            } else {
                return Ok<S, E | T2>(this.val as S);
            }
        } else {
            if (errFn) {
                return Err<T | S, T2>(errFn(this.val as E));
            } else {
                return Err<T | S, E>(this.val as E);
            }
        }
    };

    unwrap(): S {
        if (this.ok) {
            return this.val as S;
        } else {
            throw this.val as E;
        }
    }

    expect(msg: string): S {
        if (this.ok) {
            return this.val as S;
        } else {
            throw new Error(`${msg} - Error: ${this.val.toString()}`);
        }
    }

    constructor(ok: false, val: E)
    constructor(ok: true, val: S)
    constructor(ok: boolean, val: E | S) {
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
