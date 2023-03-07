import { toString } from './utils';
import { Option, None, Some } from './option';

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
    isOk(): this is OkImpl<T>;
    isErr(): this is ErrImpl<E>;

    /**
     * Returns the contained `Ok` value, if exists.  Throws an error if not.
     * @param msg the message to throw if no Ok value.
     */
    expect(msg: string): T;

    /**
     * Returns the contained `Ok` value, if does not exist.  Throws an error if it does.
     * @param msg the message to throw if Ok value.
     */
    expectErr(msg: string): E;

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
    andThen<T2>(mapper: (val: T) => Ok<T2>): Result<T2, E>;
    andThen<E2>(mapper: (val: T) => Err<E2>): Result<T, E | E2>;
    andThen<T2, E2>(mapper: (val: T) => Result<T2, E2>): Result<T2, E | E2>;
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

    /**
     *  Converts from `Result<T, E>` to `Option<T>`, discarding the error if any
     *
     *  Similar to rust's `ok` method
     */
    toOption(): Option<T>;
}

/**
 * Contains the error value
 */
export class ErrImpl<E> implements BaseResult<never, E> {
    /** An empty Err */
    static readonly EMPTY = new ErrImpl<void>(undefined);

    readonly error: E;

    private readonly _stack!: string;

    [Symbol.iterator](): Iterator<never, never, any> {
        return {
            next(): IteratorResult<never, never> {
                return { done: true, value: undefined! };
            },
        };
    }

    constructor(val: E) {
        this.error = val;
        if (!(this instanceof ErrImpl)) {
            return new ErrImpl(val);
        }


        const stackLines = new Error().stack!.split('\n').slice(2);
        if (stackLines && stackLines.length > 0 && stackLines[0].includes('ErrImpl')) {
            stackLines.shift();
        }

        this._stack = stackLines.join('\n');
    }

    isOk(): false {
        return false;
    }

    isErr(): this is ErrImpl<E> {
        return true;
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
        throw new Error(`${msg} - Error: ${toString(this.error)}\n${this._stack}`);
    }

    expectErr(_msg: string): E {
        return this.error
    }

    unwrap(): never {
        throw new Error(`Tried to unwrap Error: ${toString(this.error)}\n${this._stack}`);
    }

    map(_mapper: unknown): Err<E> {
        return this;
    }

    andThen(op: unknown): Err<E> {
        return this;
    }

    mapErr<E2>(mapper: (err: E) => E2): Err<E2> {
        return new Err(mapper(this.error));
    }

    toOption(): Option<never> {
        return None;
    }

    toString(): string {
        return `Err(${toString(this.error)})`;
    }

    get stack(): string | undefined {
        return `${this}\n${this._stack}`;
    }
}

// This allows Err to be callable - possible because of the es5 compilation target
export const Err = ErrImpl as typeof ErrImpl & (<E>(err: E) => Err<E>);
export type Err<E> = ErrImpl<E>;

/**
 * Contains the success value
 */
export class OkImpl<T> implements BaseResult<T, never> {
    static readonly EMPTY = new OkImpl<void>(undefined);

    readonly value: T;

    /**
     * Helper function if you know you have an Ok<T> and T is iterable
     */
    [Symbol.iterator](): Iterator<T extends Iterable<infer U> ? U : never> {
        const obj = Object(this.value) as Iterable<any>;

        return Symbol.iterator in obj
            ? obj[Symbol.iterator]()
            : {
                  next(): IteratorResult<never, never> {
                      return { done: true, value: undefined! };
                  },
              };
    }

    constructor(val: T) {
        this.value = val;
        if (!(this instanceof OkImpl)) {
            return new OkImpl(val);
        }
    }

    isOk(): this is OkImpl<T> {
        return true;
    }

    isErr(): false {
        return false;
    }

    /**
     * @see unwrapOr
     * @deprecated in favor of unwrapOr
     */
    else(_val: unknown): T {
        return this.value;
    }

    unwrapOr(_val: unknown): T {
        return this.value;
    }

    expect(_msg: string): T {
        return this.value;
    }

    expectErr(msg: string): never {
        throw new Error(msg);
    }

    unwrap(): T {
        return this.value;
    }

    map<T2>(mapper: (val: T) => T2): Ok<T2> {
        return new Ok(mapper(this.value));
    }

    andThen<T2>(mapper: (val: T) => Ok<T2>): Ok<T2>;
    andThen<E2>(mapper: (val: T) => Err<E2>): Result<T, E2>;
    andThen<T2, E2>(mapper: (val: T) => Result<T2, E2>): Result<T2, E2>;
    andThen<T2, E2>(mapper: (val: T) => Result<T2, E2>): Result<T2, E2> {
        return mapper(this.value);
    }

    mapErr(_mapper: unknown): Ok<T> {
        return this;
    }

    toOption(): Option<T> {
        return Some(this.value);
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
        return this.value;
    }

    toString(): string {
        return `Ok(${toString(this.value)})`;
    }
}

// This allows Ok to be callable - possible because of the es5 compilation target
export const Ok = OkImpl as typeof OkImpl & (<T>(val: T) => Ok<T>);
export type Ok<T> = OkImpl<T>;

export type Result<T, E> = Ok<T> | Err<E>;

export type ResultOkType<T extends Result<any, any>> = T extends Ok<infer U> ? U : never;
export type ResultErrType<T> = T extends Err<infer U> ? U : never;

export type ResultOkTypes<T extends Result<any, any>[]> = {
    [key in keyof T]: T[key] extends Result<infer U, any> ? ResultOkType<T[key]> : never;
};
export type ResultErrTypes<T extends Result<any, any>[]> = {
    [key in keyof T]: T[key] extends Result<infer U, any> ? ResultErrType<T[key]> : never;
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
            if (result.isOk()) {
                okResult.push(result.value);
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
            if (result.isOk()) {
                return result as Ok<ResultOkTypes<T>[number]>;
            } else {
                errResult.push(result.error);
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
            return new Err<E>(e as E);
        }
    }

    /**
     * Wrap an async operation that may throw an Error (`try-catch` style) into checked exception style
     * @param op The operation function
     */
    export function wrapAsync<T, E = unknown>(op: () => Promise<T>): Promise<Result<T, E>> {
        try {
            return op()
                .then((val) => new Ok(val))
                .catch((e) => new Err(e));
        } catch (e) {
            return Promise.resolve(new Err(e as E));
        }
    }

    export function isResult<T = any, E = any>(val: unknown): val is Result<T, E> {
        return val instanceof Err || val instanceof Ok;
    }
}
