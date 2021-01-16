# v3.0.0

Huge shout out to [@Jack-Works](https://github.com/Jack-Works) for helping get this release out.
Most of the work was his, and it would not have happened without him.

### New Features

-   `Ok<T>` and `Err<T>` are now callable without `new`!
-   No longer breaks when calling from node
-   Tree-shakable when using tools like rollup or webpack
-   Fully unit tested
-   Added these helper functions:
    -   `Result.all(...)` - Same as `Results` from previous releases. Collects all `Ok` values, or returns the first `Err` value.
    -   `Results.any(...)` - Returns the first `Ok` value, or all of the `Err` values.
    -   `Result.wrap<T, E>(() => ...)` - Wraps an operation that may throw an error, uses try / catch to return a `Result<T, E>`
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
