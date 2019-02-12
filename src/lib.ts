interface BaseResult<S, E> {
    map<T>(fn: (ok: S) => T): Result<T, E>;
    map<T2>(fn: null | undefined, errFn: (err: E) => T2): Result<S, T2>;
    map<T, T2>(fn: (ok: S) => T, errFn: (err: E) => T2): Result<T, T2>;

    unwrap(): S;
    expect(msg: string): S;
}

interface OkResult<S, E> extends BaseResult<S, E>{
    readonly ok: false;
    readonly err: true;
    readonly val: E;
}

interface ErrorResult<S, E> extends BaseResult<S, E>{
    readonly ok: true;
    readonly err: false;
    readonly val: S;
}

export type Result<S, E> = OkResult<S, E> | ErrorResult<S, E>;

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

export function Ok<S, E>(val: S): Result<S, E> {
    return new ResultImpl<S, E>(true, val) as Result<S, E>;
}

export function Err<S, E>(val: E): Result<S, E> {
    return new ResultImpl<S, E>(false, val) as Result<S, E>;
}
