import { Err, Ok, Result } from '../src';
import { Observable, of } from 'rxjs';
import {
    elseMap,
    elseMapTo,
    filterResultErr,
    filterResultOk,
    resultMap,
    resultMapErr,
    resultMapErrTo,
    resultMapTo,
    resultMergeMap,
    resultSwitchMap,
    tapResultErr,
    tapResultOk,
} from '../src/rxjs-operators';
import { eq } from './util';

const goodVal: Observable<Result<string, number>> = of(Ok('good'));
const badVal: Observable<Result<string, number>> = of(Err(0));

test('resultMap', () => {
    const goodValMapped = goodVal.pipe(
        resultMap((msg) => {
            eq<typeof msg, string>(true);
            return !!msg;
        }),
    );
    eq<typeof goodValMapped, Observable<Result<boolean, number>>>(true);

    expect(goodValMapped).toMatchObsResult(Ok(true));

    const badValMapped = badVal.pipe(
        resultMap((msg) => {
            eq<typeof msg, string>(true);
            return !!msg;
        }),
    );
    eq<typeof badValMapped, Observable<Result<boolean, number>>>(true);
    expect(badValMapped).toMatchObsResult(Err(0));
});

test('resultMapErr', () => {
    const goodValMappedErr = goodVal.pipe(
        resultMapErr((num) => {
            eq<typeof num, number>(true);
            return new Date(num);
        }),
    );
    eq<typeof goodValMappedErr, Observable<Result<string, Date>>>(true);
    expect(goodValMappedErr).toMatchObsResult(Ok('good'));

    const badValMappedErr = badVal.pipe(
        resultMapErr((num) => {
            eq<typeof num, number>(true);
            return new Date(num);
        }),
    );
    eq<typeof badValMappedErr, Observable<Result<string, Date>>>(true);
    expect(badValMappedErr).toMatchObsResult(Err(new Date(0)));
});

test('resultMapTo', () => {
    const goodValMappedTo = goodVal.pipe(resultMapTo(500));
    eq<typeof goodValMappedTo, Observable<Result<number, number>>>(true);
    expect(goodValMappedTo).toMatchObsResult(Ok(500));

    const badValMappedTo = badVal.pipe(resultMapTo(500));
    eq<typeof badValMappedTo, Observable<Result<number, number>>>(true);
    expect(badValMappedTo).toMatchObsResult(Err(0));
});

test('resultMapErrTo', () => {
    const goodValMappedErrTo = goodVal.pipe(resultMapErrTo('err'));
    eq<typeof goodValMappedErrTo, Observable<Result<string, string>>>(true);
    expect(goodValMappedErrTo).toMatchObsResult(Ok('good'));

    const badValMappedErrTo = badVal.pipe(resultMapErrTo('err'));
    eq<typeof badValMappedErrTo, Observable<Result<string, string>>>(true);
    expect(badValMappedErrTo).toMatchObsResult(Err('err'));
});

test('elseMap', () => {
    const goodValElseMapped = goodVal.pipe(
        elseMap((num) => {
            eq<typeof num, number>(true);
            return new Date(num);
        }),
    );
    eq<typeof goodValElseMapped, Observable<string | Date>>(true);

    expect(goodValElseMapped).toMatchObs('good');

    const badValElseMapped = badVal.pipe(
        elseMap((num) => {
            eq<typeof num, number>(true);
            return new Date(num);
        }),
    );
    eq<typeof badValElseMapped, Observable<string | Date>>(true);

    expect(badValElseMapped).toMatchObs(new Date(0));
});

test('elseMapTo', () => {
    const goodValElseMapped = goodVal.pipe(elseMapTo(new Date(100)));
    eq<typeof goodValElseMapped, Observable<string | Date>>(true);

    expect(goodValElseMapped).toMatchObs('good');

    const badValElseMapped = badVal.pipe(elseMapTo(new Date(100)));
    eq<typeof badValElseMapped, Observable<string | Date>>(true);

    expect(badValElseMapped).toMatchObs(new Date(100));
});

test('switchMap', async () => {
    const goodValSwitchMappedToResult = goodVal.pipe(
        resultSwitchMap((a) => {
            eq<typeof a, string>(true);
            return of(Ok(new Date(3)) as Result<Date, string>);
        }),
    );
    eq<typeof goodValSwitchMappedToResult, Observable<Result<Date, number | string>>>(true);
    expect(goodValSwitchMappedToResult).toMatchObsResult(Ok(new Date(3)));

    const goodValSwitchMappedToBadResult = goodVal.pipe(
        resultSwitchMap((a) => {
            eq<typeof a, string>(true);
            return of(Err(new Date(3)) as Result<number, Date>);
        }),
    );
    eq<typeof goodValSwitchMappedToBadResult, Observable<Result<number, Date | number>>>(true);
    expect(goodValSwitchMappedToBadResult).toMatchObsResult(Err(new Date(3)));

    const badValSwitchMappedToResult = badVal.pipe(
        resultSwitchMap((a) => {
            eq<typeof a, string>(true);
            return of(Ok(new Date(3)) as Result<Date, string>);
        }),
    );
    eq<typeof badValSwitchMappedToResult, Observable<Result<Date, number | string>>>(true);
    expect(badValSwitchMappedToResult).toMatchObsResult(Err(0));

    const goodValSwitchMappedToNonResult = goodVal.pipe(
        resultSwitchMap((a) => {
            eq<typeof a, string>(true);
            return of(new Date(3));
        }),
    );
    eq<typeof goodValSwitchMappedToNonResult, Observable<Result<Date, number>>>(true);
    expect(goodValSwitchMappedToNonResult).toMatchObsResult(Ok(new Date(3)));

    const badValSwitchMappedToNonResult = badVal.pipe(
        resultSwitchMap((a) => {
            eq<typeof a, string>(true);
            return of(new Date(3));
        }),
    );
    eq<typeof badValSwitchMappedToNonResult, Observable<Result<Date, number>>>(true);
    expect(badValSwitchMappedToNonResult).toMatchObsResult(Err(0));
});

test('switchMap', async () => {
    const goodValMergeMappedToResult = goodVal.pipe(
        resultMergeMap((a) => {
            eq<typeof a, string>(true);
            return of(Ok(new Date(3)) as Result<Date, string>);
        }),
    );
    eq<typeof goodValMergeMappedToResult, Observable<Result<Date, number | string>>>(true);
    expect(goodValMergeMappedToResult).toMatchObsResult(Ok(new Date(3)));

    const goodValMergeMappedToBadResult = goodVal.pipe(
        resultMergeMap((a) => {
            eq<typeof a, string>(true);
            return of(Err(new Date(3)) as Result<number, Date>);
        }),
    );
    eq<typeof goodValMergeMappedToBadResult, Observable<Result<number, Date | number>>>(true);
    expect(goodValMergeMappedToBadResult).toMatchObsResult(Err(new Date(3)));

    const badValMergeMappedToResult = badVal.pipe(
        resultMergeMap((a) => {
            eq<typeof a, string>(true);
            return of(Ok(new Date(3)) as Result<Date, string>);
        }),
    );
    eq<typeof badValMergeMappedToResult, Observable<Result<Date, number | string>>>(true);
    expect(badValMergeMappedToResult).toMatchObsResult(Err(0));

    const goodValMergeMappedToNonResult = goodVal.pipe(
        resultMergeMap((a) => {
            eq<typeof a, string>(true);
            return of(new Date(3));
        }),
    );
    eq<typeof goodValMergeMappedToNonResult, Observable<Result<Date, number>>>(true);
    expect(goodValMergeMappedToNonResult).toMatchObsResult(Ok(new Date(3)));

    const badValMergeMappedToNonResult = badVal.pipe(
        resultMergeMap((a) => {
            eq<typeof a, string>(true);
            return of(new Date(3));
        }),
    );
    eq<typeof badValMergeMappedToNonResult, Observable<Result<Date, number>>>(true);
    expect(badValMergeMappedToNonResult).toMatchObsResult(Err(0));
});

test('filterResultOk', () => {
    const filteredGoodVal = goodVal.pipe(filterResultOk());
    eq<typeof filteredGoodVal, Observable<string>>(true);
    expect(filteredGoodVal).toMatchObs('good');

    let hitBadVal = false;
    const filteredBadVal = badVal.pipe(filterResultOk());
    eq<typeof filteredBadVal, Observable<string>>(true);
    filteredBadVal.subscribe(() => (hitBadVal = false));

    expect(hitBadVal).toEqual(false);
});

test('filterResultErr', () => {
    let hitGoodVal = false;
    const filteredGoodVal = goodVal.pipe(filterResultErr());
    eq<typeof filteredGoodVal, Observable<number>>(true);
    filteredGoodVal.subscribe(() => (hitGoodVal = false));

    expect(hitGoodVal).toEqual(false);

    const filteredBadVal = badVal.pipe(filterResultErr());
    eq<typeof filteredBadVal, Observable<number>>(true);
    expect(filteredBadVal).toMatchObs(0);
});

test('tapResultOk', () => {
    let hitGoodVal = false;
    const tappedGoodVal = goodVal.pipe(
        tapResultOk((val) => {
            eq<typeof val, string>(true);
            expect(val).toEqual('good');

            hitGoodVal = true;
        }),
    );

    eq<typeof tappedGoodVal, Observable<Result<string, number>>>(true);
    expect(tappedGoodVal).toMatchObsResult(Ok('good'));
    expect(hitGoodVal).toEqual(true);

    let hitBadVal = false;
    const tappedBadVal = badVal.pipe(
        tapResultOk((val) => {
            eq<typeof val, string>(true);

            hitBadVal = true;
        }),
    );

    eq<typeof tappedBadVal, Observable<Result<string, number>>>(true);
    expect(tappedBadVal).toMatchObsResult(Err(0));
    expect(hitBadVal).toEqual(false);
});

test('tapResultErr', () => {
    let hitGoodVal = false;
    const tappedGoodVal = goodVal.pipe(
        tapResultErr((val) => {
            eq<typeof val, number>(true);

            hitGoodVal = true;
        }),
    );

    eq<typeof tappedGoodVal, Observable<Result<string, number>>>(true);
    expect(tappedGoodVal).toMatchObsResult(Ok('good'));
    expect(hitGoodVal).toEqual(false);

    let hitBadVal = false;
    const tappedBadVal = badVal.pipe(
        tapResultErr((val) => {
            eq<typeof val, number>(true);
            expect(val).toEqual(0);

            hitBadVal = true;
        }),
    );

    eq<typeof tappedBadVal, Observable<Result<string, number>>>(true);
    expect(tappedBadVal).toMatchObsResult(Err(0));
    expect(hitBadVal).toEqual(true);
});
