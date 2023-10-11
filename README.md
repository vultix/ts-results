# ts-results-es

A typescript implementation of Rust's [Result](https://doc.rust-lang.org/std/result/)
and [Option](https://doc.rust-lang.org/std/option/) objects.

Brings compile-time error checking and optional values to typescript.

## Relationship with ts-results

This package is a friendly fork of the excellent https://github.com/vultix/ts-results/
created due to time constraints on our (Lune's) side – we needed a package
available with some fixes.

Notable changes compared to the original package:

* Added ESM compatibility
* `Option` gained extra methods: `mapOr()`, `mapOrElse()`, `or()`,
  `orElse()`
* `Result` also gained extra methods: `mapOr()`, `mapOrElse()`,
  `expectErr()`, `or()`, `orElse()`
* `Ok` and `Err` no longer have the `val` property – it's `Ok.value` and `Err.error` now
* There is `Some.value` which replaced `Some.val`
* Boolean flags were replaced with methods:
  * `Option.some` -> `Option.isSome()`
  * `Option.none` -> `Option.isNone()`
  * `Result.ok` -> `Result.isOk()`
  * `Result.err` -> `Result.isErr()`

We'll try to get the changes merged into the upstream package so that this fork
can become obsolete.

## Contents

-   [Installation](#installation)
-   [Example](#example)
    -   [Result Example](#result-example)
    -   [Option Example](#option-example)
-   [Usage](#usage)
-   [Usage with rxjs](#usage-with-rxjs)
    -   [resultMap](#resultmap)
    -   [resultMapErr](#resultmaperr)
    -   [resultMapTo](#resultmapto)
    -   [resultMapErrTo](#resultmapto)
    -   [elseMap](#elsemap)
    -   [elseMapTo](#elsemapto)
    -   [resultSwitchMap, resultMergeMap](#resultswitchmap-and-resultmergemap)
    -   [filterResultOk](#filterresultok)
    -   [filterResultErr](#filterresulterr)

## Installation

```bash
$ npm install ts-results-es
```

or

```bash
$ yarn add ts-results-es
```

## Example

### Result Example

Convert this:

```typescript
import { existsSync, readFileSync } from 'fs';

function readFile(path: string): string {
    if (existsSync(path)) {
        return readFileSync(path);
    } else {
        // Callers of readFile have no way of knowing the function can fail
        throw new Error('invalid path');
    }
}

// This line may fail unexpectedly without warnings from typescript
const text = readFile('test.txt');
```

To this:

```typescript
import { existsSync, readFileSync } from 'fs';
import { Ok, Err, Result } from 'ts-results-es';

function readFile(path: string): Result<string, 'invalid path'> {
    if (existsSync(path)) {
        return new Ok(readFileSync(path)); // new is optional here
    } else {
        return new Err('invalid path'); // new is optional here
    }
}

// Typescript now forces you to check whether you have a valid result at compile time.
const result = readFile('test.txt');
if (result.isOk()) {
    // text contains the file's content
    const text = result.value;
} else {
    // err equals 'invalid path'
    const err = result.error;
}
```

### Option Example

Convert this:

```typescript
declare function getLoggedInUsername(): string | undefined;

declare function getImageURLForUsername(username: string): string | undefined;

function getLoggedInImageURL(): string | undefined {
    const username = getLoggedInUsername();
    if (!username) {
        return undefined;
    }

    return getImageURLForUsername(username);
}

const stringUrl = getLoggedInImageURL();
const optionalUrl = stringUrl ? new URL(stringUrl) : undefined;
console.log(optionalUrl);
```

To this:

```typescript
import { Option, Some, None } from 'ts-results-es';

declare function getLoggedInUsername(): Option<string>;

declare function getImageForUsername(username: string): Option<string>;

function getLoggedInImage(): Option<string> {
    return getLoggedInUsername().andThen(getImageForUsername);
}

const optionalUrl = getLoggedInImage().map((url) => new URL(stringUrl));
console.log(optionalUrl); // Some(URL('...'))

// To extract the value, do this:
if (optionalUrl.some) {
    const url: URL = optionalUrl.value;
}
```

## Usage

See https://ts-results-es.readthedocs.io/en/latest/reference/api/index.html to see the API
reference.

## Usage with rxjs

#### resultMap

Allows you to do the same actions as the normal [rxjs map](http://reactivex.io/documentation/operators/map.html)
operator on a stream of Result objects.

```typescript
import { of, Observable } from 'rxjs';
import { Ok, Err, Result } from 'ts-results-es';
import { resultMap } from 'ts-results-es/rxjs-operators';

const obs$: Observable<Result<number, Error>> = of(Ok(5), Err('uh oh'));

const greaterThanZero = obs$.pipe(
    resultMap((number) => number > 0), // Doubles the value
); // Has type Observable<Result<boolean, 'uh oh'>>

greaterThanZero.subscribe((result) => {
    if (result.isOk()) {
        console.log('Was greater than zero: ' + result.value);
    } else {
        console.log('Got Error Message: ' + result.error);
    }
});

// Logs the following:
// Got number: 10
// Got Error Message: uh oh
```

#### resultMapErr

```typescript
import { resultMapErr } from 'ts-results-es/rxjs-operators';
```

Behaves exactly the same as [resultMap](#resultmap), but maps the error value.

#### resultMapTo

```typescript
import { resultMapTo } from 'ts-results-es/rxjs-operators';
```

Behaves the same as [resultMap](#resultmap), but takes a value instead of a function.

#### resultMapErrTo

```typescript
import { resultMapErrTo } from 'ts-results-es/rxjs-operators';
```

Behaves the same as [resultMapErr](#resultmaperr), but takes a value instead of a function.

#### elseMap

Allows you to turn a stream of Result objects into a stream of values, transforming any errors into a value.

Similar to calling the [else](#else) function, but works on a stream of Result objects.

```typescript
import { of, Observable } from 'rxjs';
import { Ok, Err, Result } from 'ts-results-es';
import { elseMap } from 'ts-results-es/rxjs-operators';

const obs$: Observable<Result<number, Error>> = of(Ok(5), Err(new Error('uh oh')));

const doubled = obs$.pipe(
    elseMap((err) => {
        console.log('Got error: ' + err.message);

        return -1;
    }),
); // Has type Observable<number>

doubled.subscribe((number) => {
    console.log('Got number: ' + number);
});

// Logs the following:
// Got number: 5
// Got error: uh oh
// Got number: -1
```

#### elseMapTo

```typescript
import { elseMapTo } from 'ts-results-es/rxjs-operators';
```

Behaves the same as [elseMap](#elsemap), but takes a value instead of a function.

#### resultSwitchMap and resultMergeMap

Allows you to do the same actions as the
normal [rxjs switchMap](https://www.learnrxjs.io/operators/transformation/switchmap.html)
and [rxjs mergeMap](https://www.learnrxjs.io/operators/transformation/mergemap.html) operator on a stream of Result
objects.

Merging or switching from a stream of `Result<T, E>` objects onto a stream of `<T2>` objects turns the stream into a
stream of `Result<T2, E>` objects.

Merging or switching from a stream of `Result<T, E>` objects onto a stream of `Result<T2, E2>` objects turn the stream
into a stream of `Result<T2, E | T2>` objects.

```typescript
import { of, Observable } from 'rxjs';
import { Ok, Err, Result } from 'ts-results-es';
import { resultMergeMap } from 'ts-results-es/rxjs-operators';

const obs$: Observable<Result<number, Error>> = of(new Ok(5), new Err(new Error('uh oh')));

const obs2$: Observable<Result<string, CustomError>> = of(new Ok('hi'), new Err(new CustomError('custom error')));

const test$ = obs$.pipe(
    resultMergeMap((number) => {
        console.log('Got number: ' + number);

        return obs2$;
    }),
); // Has type Observable<Result<string, CustomError | Error>>

test$.subscribe((result) => {
    if (result.isOk()) {
        console.log('Got string: ' + result.value);
    } else {
        console.log('Got error: ' + result.error.message);
    }
});

// Logs the following:
// Got number: 5
// Got string: hi
// Got error: custom error
// Got error: uh oh
```

#### filterResultOk

Converts an `Observable<Result<T, E>>` to an `Observble<T>` by filtering out the Errs and mapping to the Ok values.

```typescript
import { of, Observable } from 'rxjs';
import { Ok, Err, Result } from 'ts-results-es';
import { filterResultOk } from 'ts-results-es/rxjs-operators';

const obs$: Observable<Result<number, Error>> = of(new Ok(5), new Err(new Error('uh oh')));

const test$ = obs$.pipe(filterResultOk()); // Has type Observable<number>

test$.subscribe((result) => {
    console.log('Got number: ' + result);
});

// Logs the following:
// Got number: 5
```

#### filterResultErr

Converts an `Observable<Result<T, E>>` to an `Observble<T>` by filtering out the Oks and mapping to the error values.

```typescript
import { of, Observable } from 'rxjs';
import { Ok, Err, Result } from 'ts-results-es';
import { filterResultOk } from 'ts-results-es/rxjs-operators';

const obs$: Observable<Result<number, Error>> = of(new Ok(5), new Err(new Error('uh oh')));

const test$ = obs$.pipe(filterResultOk()); // Has type Observable<number>

test$.subscribe((result) => {
    console.log('Got number: ' + result);
});

// Logs the following:
// Got number: 5
```

## Publishing the package

The package is published manually right now.

Steps to publish:

1. Bump the version in `package.json` and `src/package.json` as needed
2. Update the CHANGELOG
3. Commit to Git in a single commit and add a tag: `git tag -a vX.X.X` (the tag description can be
   anything)
4. `npm run build && npm publish`
5. Push both the `master` branch and the new tag to GitHub
