# ts-results
A typescript implementation of [Rust's Result](https://doc.rust-lang.org/std/result/) object.

## Contents

* [Installation](#installation)
* [Usage](#usage)
    * [Creation](#creation)
    * [Type Safety](#type-safety)
    * [Unwrap](#unwrap)
    * [Expect](#expect) 	
    * [Map](#map)
    * [Else](#else)
    * [Combining Results](#combining-results)
* [Usage with rxjs](#usage-with-rxjs)
    * [resultMap](#resultmap)
    * [resultMapTo](#resultmapto)
    * [elseMap](#elsemap)
    * [elseMapTo](#elsemapto)
    * [resultSwitchMap, resultMergeMap](#resultswitchmap-and-resultmergemap)

## Installation
```bash
$ npm install ts-results
```
or
```bash
$ yarn install ts-results
```

## Usage
```typescript
import { Result, Err, Ok, Results } from 'ts-results';
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
let goodResult = Ok<number, Error>(1);
let badResult = Err<number, Error>(new Error("something went wrong"));

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

#### Map
```typescript
let goodResult = Ok<number, Error>(1);
let badResult = Err<number, Error>(new Error("something went wrong"));

goodResult.map(num => num + 1).unwrap(); // 2
badResult.map(num => num + 1).unwrap(); // throws Error("something went wrong")

goodResult.map(num => num + 1, err => new Error('mapped')).unwrap(); // 2
badResult.map(num => num + 1, err => new Error('mapped')).unwrap(); // throws Error("mapped")

goodResult.map(null, err => new Error('mapped')).unwrap(); // 1
badResult.map(null, err => new Error('mapped')).unwrap(); // throws Error("mapped")
```

#### Else
```typescript
let goodResult = Ok<number, Error>(1);
let badResult = Err<number, Error>(new Error("something went wrong"));

goodResult.else(5); // 1
badResult.else(5); // 5
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

const obs$: Observable<Result<number, Error>> = of(Ok(5), Err(new Error('uh oh')));

const doubled = obs$.pipe(
  resultMap(number => number * 2), // Doubles the value
  resultMap(null, err => err.message), // You can also map the error
); // Has type Observable<Result<number, string>>

doubled.subscribe(result => {
  if (result.ok) {
    console.log('Got number: ' + result.val);
  } else {
    console.log('Got Error Message: ' + result.val);
  }
});

// Logs the following: 
// Got number: 10
// Got Error Message: uh oh
```
#### resultMapTo
```typescript
import {resultMapTo} from 'ts-results/rxjs-operators';
```
Behaves the same as [resultMap](#resultmap), but takes a value instead of a function.

#### elseMap
Allows you to turn a stream of Result objects into a stream of values, transforming any errors into a value.

Similar to calling the [else](#else) function, but works on a stream of Result objects. 
```typescript
import {of, Observable} from 'rxjs';
import {Ok, Err, Result} from 'ts-results';
import {elseMap} from 'ts-results/rxjs-operators';

const obs$: Observable<Result<number, Error>> = of(Ok(5), Err(new Error('uh oh')));

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

const obs$: Observable<Result<number, Error>> = of(Ok(5), Err(new Error('uh oh')));

const obs2$: Observable<Result<string, CustomError>> = of(Ok('hi'), Err(new CustomError('custom error')));

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
