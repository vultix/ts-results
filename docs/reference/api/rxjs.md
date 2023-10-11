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
and [rxjs switchMap](https://www.learnrxjs.io/operators/transformation/mergemap.html) operator on a stream of Result
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
