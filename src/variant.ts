type MatcherMap<T extends string, Args extends unknown[], R> = {
    [key in T]: (...args: Args) => R;
};

type AnythingMatcherMap<R> = { _(): R };

/**
 * The Variant class factory implements the `.match` and `.tap` methods that allow to define logic
 * that runs depending of the type for each type within a union of different Variant types. It
 * allows you to do pattern matching as long as each type extends from Variant
 */
export const Variant = <T extends string>(type: T) =>
    class<Args extends unknown[] = []> {
        readonly args: Args;
        readonly type: T;

        constructor(...args: Args) {
            this.args = args;
            this.type = type;
        }

        /**
         * Define handlers for each of the possible variants this variant could be, allows for a `_`
         * wildcard to handle all remaining variants. Returns the value the matching handler returns.
         *
         * ```ts
         * declare class Some<T> extends Variant('Some')<[T]>;
         * declare class None extends Variant('None')<[]>;
         *
         * declare const option: Some<number> | None;
         * const double = option.match({
         *     Some: (x) => x * 2,
         *     None: () => 0
         * })
         * const isSome = shape.match({
         *     Some: () => true,
         *     // matches any other variant
         *     _: () => false
         * })
         * ```
         */
        match<R>(matcher: MatcherMap<T, Args, R> | AnythingMatcherMap<R>): R;
        match<R>(matcher: MatcherMap<T, Args, R> & AnythingMatcherMap<R>): R {
            return this.type in matcher ? matcher[this.type](...this.args) : matcher._();
        }

        /**
         * Same as `match` but should be used instead to fire side effects that only run if a handler
         * exists for the given variant, not all variants need to have a handler defined.
         * Does not return a value.
         *
         * ```ts
         * declare class Some<T> extends Variant('Some')<[T]>;
         * declare class None extends Variant('None')<[]>;
         *
         * declare const option: Some<number> | None;
         * option.tap({
         *     None() {
         *         console.log("It's empty!");
         *     }
         *    // If the variant is anything else nothing happens
         * });
         * ```
         */
        tap(matcher: Partial<MatcherMap<T, Args, void>>): this {
            matcher[this.type]?.(...this.args);
            return this;
        }
    };
