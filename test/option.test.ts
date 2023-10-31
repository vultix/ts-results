import { Err, None, Ok, Option, OptionSomeType, Result, Some } from '../src/index.js';
import { eq } from './util.js';

const someString = Some('foo');
const someNum = new Some(10);

test('basic invariants', () => {
    expect(someString.isSome()).toBeTruthy();
    expect(someNum.isSome()).toBeTruthy();
    expect(None).toBe(None);
    expect(someString.value).toBe('foo');
    expect(someNum.value).toBe(10);

    expect(Option.isOption(someString)).toBe(true);
    expect(Option.isOption(someNum)).toBe(true);
    expect(Option.isOption(None)).toBe(true);
    expect(Option.isOption('foo')).toBe(false);

    expect(None.isSome()).toBe(false)
    expect(None.isNone()).toBe(true)
    expect(someNum.isSome()).toBe(true)
    expect(someNum.isNone()).toBe(false)
});

test('type narrowing', () => {
    const opt = None as Option<string>;
    if (opt.isSome()) {
        eq<typeof opt, Some<string>>(true);
        eq<typeof opt.value, string>(true);
    } else {
        eq<typeof opt, None>(true);
    }

    if (!opt.isSome()) {
        eq<typeof opt, None>(true);
    } else {
        eq<typeof opt, Some<string>>(true);
        eq<typeof opt.value, string>(true);
    }

    if (opt.isNone()) {
        eq<typeof opt, None>(true);
    } else {
        eq<typeof opt, Some<string>>(true);
        eq<typeof opt.value, string>(true);
    }

    if (!opt.isNone()) {
        eq<typeof opt, Some<string>>(true);
        eq<typeof opt.value, string>(true);
    } else {
        eq<typeof opt, None>(true);
    }

    expect(someString).toBeInstanceOf(Some);
    expect(None).toEqual(None);
});

test('unwrap', () => {
    expect(() => someString.unwrap()).not.toThrow();
    expect(someString.unwrap()).toBe('foo');
    expect(someString.expect('msg')).toBe('foo');
    expect(someString.unwrapOr('bar')).toBe('foo');
    expect(someString.safeUnwrap()).toBe('foo');
    expect(() => None.unwrap()).toThrow(/Tried to unwrap None/);
    expect(() => None.expect('foobar')).toThrow(/foobar/);
    expect(None.unwrapOr('honk')).toBe('honk');
});

test('map / andThen', () => {
    expect(None.map(() => 1)).toBe(None);
    expect(None.andThen(() => 1)).toBe(None);
    expect(None.andThen(() => Some(1))).toBe(None);

    expect(someString.map(() => 1)).toEqual(Some(1));
    // @ts-expect-error
    someString.andThen(() => 1);
    expect(someString.andThen(() => Some(1))).toEqual(Some(1));

    const mapped = (someString as Option<string>).andThen((val) => Some(!!val));
    expect(mapped).toEqual(Some(true));
    eq<typeof mapped, Option<boolean>>(true);
});

test('mapOr / mapOrElse', () => {
    expect(None.mapOr(1, () => -1)).toEqual(1)
    expect(None.mapOrElse(() => 1, () => -1)).toEqual(1)

    expect(Some(11).mapOr(1, (val) => val * 2)).toEqual(22)
    expect(Some(11).mapOrElse(() => { throw new Error('Should not happen'); }, (val) => val * 2)).toEqual(22)
});

test('all / any', () => {
    const strings = ['foo', 'bar', 'baz'] as const;
    const options = [Some('foo' as const), Some('bar' as const), Some('baz' as const)] as const;

    const all = Option.all(...options);
    eq<typeof all, Option<['foo', 'bar', 'baz']>>(true);

    expect(Option.all(...options)).toEqual(Some(strings));
    expect(Option.all()).toEqual(Some([]));
    expect(Option.all(...options, None)).toEqual(None);

    expect(Option.any(...options)).toEqual(Some('foo'));
    expect(Option.any(...options, None)).toEqual(Some('foo'));
    expect(Option.any(None, None)).toEqual(None);
    expect(Option.any(None, Some('foo'))).toEqual(Some('foo'));
    expect(Option.any()).toEqual(None);
});

test('Type Helpers', () => {
    eq<OptionSomeType<Option<string>>, string>(true);
    eq<OptionSomeType<Some<string>>, string>(true);
    eq<OptionSomeType<None>, never>(true);
});

test('to string', () => {
    expect(`${Some(1)}`).toEqual('Some(1)');
    expect(`${Some({ name: 'George' })}`).toEqual('Some({"name":"George"})');
    expect(`${None}`).toEqual('None');
});

test('to result', () => {
    const option = Some(1) as Option<number>;
    const result = option.toResult('error');
    eq<typeof result, Result<number, string>>(true);

    expect(result).toMatchResult(Ok(1));

    const option2 = None as Option<number>;
    const result2 = option2.toResult('error');
    eq<typeof result2, Result<number, string>>(true);

    expect(result2).toMatchResult(Err('error'));
});

test('or / orElse', () => {
    expect(None.or(Some(1))).toEqual(Some(1))
    expect(None.orElse(() => Some(1))).toEqual(Some(1))

    expect(Some(1).or(Some(2))).toEqual(Some(1))
    expect(Some(1).orElse(() => {throw new Error('Call unexpected')})).toEqual(Some(1))
})
