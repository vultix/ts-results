# 3.4.0

-   Fixed some type errors that prevented the package from being built with recent
    TypeScript versions
-   Fixed ESM compatibility so that client code can use named imports without resorting
    to workarounds (fixes https://github.com/vultix/ts-results/issues/37)

# 3.3.0
Big thank you to [@petehunt](https://github.com/petehunt) for all his work adding stack traces to `Err`.

-   Added a `stack` property to all `Err` objects.  Can be used to pull a stack trace
-   Added `toOption` and `toResult` methods for converting between `Option` and `Result` objects

# v3.2.1

-   Fix regression found in [Issue#24](https://github.com/vultix/ts-results/issues/24)

# v3.2.0

-   Fixes for Typescript 4.2

# v3.1.0

Big thank you to [@petehunt](https://github.com/petehunt) for all his work adding the `Option` type.

### New Features

-   Added new `Option<T>`, `Some<T>`, and `None` types!

    -   You should feel at home if you're used to working with Rust:

        ```typescript
        import { Option, Some, None } from 'ts-results';

        const optionalNum: Option<number> = Some(3).map((num) => num * 2);

        if (optionalNum.some) {
            console.log(optionalNum.val === 6); // prints `true`
        }

        const noneNum: Option<number> = None;

        if (noneNum.some) {
            // You'll never get in here
        }
        ```

-   Added new `Option.isOption` and `Result.isResult` helper functions.

### Other Improvements

-   Got to 100% test coverage on all code!
-   Removed uses of `@ts-ignore`

# v3.0.0

Huge shout out to [@Jack-Works](https://github.com/Jack-Works) for helping get this release out. Most of the work was
his, and it would not have happened without him.

### New Features

-   `Ok<T>` and `Err<T>` are now callable without `new`!
-   No longer breaks when calling from node
-   Tree-shakable when using tools like rollup or webpack
-   Fully unit tested
-   Added these helper functions:
    -   `Result.all(...)` - Same as `Results` from previous releases. Collects all `Ok` values, or returns the first `Err`
        value.
    -   `Results.any(...)` - Returns the first `Ok` value, or all of the `Err` values.
    -   `Result.wrap<T, E>(() => ...)` - Wraps an operation that may throw an error, uses try / catch to return
        a `Result<T, E>`
    -   `Result.wrapAsync<T, E>(() => ...)` - Same as the above, but async
-   Deprecated `else` in favor of `unwrapOr` to prefer api parity with Rust

# v2.0.1

### New Features

-   **core:** Added `reaonly static EMPTY: Ok<void>;` to `Ok` class.
-   **core:** Added `reaonly static EMPTY: Err<void>;` to `Err` class.

# v2.0.0

This release features a complete rewrite of most of the library with one focus in mind: simpler types.

The entire library now consists of only the following:

-   Two classes: `Ok<T>` and `Err<E>`.
-   A `Result<T, E>` type that is a simple or type between the two classes.
-   A simple `Results` function that allows combining multiple results.

### New Features

-   **core:** much simpler Typescript types
-   **rxjs:** added new `filterResultOk` and `filterResultErr` operators
-   **rxjs:** added new `resultMapErrTo` operator

### Breaking Changes

-   **core:** `Err` and `Ok` now require `new`:
    -   **Before:** `let result = Ok(value); let error = Err(message);`
    -   **After:** `let result = new Ok(value); let error = new Err(message);`
-   **core:** `map` function broken into two functions: `map` and `mapErr`
    -   **before**: `result.map(value => "new value", error => "new error")`
    -   **after**: `result.map(value => "newValue").mapError(error => "newError")`
-   **rxjs:** `resultMap` operator broken into two operators: `resultMap` and `resultMapErr`
    -   **before**: `obs.pipe(resultMap(value => "new value", error => "new error"))`
    -   **after**: `result.pipe(resultMap(value => "newValue"), resultMapError(error => "newError"))`
