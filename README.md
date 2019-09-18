# ts-results
A typescript implementation of [Rust's Result](https://doc.rust-lang.org/std/result/) object.  Brings compile-time error checking to typescript.

*Note: This is the documentation for the newly released `ts-results@2.0.0` with breaking changes.  To see breaking changes, go to [CHANGELOG.md](https://github.com/vultix/ts-results/blob/master/CHANGELOG.md)*
## Contents

* [Installation](#installation)
* [Example](#example)
* [Usage](#usage)
    * [Creation](#creation)
    * [Type Safety](#type-safety)
    * [Unwrap](#unwrap)
    * [Expect](#expect) 	
    * [Map, MapErr](#map-and-maperr)
    * [Else](#else)
    * [Empty](#empty)
    * [Combining Results](#combining-results)
* [Usage with rxjs](#usage-with-rxjs)
    * [resultMap](#resultmap)
    * [resultMapErr](#resultmaperr)
    * [resultMapTo](#resultmapto)
    * [resultMapErrTo](#resultmapto)
    * [elseMap](#elsemap)
    * [elseMapTo](#elsemapto)
    * [resultSwitchMap, resultMergeMap](#resultswitchmap-and-resultmergemap)
    * [filterResultOk](#filterresultok)
    * [filterResultErr](#filterresulterr)

## Installation
```bash
$ npm install ts-results
```
or
```bash
$ yarn install ts-results
```

## Example
Convert this:
```typescript
import {existsSync, readFileSync} from 'fs';

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
import {existsSync, readFileSync} from 'fs';
import {Ok, Err, Result} from 'ts-results';

function readFile(path: string): Result<string, 'invalid path'> {
    if (existsSync(path)) {
        return new Ok(readFileSync(path));
    } else {
        return new Err("invalid path");
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

## Usage
```typescript
import { Result, Err, Ok, Results } from 'ts-results';
```
#### Creation
```typescript
let okResult: Result<number, Error> = new Ok(10);
let okResult2 = Ok<number, Error>(10); // Exact same as above

let errorResult: Result<number, Error> = new Ok(new Error('bad number!'));
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
let badResult = new Err(new Error("something went wrong"));

goodResult.unwrap(); // 1
badResult.unwrap(); // throws Error("something went wrong")
```

#### Expect
```typescript
let goodResult = Ok<number, Error>(1);
let badResult = Err<number, Error>(new Error("something went wrong"));

goodResult.expect('goodResult should be a number'); // 1
badResult.expect('badResult should be a number'); // throws Error("badResult should be a number - Error: something went wrong")
```

#### Map and MapErr
```typescript
let goodResult = new Ok(1);
let badResult = new Err(new Error("something went wrong"));

goodResult.map(num => num + 1).unwrap(); // 2
badResult.map(num => num + 1).unwrap(); // throws Error("something went wrong")

goodResult.map(num => num + 1).mapErr(err => new Error('mapped')).unwrap(); // 2
badResult.map(num => num + 1).mapErr(err => new Error('mapped')).unwrap(); // throws Error("mapped")
```

#### Else
```typescript
let goodResult = new Ok(1);
let badResult = new Err(new Error("something went wrong"));

goodResult.else(5); // 1
badResult.else(5); // 5
```

#### Empty
```typescript
function checkIsValid(isValid: boolean): Result<void, Error> {
    if (isValid) {
        return Ok.EMPTY;
    } else {
        return new Err(new Error("Not valid"))
    }
}
```

#### Combining Results
There may be some cases where we have two or more separate `Result` objects and we want to do something with both values.
This is handled by using the `Results` function to combine them.

```typescript
let pizzaResult: Result<Pizza, GetPizzaError> = getPizzaSomehow();
let toppingsResult: Result<Toppings, GetToppingsError> = getToppingsSomehow();

let result = Results(pizzaResult, toppingsResult); // Result<[Pizza, Toppings], GetPizzaError | GetToppingsError>

let [pizza, toppings] = result.unwrap(); // pizza is a Pizza, toppings is a Toppings.  Could throw GetPizzaError or GetToppingsError.
``` 

## Usage with rxjs

#### resultMap 
Allows you to do the same actions as the normal [rxjs map](http://reactivex.io/documentation/operators/map.html) operator on a stream of Result objects.
```typescript
import {of, Observable} from 'rxjs';
import {Ok, Err, Result} from 'ts-results';
import {resultMap} from 'ts-results/rxjs-operators';

const obs$: Observable<Result<number, Error>> = of(new Ok(5), new Err('uh oh'));

const greaterThanZero = obs$.pipe(
  resultMap(number => number > 0), // Doubles the value
); // Has type Observable<Result<boolean, 'uh oh'>>

greaterThanZero.subscribe(result => {
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
import {resultMapErr} from 'ts-results/rxjs-operators';
```

Behaves exactly the same as [resultMap](#resultmap), but maps the error value.

#### resultMapTo
```typescript
import {resultMapTo} from 'ts-results/rxjs-operators';
```
Behaves the same as [resultMap](#resultmap), but takes a value instead of a function.

#### resultMapErrTo
```typescript
import {resultMapErrTo} from 'ts-results/rxjs-operators';
```
Behaves the same as [resultMapErr](#resultmaperr), but takes a value instead of a function.

#### elseMap
Allows you to turn a stream of Result objects into a stream of values, transforming any errors into a value.

Similar to calling the [else](#else) function, but works on a stream of Result objects. 
```typescript
import {of, Observable} from 'rxjs';
import {Ok, Err, Result} from 'ts-results';
import {elseMap} from 'ts-results/rxjs-operators';

const obs$: Observable<Result<number, Error>> = of(new Ok(5), new Err(new Error('uh oh')));

const doubled = obs$.pipe(
  elseMap(err => {
    console.log('Got error: ' + err.message);
    
    return -1;
  })
); // Has type Observable<number>

doubled.subscribe(number => {
  console.log('Got number: ' + number);
});

// Logs the following:
// Got number: 5
// Got error: uh oh
// Got number: -1
```

#### elseMapTo
```typescript
import {elseMapTo} from 'ts-results/rxjs-operators';
```
Behaves the same as [elseMap](#elsemap), but takes a value instead of a function.

#### resultSwitchMap and resultMergeMap
Allows you to do the same actions as the normal [rxjs switchMap](https://www.learnrxjs.io/operators/transformation/switchmap.html) and [rxjs switchMap](https://www.learnrxjs.io/operators/transformation/mergemap.html) operator on a stream of Result objects.

Merging or switching from a stream of `Result<T, E>` objects onto a stream of `<T2>` objects turns the stream into a stream of `Result<T2, E>` objects.

Merging or switching from a stream of `Result<T, E>` objects onto a stream of `Result<T2, E2>` objects turn the stream into a stream of `Result<T2, E | T2>` objects.
```typescript
import {of, Observable} from 'rxjs';
import {Ok, Err, Result} from 'ts-results';
import {resultMergeMap} from 'ts-results/rxjs-operators';

const obs$: Observable<Result<number, Error>> = of(new Ok(5), new Err(new Error('uh oh')));

const obs2$: Observable<Result<string, CustomError>> = of(new Ok('hi'), new Err(new CustomError('custom error')));

const test$ = obs$.pipe(
  resultMergeMap(number => {
    console.log('Got number: ' + number);

    return obs2$;
  })
); // Has type Observable<Result<string, CustomError | Error>>

test$.subscribe(result => {
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
import {of, Observable} from 'rxjs';
import {Ok, Err, Result} from 'ts-results';
import {filterResultOk} from 'ts-results/rxjs-operators';

const obs$: Observable<Result<number, Error>> = of(new Ok(5), new Err(new Error('uh oh')));

const test$ = obs$.pipe(
  filterResultOk()
); // Has type Observable<number>

test$.subscribe(result => {
  console.log('Got number: ' + result);
});

// Logs the following:
// Got number: 5

```

#### filterResultErr
Converts an `Observable<Result<T, E>>` to an `Observble<T>` by filtering out the Oks and mapping to the error values.

```typescript
import {of, Observable} from 'rxjs';
import {Ok, Err, Result} from 'ts-results';
import {filterResultOk} from 'ts-results/rxjs-operators';

const obs$: Observable<Result<number, Error>> = of(new Ok(5), new Err(new Error('uh oh')));

const test$ = obs$.pipe(
  filterResultOk()
); // Has type Observable<number>

test$.subscribe(result => {
  console.log('Got number: ' + result);
});

// Logs the following:
// Got number: 5

```
