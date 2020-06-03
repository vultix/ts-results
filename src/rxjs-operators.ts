import { Observable, ObservableInput, of, OperatorFunction } from 'rxjs';
import { filter, map, mergeMap, switchMap } from 'rxjs/operators';
import { Err, Ok, Result, ResultErrType, ResultOkType } from './index';

export function resultMap<R extends Result<any, any>, T>(mapper: (val: ResultOkType<R>) => T): OperatorFunction<R, Result<T, ResultErrType<R>>> {
    return (source: Observable<R>) => {
        return source.pipe(
          map(result => result.map(mapper))
        );
    };
}

export function resultMapErr<R extends Result<any, any>, E>(mapper: (val: ResultErrType<R>) => E): OperatorFunction<R, Result<ResultOkType<R>, E>> {
    // @ts-ignore Help wanted
    return (source: Observable<R>) => {
        return source.pipe(
          map(result => result.mapErr(mapper))
        );
    };
}

export function resultMapTo<R extends Result<any, any>, T>(value: T): OperatorFunction<R, Result<T, ResultErrType<R>>> {
    return (source: Observable<R>) => {
        return source.pipe(
          map(result => result.map(() => value))
        );
    };
}

export function resultMapErrTo<R extends Result<any, any>, T>(value: T): OperatorFunction<R, Result<ResultOkType<R>, T>> {
    // @ts-ignore Help wanted
    return (source: Observable<R>) => {
        return source.pipe(
          map(result => result.mapErr(() => value))
        );
    };
}

export function elseMap<R extends Result<any, any>, T>(mapper: (val: ResultErrType<R>) => T): OperatorFunction<R, ResultOkType<R> | T> {
    return (source: Observable<R>) => {
        return source.pipe(
          map(result => {
              if (result.err) {
                  return mapper(result.val);
              } else {
                  return result.val;
              }
          })
        );
    };
}

export function elseMapTo<R extends Result<any, any>, T>(value: T): OperatorFunction<R, ResultOkType<R> | T> {
    return (source: Observable<R>) => {
        return source.pipe(
          map(result => {
              if (result.err) {
                  return value;
              } else {
                  return result.val;
              }
          })
        );
    };
}

export function resultSwitchMap<R extends Result<any, any>, T extends Result<any, any>>(mapper: (val: ResultOkType<R>) => ObservableInput<T>): OperatorFunction<R, Result<ResultOkType<T>, ResultErrType<R> | ResultErrType<T>>>
export function resultSwitchMap<R extends Result<any, any>, T>(mapper: (val: ResultOkType<R>) => ObservableInput<T>): OperatorFunction<R, Result<T, ResultErrType<R>>>
export function resultSwitchMap<R extends Result<any, any>>(mapper: (val: ResultOkType<R>) => ObservableInput<any>): OperatorFunction<R, Result<any, any>> {
    return (source: Observable<R>) => {
        return source.pipe(
          switchMap(result => {
              if (result.ok) {
                  return mapper(result.val);
              } else {
                  return of(result);
              }
          }),
          map(result => {
              if (result instanceof Ok || result instanceof Err) {
                  return result;
              } else {
                  return new Ok(result);
              }
          })
        );
    };
}

export function resultMergeMap<R extends Result<any, any>, T extends Result<any, any>>(mapper: (val: ResultOkType<R>) => ObservableInput<T>): OperatorFunction<R, Result<ResultOkType<T>, ResultErrType<R> | ResultErrType<T>>>
export function resultMergeMap<R extends Result<any, any>, T>(mapper: (val: ResultOkType<R>) => ObservableInput<T>): OperatorFunction<R, Result<T, ResultErrType<R>>>
export function resultMergeMap<R extends Result<any, any>>(mapper: (val: ResultOkType<R>) => ObservableInput<any>): OperatorFunction<R, Result<any, any>> {
    return (source: Observable<R>) => {
        return source.pipe(
          mergeMap(result => {
              if (result.ok) {
                  return mapper(result.val);
              } else {
                  return of(result);
              }
          }),
          map(result => {
              if (result instanceof Ok || result instanceof Err) {
                  return result;
              } else {
                  return new Ok(result);
              }
          })
        );
    };
}

export function filterResultOk<R extends Result<any,any>>(): OperatorFunction<R, ResultOkType<R>> {
    return (source: Observable<R>) => {
        return source.pipe(
          filter(result => result.ok),
          map(result => result.val)
        )
    }
}

export function filterResultErr<R extends Result<any,any>>(): OperatorFunction<R, ResultErrType<R>> {
    return (source: Observable<R>) => {
        return source.pipe(
          filter(result => result.err),
          map(result => result.val)
        )
    }
}
