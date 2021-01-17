# ts-results

A typescript implementation of Rust's [Result](https://doc.rust-lang.org/std/result/)
and [Option](https://doc.rust-lang.org/std/option/) objects.

Brings compile-time error checking and optional values to typescript.

## Contents

-   [Installation](#installation)
-   [Example](#example)
    -   [Result Example](#result-example)
    -   [Option Example](#option-example)
-   [Usage](#usage)
    -   [Creation](#creation)
    -   [Type Safety](#type-safety)
    -   [Unwrap](#unwrap)
    -   [Expect](#expect)
    -   [Map, MapErr](#map-and-maperr)
    -   [Else](#else)
    -   [UnwrapOr](#unwrapor)
    -   [Empty](#empty)
    -   [Combining Results](#combining-results)
        -   [Result.all](#result-all)
        -   [Result.any](#result-any)
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
$ npm install ts-results
```

or

```bash
$ yarn add ts-results
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
import { Ok, Err, Result } from 'ts-results';

function readFile(path: string): Result<string, 'invalid path'> {
    if (existsSync(path)) {
        return new Ok(readFileSync(path)); // new is optional here
    } else {
        return new Err('invalid path'); // new is optional here
    }
}

// Typescript now forces you to check whether you have a valid result at compile time.
const result = readFile('test.txt');
if (result.ok) {
    // text contains the file's content
    const text = result.val;
} else {
    // err equals 'invalid path'
    const err = result.val;
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
import { Option, Some, None } from 'ts-results';

declare function getLoggedInUsername(): Option<string>;

declare function getImageForUsername(username: string): Option<string>;

function getLoggedInImage(): Option<string> {
    return getLoggedInUsername().andThen(getImageForUsername);
}

const optionalUrl = getLoggedInImage().map((url) => new URL(stringUrl));
console.log(optionalUrl); // Some(URL('...'))

// To extract the value, do this:
if (optionalUrl.some) {
    const url: URL = optionalUrl.val;
}
```

## Usage

```typescript
import { Result, Err, Ok } from 'ts-results';
```

#### Creation

```typescript
let okResult: Result<number, Error> = Ok(10);
let okResult2 = Ok<number, Error>(10); // Exact same as above

let errorResult: Result<number, Error> = Ok(new Error('bad number!'));
let errorResult2 = Ok<number, Error>(new Error('bad number!')); // Exact same as above
```

#### Type Safety

```typescript
let result = Ok<number, Error>(1);
if (result.ok) {
    // Typescript knows that result.val is a number because result.ok was true
    let number = result.val + 1;
} else {
    // Typescript knows that result.val is an Error because result.ok was false
    console.error(result.val.message);
}

if (result.err) {
    // Typescript knows that result.val is an Error because result.err was true
    console.error(result.val.message);
} else {
    // Typescript knows that result.val is a number because result.err was false
    let number = result.val + 1;
}
```

#### Unwrap

```typescript
let goodResult = new Ok(1);
let badResult = new Err(new Error('something went wrong'));

goodResult.unwrap(); // 1
badResult.unwrap(); // throws Error("something went wrong")
```

#### Expect

```typescript
let goodResult = Ok<number, Error>(1);
let badResult = Err<number, Error>(new Error('something went wrong'));

goodResult.expect('goodResult should be a number'); // 1
badResult.expect('badResult should be a number'); // throws Error("badResult should be a number - Error: something went wrong")
```

#### Map and MapErr

```typescript
let goodResult = Ok(1);
let badResult = Err(new Error('something went wrong'));

goodResult.map((num) => num + 1).unwrap(); // 2
badResult.map((num) => num + 1).unwrap(); // throws Error("something went wrong")

goodResult
    .map((num) => num + 1)
    .mapErr((err) => new Error('mapped'))
    .unwrap(); // 2
badResult
    .map((num) => num + 1)
    .mapErr((err) => new Error('mapped'))
    .unwrap(); // throws Error("mapped")
```

#### Else

Deprecated in favor of unwrapOr

#### UnwrapOr

```typescript
let goodResult = Ok(1);
let badResult = Err(new Error('something went wrong'));

goodResult.unwrapOr(5); // 1
badResult.unwrapOr(5); // 5
```

#### Empty

```typescript
function checkIsValid(isValid: boolean): Result<void, Error> {
    if (isValid) {
        return Ok.EMPTY;
    } else {
        return new Err(new Error('Not valid'));
    }
}
```

#### Combining Results

`ts-results` has two helper functions for operating over n `Result` objects.

##### Result.all

Either returns all of the `Ok` values, or the first `Err` value

```typescript
let pizzaResult: Result<Pizza, GetPizzaError> = getPizzaSomehow();
let toppingsResult: Result<Toppings, GetToppingsError> = getToppingsSomehow();

let result = Result.all(pizzaResult, toppingsResult); // Result<[Pizza, Toppings], GetPizzaError | GetToppingsError>

let [pizza, toppings] = result.unwrap(); // pizza is a Pizza, toppings is a Toppings.  Could throw GetPizzaError or GetToppingsError.
```

##### Result.any

Either returns the first `Ok` value, or all `Err` values

```typescript
let url1: Result<string, Error1> = attempt1();
let url2: Result<string, Error2> = attempt2();
let url3: Result<string, Error3> = attempt3();

let result = Result.any(url1, url2, url3); // Result<string, Error1 | Error2 | Error3>

let url = result.unwrap(); // At least one attempt gave us a successful url
```

## Usage with rxjs

#### resultMap

Allows you to do the same actions as the normal [rxjs map](http://reactivex.io/documentation/operators/map.html)
operator on a stream of Result objects.

```typescript
import { of, Observable } from 'rxjs';
import { Ok, Err, Result } from 'ts-results';
import { resultMap } from 'ts-results/rxjs-operators';

const obs$: Observable<Result<number, Error>> = of(Ok(5), Err('uh oh'));

const greaterThanZero = obs$.pipe(
    resultMap((number) => number > 0), // Doubles the value
); // Has type Observable<Result<boolean, 'uh oh'>>

greaterThanZero.subscribe((result) => {
    if (result.ok) {
        console.log('Was greater than zero: ' + result.val);
    } else {
        console.log('Got Error Message: ' + result.val);
    }
});

// Logs the following:
// Got number: 10
// Got Error Message: uh oh
```

#### resultMapErr

```typescript
import { resultMapErr } from 'ts-results/rxjs-operators';
```

Behaves exactly the same as [resultMap](#resultmap), but maps the error value.

#### resultMapTo

```typescript
import { resultMapTo } from 'ts-results/rxjs-operators';
```

Behaves the same as [resultMap](#resultmap), but takes a value instead of a function.

#### resultMapErrTo

```typescript
import { resultMapErrTo } from 'ts-results/rxjs-operators';
```

Behaves the same as [resultMapErr](#resultmaperr), but takes a value instead of a function.

#### elseMap

Allows you to turn a stream of Result objects into a stream of values, transforming any errors into a value.

Similar to calling the [else](#else) function, but works on a stream of Result objects.

```typescript
import { of, Observable } from 'rxjs';
import { Ok, Err, Result } from 'ts-results';
import { elseMap } from 'ts-results/rxjs-operators';

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
import { elseMapTo } from 'ts-results/rxjs-operators';
```

Behaves the same as [elseMap](#elsemap), but takes a value instead of a function.

#### resultSwitchMap and resultMergeMap

Allows you to do the same actions as the
normal [rxjs switchMap](https://www.learnrxjs.io/operators/transformation/switchmap.html)
and [rxjs switchMap](https://www.learnrxjs.io/operators/transformation/mergemap.html) operator on a stream of Result
objects.

Merging or switching from a stream of `Result<T, E>` objects onto a stream of `<T2>` objects turns the stream into a
stream of `Result<T2, E>` objects.

Merging or switching from a stream of `Result<T, E>` objects onto a stream of `Result<T2, E2>` objects turn the stream
into a stream of `Result<T2, E | T2>` objects.

```typescript
import { of, Observable } from 'rxjs';
import { Ok, Err, Result } from 'ts-results';
import { resultMergeMap } from 'ts-results/rxjs-operators';

const obs$: Observable<Result<number, Error>> = of(new Ok(5), new Err(new Error('uh oh')));

const obs2$: Observable<Result<string, CustomError>> = of(new Ok('hi'), new Err(new CustomError('custom error')));

const test$ = obs$.pipe(
    resultMergeMap((number) => {
        console.log('Got number: ' + number);

        return obs2$;
    }),
); // Has type Observable<Result<string, CustomError | Error>>

test$.subscribe((result) => {
    if (result.ok) {
        console.log('Got string: ' + result.val);
    } else {
        console.log('Got error: ' + result.val.message);
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
import { Ok, Err, Result } from 'ts-results';
import { filterResultOk } from 'ts-results/rxjs-operators';

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
import { Ok, Err, Result } from 'ts-results';
import { filterResultOk } from 'ts-results/rxjs-operators';

const obs$: Observable<Result<number, Error>> = of(new Ok(5), new Err(new Error('uh oh')));

const test$ = obs$.pipe(filterResultOk()); // Has type Observable<number>

test$.subscribe((result) => {
    console.log('Got number: ' + result);
});

// Logs the following:
// Got number: 5
```
