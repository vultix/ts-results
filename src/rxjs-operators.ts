import { Observable, ObservableInput, of, OperatorFunction } from 'rxjs';
import { map, mergeMap, switchMap } from 'rxjs/operators';
import { Err, Ok, Result } from './index';

export function resultMap<R extends Result<any, any>, T>(mapper: (val: R['_t']) => T): OperatorFunction<R, Result<T, R['_e']>>
export function resultMap<R extends Result<any, any>, T2>(mapper: null | undefined, errMapper: (val: R['_e']) => T2): OperatorFunction<R, Result<R['_t'], T2>>
export function resultMap<R extends Result<any, any>, T, T2>(mapper: (val: R['_t']) => T, errMapper: (val: R['_e']) => T2): OperatorFunction<R, Result<T, T2>>
export function resultMap<R extends Result<any, any>, T, T2>(mapper: null | undefined | ((val: R['_t']) => T), errMapper?: (val: R['_e']) => T2): OperatorFunction<R, Result<T, T2>> {
    return (source: Observable<R>) => {
        return source.pipe(
          map(result => {
              if (result.ok) {
                  if (mapper) {
                      const newVal = mapper(result.val);
                      return Ok(newVal);
                  } else {
                      return result;
                  }
              } else {
                  if (errMapper) {
                      return Err(errMapper(result.val));
                  } else {
                      return result;
                  }
              }
          })
        );
    };
}

export function resultMapTo<R extends Result<any, any>, T>(value: T): OperatorFunction<R, Result<T, R['_e']>> {
    return (source: Observable<R>) => {
        return source.pipe(
          map(result => {
              if (result.ok) {
                  return Ok(value);
              } else {
                  return result;
              }
          })
        );
    };
}

export function elseMap<R extends Result<any, any>, T>(mapper: (val: R['_e']) => T): OperatorFunction<R, R['_t'] | T> {
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

export function elseMapTo<R extends Result<any, any>, T>(value: T): OperatorFunction<R, R['_t'] | T> {
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

export function resultSwitchMap<R extends Result<any, any>, T extends Result<any, any>>(mapper: (val: R['_t']) => ObservableInput<T>): OperatorFunction<R, Result<T['_t'], R['_e'] | T['_e']>>
export function resultSwitchMap<R extends Result<any, any>, T>(mapper: (val: R['_t']) => ObservableInput<T>): OperatorFunction<R, Result<T, R['_e']>>
export function resultSwitchMap<R extends Result<any, any>>(mapper: (val: R['_t']) => ObservableInput<any>): OperatorFunction<R, Result<any, any>> {
    return (source: Observable<R>) => {
        return source.pipe(
          switchMap(result => {
              if (result.ok) {
                  return mapper(result.val);
              } else {
                  return of(result);
              }
          })
        );
    };
}

export function resultMergeMap<R extends Result<any, any>, T extends Result<any, any>>(mapper: (val: R['_t']) => ObservableInput<T>): OperatorFunction<R, Result<T['_t'], R['_e'] | T['_e']>>
export function resultMergeMap<R extends Result<any, any>, T>(mapper: (val: R['_t']) => ObservableInput<T>): OperatorFunction<R, Result<T, R['_e']>>
export function resultMergeMap<R extends Result<any, any>>(mapper: (val: R['_t']) => ObservableInput<any>): OperatorFunction<R, Result<any, any>> {
    return (source: Observable<R>) => {
        return source.pipe(
          mergeMap(result => {
              if (result.ok) {
                  return mapper(result.val);
              } else {
                  return of(result);
              }
          })
        );
    };
}
