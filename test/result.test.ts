import { Err, Ok, Result, ResultErrType, ResultErrTypes, ResultOkType, ResultOkTypes } from '../src';
import { eq } from './util';

test('Err<E> | Ok<T> should be Result<T, E>', () => {
    const r1 = new Err(0);
    const r2 = new Ok('');
    const r = Math.random() ? r1 : r2;
    eq<typeof r, Result<string, number>>(true);
});

test('Type can be narrowed using ok & err', () => {
    const r1 = new Ok(0) as Result<number, string>;
    if (r1.ok) {
        eq<Ok<number>, typeof r1>(true);
    } else {
        eq<Err<string>, typeof r1>(true);
    }

    if (r1.err) {
        eq<Err<string>, typeof r1>(true);
    } else {
        eq<Ok<number>, typeof r1>(true);
    }
})

test('map', () => {
    const r = new Err(0) as Result<string, number>;
    const r2 = r.map(Symbol);
    eq<typeof r2, Result<symbol, number>>(true);
});

test('andThen', () => {
    const result = new Ok('Ok') as Result<string, boolean>;
    const then = result.andThen(() => new Err('broke') as Result<boolean, string>);
    expect(then).toMatchResult(new Err('broke'));
    eq<typeof then, Result<boolean, string | boolean>>(true);
});

test('mapErr', () => {
    const r = new Err(0) as Result<string, number>;
    const r2 = r.mapErr(Symbol);
    eq<typeof r2, Result<string, symbol>>(true);
});


test('Iterable', () => {
    const r1 = new Ok([true, false]) as Result<boolean[], number>;
    const r1Iter = r1[Symbol.iterator]();
    eq<Iterator<boolean>, typeof r1Iter>(true);

    const r2 = new Ok(32) as Result<number, string>;
    const r2Iter = r2[Symbol.iterator]();
    eq<Iterator<never>, typeof r2Iter>(true);
});

test('ResultOkType', () => {
    type a = ResultOkType<Ok<string>>;
    eq<string, a>(true);
    type b = ResultOkType<Err<string>>;
    eq<never, b>(true);
    type c = ResultOkType<Result<string, number>>;
    eq<string, c>(true);
});

test('ResultErrType', () => {
    type a = ResultErrType<Ok<string>>;
    eq<never, a>(true);
    type b = ResultErrType<Err<string>>;
    eq<string, b>(true);
    type c = ResultErrType<Result<string, number>>;
    eq<number, c>(true);
});

test('ResultOkTypes & ResultErrTypes', () => {
    type a = ResultOkTypes<[Ok<string>, Err<string>, Result<symbol, number>, Result<never, string>, Ok<32> | Err<boolean>]>;
    eq<[string, never, symbol, never, 32], a>(true);

    type b = ResultErrTypes<[Ok<string>, Err<string>, Result<symbol, number>, Result<never, symbol>, Ok<boolean> | Err<32>]>;
    eq<[never, string, number, symbol, 32], b>(true);
});

test('Result.all', () => {
    const ok0 = new Ok(3);
    const ok1 = new Ok(true);
    const ok2 = new Ok(8 as const) as Result<8, boolean>;
    const err0 = new Err(Symbol());
    const err1 = new Err(Error());
    const err2 = new Err(9 as const) as Result<boolean, 9>;

    const all0 = Result.all();
    expect(all0).toMatchResult(Ok([]));
    eq<typeof all0, Result<[], never>>(true);

    const all1 = Result.all(ok0, ok1);
    expect(all1).toMatchResult(Ok([3, true]));
    eq<typeof all1, Result<[number, boolean], never>>(true);

    const all3 = Result.all(err0, err1);
    expect(all3).toMatchResult(Err(err0.val));
    eq<typeof all3, Result<[never, never], symbol | Error>>(true);


    const all4 = Result.all(...([] as Result<string, number>[]));
    eq<typeof all4, Result<string[], number>>(true);

    const all5 = Result.all(ok0, ok1, ok2, err2);
    expect(all5).toMatchResult(Err(9));
    eq<typeof all5, Result<[number, boolean, 8, boolean], boolean | 9>>(true);
});

test('Result.any', () => {
    const ok0 = new Ok(3);
    const ok1 = new Ok(true);
    const ok2 = new Ok(8 as const) as Result<8, boolean>;
    const err0 = new Err(Symbol());
    const err1 = new Err(Error());
    const err2 = new Err(9 as const) as Result<boolean, 9>;

    const any0 = Result.any();
    expect(any0).toMatchResult(Err([]));
    eq<typeof any0, Result<never, []>>(true);

    const any1 = Result.any(ok0, ok1);
    expect(any1).toMatchResult(Ok(3));
    eq<typeof any1, Result<number | boolean, [never, never]>>(true);

    const any3 = Result.any(err0, err1);
    expect(any3).toMatchResult(Err([err0.val, err1.val]));
    eq<typeof any3, Result<never, [symbol, Error]>>(true);


    const any4 = Result.any(...([] as Result<string, number>[]));
    eq<typeof any4, Result<string, number[]>>(true);

    const any5 = Result.any(err0, err1, err2, ok2);
    expect(any5).toMatchResult(Ok(8));
    eq<typeof any5, Result<boolean | 8, [symbol, Error, 9, boolean]>>(true);
});

test('Result.wrap', () => {
    const a = Result.wrap(() => 1);
    expect(a).toMatchResult(Ok(1));
    eq<typeof a, Result<number, unknown>>(true);

    class CustomError {
        readonly message = 'hi';
    }
    const err = new CustomError();

    const b = Result.wrap<number, CustomError>(() => {
        throw err;
    });
    expect(b).toMatchResult(Err(err));
    eq<typeof b, Result<number, CustomError>>(true);
});

test('Result.wrapAsync', async () => {
    const a = await Result.wrapAsync(async () => 1);
    expect(a).toMatchResult(Ok(1));
    eq<typeof a, Result<number, unknown>>(true);

    class CustomError {
        readonly message = 'hi';
    }
    const err = new CustomError();

    const b = await Result.wrapAsync<number, CustomError>(async () => {
        throw err;
    });
    expect(b).toMatchResult(Err(err));
    eq<typeof b, Result<number, CustomError>>(true);

    const c = await Result.wrapAsync<number, string>(() => {
        throw "thrown before promise";
        return Promise.resolve(3);
    });

    expect(c).toMatchResult(Err("thrown before promise"));
    eq<typeof c, Result<number, string>>(true);
});

test('safeUnwrap', () => {
    const ok1 = new Ok(3).safeUnwrap();
    expect(ok1).toEqual(3);
    eq<typeof ok1, number>(true);

    const err = new Err("hi");
    const result = new Ok(1) as Result<number, string>;

    expect(() => {
        // @ts-expect-error
        err.safeUnwrap();
    }).toThrowError();

    // @ts-expect-error
    result.safeUnwrap();

    if (result.ok) {
        const val = result.safeUnwrap();
        eq<typeof val, number>(true);
        expect(val).toEqual(1);
    }
    else {
        // @ts-expect-error
        result.safeUnwrap();
    }
});
