/*
 * Missing Rust Result type methods:
 * pub fn contains<U>(&self, x: &U) -> bool
 * pub fn contains_err<F>(&self, f: &F) -> bool
 * pub fn map_or<U, F>(self, default: U, f: F) -> U
 * pub fn map_or_else<U, D, F>(self, default: D, f: F) -> U
 * pub fn and<U>(self, res: Result<U, E>) -> Result<U, E>
 * pub fn or<F>(self, res: Result<T, F>) -> Result<T, F>
 * pub fn or_else<F, O>(self, op: O) -> Result<T, F>
 * pub fn unwrap_or_else<F>(self, op: F) -> T
 * pub fn expect_err(self, msg: &str) -> E
 * pub fn unwrap_err(self) -> E
 * pub fn unwrap_or_default(self) -> T
 */
interface BaseResult<T, E> extends Iterable<T extends Iterable<infer U> ? U : never> {
    /** `true` when the result is Ok */ readonly ok: boolean;
    /** `true` when the result is Err */ readonly err: boolean;

    /**
     * Returns the contained `Ok` value, if exists.  Throws an error if not.
     * @param msg the message to throw if no Ok value.
     */
    expect(msg: string): T;

    /**
     * Returns the contained `Ok` value.
     * Because this function may throw, its use is generally discouraged.
     * Instead, prefer to handle the `Err` case explicitly.
     *
     * Throws if the value is an `Err`, with a message provided by the `Err`'s value.
     */
    unwrap(): T;

    /**
     * Returns the contained `Ok` value or a provided default.
     *
     *  @see unwrapOr
     *  @deprecated in favor of unwrapOr
     */
    else<T2>(val: T2): T | T2;

    /**
     * Returns the contained `Ok` value or a provided default.
     *
     *  (This is the `unwrap_or` in rust)
     */
    unwrapOr<T2>(val: T2): T | T2;

    /**
     * Calls `mapper` if the result is `Ok`, otherwise returns the `Err` value of self.
     * This function can be used for control flow based on `Result` values.
     */
    andThen<T2, E2>(mapper: (val: T) => Result<T2, E2>): Result<T2, E | E2>;

    /**
     * Maps a `Result<T, E>` to `Result<U, E>` by applying a function to a contained `Ok` value,
     * leaving an `Err` value untouched.
     *
     * This function can be used to compose the results of two functions.
     */
    map<U>(mapper: (val: T) => U): Result<U, E>;

    /**
     * Maps a `Result<T, E>` to `Result<T, F>` by applying a function to a contained `Err` value,
     * leaving an `Ok` value untouched.
     *
     * This function can be used to pass through a successful result while handling an error.
     */
    mapErr<F>(mapper: (val: E) => F): Result<T, F>;
}

// @ts-ignore
export declare function Err<E>(val: E): Err<E>;

const isResultType = <T, E>(v: unknown): v is Result<T, E> => {
    return (
        typeof v === 'object' &&
        v !== null &&
        'val' in v &&
        'ok' in v &&
        'map' in v &&
        'mapErr' in v
    );
};

const recursiveUnwrap = <T2, E2>(r: Result<T2, E2>): Result<T2, E2> => {
    // If Error just return it
    if (!r.ok) {
        return r;
    }

    const unwrapped = r.val;

    // If not Result just wrap it & return it
    if (!isResultType(unwrapped)) {
        return new Ok(unwrapped) as Result<T2, E2>;
    }

    return recursiveUnwrap<T2, E2>(unwrapped as Result<T2, E2>);
};

/**
 * Contains the error value
 */
// @ts-ignore
export class Err<E> implements BaseResult<never, E> {
    /** An empty Err */
    static readonly EMPTY = new Err<void>(undefined);

    readonly ok!: false;
    readonly err!: true;
    readonly val!: E;

    [Symbol.iterator](): Iterator<never, never, any> {
        return {
            next(): IteratorResult<never, never> {
                return {done: true, value: undefined!};
            }
        };
    }

    constructor(val: E) {
        if (!(this instanceof Err)) {
            return new Err(val);
        }

        this.ok = false;
        this.err = true;
        this.val = val;
    }

    /**
     * @deprecated in favor of unwrapOr
     * @see unwrapOr
     */
    else<T2>(val: T2): T2 {
        return val;
    }

    unwrapOr<T2>(val: T2): T2 {
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

    andThen<T2, E2>(op: (val: never) => Result<T2, E2>): Err<E> {
        return this;
    }

    mapErr<E2>(mapper: (err: E) => E2): Err<E2> {
        return new Err(mapper(this.val));
    }

    flatMap(mapper: (val: never) => Result<never, E>): Result<never, E> {
        return this;
    }
}

// @ts-ignore
export declare function Ok<T>(val: T): Ok<T>;

/**
 * Contains the success value
 */
// @ts-ignore
export class Ok<T> implements BaseResult<T, never> {
    static readonly EMPTY = new Ok<void>(undefined);

    readonly ok!: true;
    readonly err!: false;
    readonly val!: T;

    /**
     * Helper function if you know you have an Ok<T> and T is iterable
     */
    [Symbol.iterator](): Iterator<T extends Iterable<infer U> ? U : never> {
        const obj = Object(this.val) as Iterable<any>;

        return Symbol.iterator in obj ? obj[Symbol.iterator]() : {
            next(): IteratorResult<never, never> {
                return {done: true, value: undefined!};
            }
        };
    }

    constructor(val: T) {
        if (!(this instanceof Ok)) {
            return new Ok(val);
        }

        this.ok = true;
        this.err = false;
        this.val = val;
    }

    /**
     * @see unwrapOr
     * @deprecated in favor of unwrapOr
     */
    else(_val: unknown): T {
        return this.val;
    }

    unwrapOr(_val: unknown): T {
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

    andThen<T2, E2>(mapper: (val: T) => Result<T2, E2>): Result<T2, E2> {
        return mapper(this.val);
    }

    mapErr<E2>(_mapper: (err: never) => E2): Ok<T> {
        return this;
    }

    /**
     * Returns the contained `Ok` value, but never throws.
     * Unlike `unwrap()`, this method doesn't throw and is only callable on an Ok<T>
     *
     * Therefore, it can be used instead of `unwrap()` as a maintainability safeguard
     * that will fail to compile if the error type of the Result is later changed to an error that can actually occur.
     *
     * (this is the `into_ok()` in rust)
     */
    safeUnwrap(): T {
        return this.val;
    }

    flatMap<T2, E2>(mapper: (val: T) => Err<E2>): Err<E2>;
    flatMap<T2>(mapper: (val: T) => Ok<T2>): Ok<FlattenResults<T2>>;
    flatMap<T2, E2>(mapper: (val: T) => any): any {
        return recursiveUnwrap(mapper(this.val));
    }
}

type FlattenResults<T> = {
    0: T;
    1: T extends BaseResult<infer U, any> ? FlattenResults<U> : never;
}[T extends BaseResult<any, any> ? 1 : 0];

export type Result<T, E> = (Ok<T> | Err<E>) & BaseResult<T, E>;

export type ResultOkType<T extends Result<any, any>> = T extends Result<infer U, any> ? U : never;
export type ResultErrType<T extends Result<any, any>> = T extends Result<any, infer U> ? U : never;

export type ResultOkTypes<T extends Result<any, any>[]> = {
    [key in keyof T]: T[key] extends Result<infer U, any> ? U : never;
};
export type ResultErrTypes<T extends Result<any, any>[]> = {
    [key in keyof T]: T[key] extends Result<any, infer U> ? U : never;
};

export namespace Result {
    /**
     * Parse a set of `Result`s, returning an array of all `Ok` values.
     * Short circuits with the first `Err` found, if any
     */
    export function all<T extends Result<any, any>[]>(
      ...results: T
    ): Result<ResultOkTypes<T>, ResultErrTypes<T>[number]> {
        const okResult = [];
        for (let result of results) {
            if (result.ok) {
                okResult.push(result.val);
            } else {
                return result as Err<ResultErrTypes<T>[number]>;
            }
        }

        return new Ok(okResult as ResultOkTypes<T>);
    }

    /**
     * Parse a set of `Result`s, short-circuits when an input value is `Ok`.
     * If no `Ok` is found, returns an `Err` containing the collected error values
     */
    export function any<T extends Result<any, any>[]>(
      ...results: T
    ): Result<ResultOkTypes<T>[number], ResultErrTypes<T>> {
        const errResult = [];

        // short-circuits
        for (const result of results) {
            if (result.ok) {
                return result as Ok<ResultOkTypes<T>[number]>;
            } else {
                errResult.push(result.val);
            }
        }

        // it must be a Err
        return new Err(errResult as ResultErrTypes<T>);
    }

    /**
     * Wrap an operation that may throw an Error (`try-catch` style) into checked exception style
     * @param op The operation function
     */
    export function wrap<T, E = unknown>(op: () => T): Result<T, E> {
        try {
            return new Ok(op());
        } catch (e) {
            return new Err<E>(e);
        }
    }

    /**
     * Wrap an async operation that may throw an Error (`try-catch` style) into checked exception style
     * @param op The operation function
     */
    export function wrapAsync<T, E = unknown>(op: () => Promise<T>): Promise<Result<T, E>> {
        try {
            return op().then(val => new Ok(val)).catch(e => new Err(e));
        } catch (e) {
            return Promise.resolve(new Err(e));
        }
    }
}

function toString(val: unknown): string {
    let value = String(val);
    if (value === '[object Object]') {
        try {
            value = JSON.stringify(val);
        } catch {
        }
    }
    return value;
}

const x = Result.all(Ok(3) as Result<number, string>, Err(5) as Result<4, 5>);
