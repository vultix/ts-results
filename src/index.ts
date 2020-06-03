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
 * pub fn into_ok(self) -> T
 */

// This interface is used to inherit document
interface Base<T, E> {
    /** `true` when the result is Ok */ readonly ok: boolean;
    /** `true` when the result is Err */ readonly err: boolean;
    /**
     * Returns the contained `Ok` value.
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
    // Suggestion: Rename to unwrapOr
    /**
     * Returns the contained `Ok` value or a provided default.
     */
    else<T2>(val: T2): T | T2;
    /**
     * Calls `op` if the result is `Ok`, otherwise returns the `Err` value of self.
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
/**
 * Contains the error value
 */
// @ts-expect-error Duplicate identifier 'Err'.ts(2300)
export declare function Err<E>(val: E): Err<E>;
@callable
// @ts-expect-error Duplicate identifier 'Err'.ts(2300)
export class Err<E> implements Base<never, E> {
    /** An empty Err */
    static readonly EMPTY = new Err<void>(undefined);

    readonly ok = false;
    readonly err = true;

    [Symbol.iterator](): Iterator<never, never, any> {
        return {
            next(): IteratorResult<never, never> {
                return { done: true, value: undefined! };
            },
        };
    }
    constructor(public readonly val: E) {}

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
    andThen<T2, E2>(op: (val: never) => Result<T2, E2>): Err<E> {
        return this;
    }
    mapErr<E2>(mapper: (err: E) => E2): Err<E2> {
        return new Err(mapper(this.val));
    }
}

// @ts-expect-error Duplicate identifier 'Ok'.ts(2300)
export declare function Ok<T>(val: T): Ok<T>;
@callable
// @ts-expect-error Duplicate identifier 'Ok'.ts(2300)
export class Ok<T> implements Base<T, never> {
    static readonly EMPTY = new Ok<void>(undefined);

    readonly ok = true;
    readonly err = false;

    [Symbol.iterator](): T extends Iterable<infer U> ? Iterator<U> : never {
        // @ts-ignore
        return this.val[Symbol.iterator]();
    }
    constructor(public readonly val: T) {}
    else(_val: unknown): T {
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
}

export type Result<T, E> = (Ok<T> | Err<E>) & Base<T, E>;

export type ResultOkType<T extends Result<any, any>> = T extends Result<infer U, any> ? U : never;
export type ResultErrType<T extends Result<any, any>> = T extends Result<any, infer U> ? U : never;
// Suggest to rename to all
/**
 * Parse a set of `Result`s, short-circuits when an input value is `Err`.
 */
export function Results(): Result<[], never>;
export function Results<T1, E1>(result1: Result<T1, E1>): Result<[T1], E1>;
export function Results<T1, E1, T2, E2>(result1: Result<T1, E1>, result2: Result<T2, E2>): Result<[T1, T2], E1 | E2>;
export function Results<T1, E1, T2, E2, T3, E3>(result1: Result<T1, E1>, result2: Result<T2, E2>, result3: Result<T3, E3>): Result<[T1, T2, T3], E1 | E2 | E3>;
export function Results<T1, E1, T2, E2, T3, E3, T4, E4>(result1: Result<T1, E1>, result2: Result<T2, E2>, result3: Result<T3, E3>, result4: Result<T4, E4>): Result<[T1, T2, T3, T4], E1 | E2 | E3 | E4>;
export function Results<T, E>(...results: Result<T, E>[]): Result<T[], E>;
export function Results(...results: Result<any, any>[]): Result<any[], any> {
    const okResult = [];
    for (let result of results) {
        if (result.ok) {
            okResult.push(result.val);
        } else {
            return result.val;
        }
    }
    return new Ok(okResult);
}
/**
 * Parse a set of `Result`s, short-circuits when an input value is `Ok`.
 */
export function any(): Result<void, never>;
export function any<T1, E1>(result1: Result<T1, E1>): Result<T1, E1>;
export function any<T1, E1, T2, E2>(result1: Result<T1, E1>, result2: Result<T2, E2>): Result<T1 | T2, E1 | E2>;
export function any<T1, E1, T2, E2, T3, E3>(result1: Result<T1, E1>, result2: Result<T2, E2>, result3: Result<T3, E3>): Result<T1 | T2 | T3, E1 | E2 | E3>;
export function any<T1, E1, T2, E2, T3, E3, T4, E4>(result1: Result<T1, E1>, result2: Result<T2, E2>, result3: Result<T3, E3>, result4: Result<T4, E4>): Result<T1 | T2 | T3 | T4, E1 | E2 | E3 | E4>;
export function any<T, E>(...results: Result<T, E>[]): Result<T, E>;
export function any(...results: Result<any, any>[]): Result<any, any> {
    // short-circuits
    for (const result of results) if (result.ok) return result;
    if (results.length === 0) return Ok.EMPTY;
    // it must be a Err
    return results[results.length - 1];
}
function toString(val: unknown) {
    let value = "".toString.call(val);
    if (value === "[object Object]") {
        try {
            value = JSON.stringify(value);
        } catch {}
    }
    return value;
}
function callable(constructor: any) {
    return new Proxy(constructor, {
        apply(target: any, thisArg: any, argArray?: any) {
            return new target(...argArray);
        },
    });
}
/**
 * Wrap a operation that may throw an Error (`try-catch` style) into checked exception style
 * @param op The operation function
 */
export function wrap<T>(op: () => T) {
    try {
        return new Ok(op());
    } catch (e) {
        return new Err<unknown>(e);
    }
}
