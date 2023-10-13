import {
    AsyncResult,
    Err,
    Ok,
} from '../src/index.js';

test('andThen() should work', async () => {
    const err = Err('error')
    const badResult = new AsyncResult(err)
    const goodResult = new AsyncResult(Ok(100))

    expect(await badResult.andThen(() => {throw new Error('Should not be called')}).promise).toEqual(err)
    expect(await goodResult.andThen((value) => Promise.resolve(Ok(value * 2))).promise).toEqual(Ok(200))
    expect(await goodResult.andThen((value) => Ok(value * 3).toAsyncResult()).promise).toEqual(Ok(300))
})

test('map() should work', async () => {
    const err = Err('error')
    const badResult = new AsyncResult(err)
    const goodResult = new AsyncResult(Ok(100))

    expect(await badResult.map(() => {throw new Error('Should not be called')}).promise).toEqual(err)
    expect(await goodResult.map((value) => Promise.resolve(value * 2)).promise).toEqual(Ok(200))
})
