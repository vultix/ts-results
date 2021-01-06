interface BaseOption<T>
    extends Iterable<T extends Iterable<infer U> ? U : never> {
    /** `true` when the Option is Some */ readonly some: boolean;
    /** `true` when the Option is None */ readonly none: boolean;

    /**
     * Returns the contained `Some` value, if exists.  Throws an error if not.
     * @param msg the message to throw if no Some value.
     */
    expect(msg: string): T;

    /**
     * Returns the contained `Some` value.
     * Because this function may throw, its use is generally discouraged.
     * Instead, prefer to handle the `None` case explicitly.
     *
     * Throws if the value is `None`.
     */
    unwrap(): T;

    /**
     * Returns the contained `Some` value or a provided default.
     *
     *  (This is the `unwrap_or` in rust)
     */
    unwrapOr<T2>(val: T2): T | T2;

    /**
     * Calls `mapper` if the Option is `Some`, otherwise returns `None`.
     * This function can be used for control flow based on `Option` values.
     */
    andThen<T2>(mapper: (val: T) => Option<T2>): Option<T2>;

    /**
     * Maps a `Option<T, E>` to `Option<U, E>` by applying a function to a contained `Some` value,
     * leaving a `None` value untouched.
     *
     * This function can be used to compose the Options of two functions.
     */
    map<U>(mapper: (val: T) => U): Option<U>;
}

const SENTINEL = Symbol();

/**
 * Contains the None value
 */
// @ts-ignore
export class None implements BaseOption<never> {
    /** An empty None */
    // @ts-ignore
    static readonly EMPTY = new None(SENTINEL);

    readonly some!: false;
    readonly none!: true;

    [Symbol.iterator](): Iterator<never, never, any> {
        return {
            next(): IteratorResult<never, never> {
                return { done: true, value: undefined! };
            },
        };
    }

    constructor() {
        if (arguments[0] !== SENTINEL) {
            throw new Error(
                "Option objects should not be constructed with new"
            );
        }

        this.some = false;
        this.none = true;
    }

    unwrapOr<T2>(val: T2): T2 {
        return val;
    }

    expect(msg: string): never {
        throw new Error(`${msg}`);
    }

    unwrap(): never {
        throw new Error(`Tried to unwrap None`);
    }

    map<T2>(_mapper: (val: never) => T2): None {
        return this;
    }

    andThen<T2>(op: (val: never) => Option<T2>): None {
        return this;
    }
}

export const none = None.EMPTY;
export function some<T>(value: T): Some<T> {
    // @ts-ignore
    return new Some(value, SENTINEL);
}

/**
 * Contains the success value
 */
// @ts-ignore
export class Some<T> implements BaseOption<T> {
    // @ts-ignore
    static readonly EMPTY = new Some<void>(undefined, SENTINEL);

    readonly some!: true;
    readonly none!: false;
    readonly val!: T;

    /**
     * Helper function if you know you have an Some<T> and T is iterable
     */
    [Symbol.iterator](): Iterator<T extends Iterable<infer U> ? U : never> {
        const obj = Object(this.val) as Iterable<any>;

        return Symbol.iterator in obj
            ? obj[Symbol.iterator]()
            : {
                  next(): IteratorResult<never, never> {
                      return { done: true, value: undefined! };
                  },
              };
    }

    constructor(val: T) {
        if (arguments[1] !== SENTINEL) {
            throw new Error(
                "Option objects should not be constructed with new"
            );
        }

        this.some = true;
        this.none = false;
        this.val = val;
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

    map<T2>(mapper: (val: T) => T2): Some<T2> {
        // @ts-ignore
        return new Some(mapper(this.val), SENTINEL);
    }

    andThen<T2>(mapper: (val: T) => Option<T2>): Option<T2> {
        return mapper(this.val);
    }

    /**
     * Returns the contained `Some` value, but never throws.
     * Unlike `unwrap()`, this method doesn't throw and is only callable on an Some<T>
     *
     * Therefore, it can be used instead of `unwrap()` as a maintainability safeguard
     * that will fail to compile if the type of the Option is later changed to a None that can actually occur.
     *
     * (this is the `into_Some()` in rust)
     */
    safeUnwrap(): T {
        return this.val;
    }
}

export type Option<T> = (Some<T> | None) & BaseOption<T>;

export type OptionSomeType<T extends Option<any>> = T extends Option<infer U>
    ? U
    : never;

export type OptionSomeTypes<T extends Option<any>[]> = {
    [key in keyof T]: T[key] extends Option<infer U> ? U : never;
};

/**
 * Parse a set of `Option`s, returning an array of all `Some` values.
 * Short circuits with the first `None` found, if any
 */
export function allOptions<T extends Option<any>[]>(
    ...options: T
): Option<OptionSomeTypes<T>> {
    const someOption = [];
    for (let option of options) {
        if (option.some) {
            someOption.push(option.val);
        } else {
            return option as None;
        }
    }

    return some(someOption as OptionSomeTypes<T>);
}

/**
 * Parse a set of `Option`s, short-circuits when an input value is `Some`.
 * If no `Some` is found, returns `None`.
 */
export function anyOption<T extends Option<any>[]>(
    ...options: T
): Option<OptionSomeTypes<T>[number]> {
    // short-circuits
    for (const option of options) {
        if (option.some) {
            return option as Some<OptionSomeTypes<T>[number]>;
        } else {
            return option as None;
        }
    }

    // it must be None
    return none;
}

export function isOption<T = any>(value: any): value is Option<T> {
    return value instanceof Some || value instanceof None;
}
