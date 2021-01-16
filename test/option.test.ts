import {None, Option, OptionSomeType, Some} from "../src/option";
import {eq} from './util';

const someString = Some("foo");
const someNum = new Some(10);

test("basic invariants", () => {
    expect(someString.some).toBeTruthy();
    expect(someNum.some).toBeTruthy();
    expect(None).toBe(None);
    expect(someString.val).toBe("foo");
    expect(someNum.val).toBe(10);


    expect(Option.isOption(someString)).toBe(true);
    expect(Option.isOption(someNum)).toBe(true);
    expect(Option.isOption(None)).toBe(true);
    expect(Option.isOption("foo")).toBe(false);
});

test("type narrowing", () => {
    const opt = None as Option<string>;
    if (opt.some) {
        eq<typeof opt, Some<string>>(true);
        eq<typeof opt.val, string>(true);
    } else {
        eq<typeof opt, None>(true);
    }

    if (!opt.some) {
        eq<typeof opt, None>(true);
    } else {
        eq<typeof opt, Some<string>>(true);
        eq<typeof opt.val, string>(true);
    }

    if (opt.none) {
        eq<typeof opt, None>(true);
    } else {
        eq<typeof opt, Some<string>>(true);
        eq<typeof opt.val, string>(true);
    }

    if (!opt.none) {
        eq<typeof opt, Some<string>>(true);
        eq<typeof opt.val, string>(true);
    } else {
        eq<typeof opt, None>(true);
    }

    expect(someString).toBeInstanceOf(Some);
    expect(None).toEqual(None);
});

test("unwrap", () => {
    expect(() => someString.unwrap()).not.toThrow();
    expect(someString.unwrap()).toBe("foo");
    expect(someString.unwrapOr("bar")).toBe("foo");
    expect(() => None.unwrap()).toThrow(/Tried to unwrap None/);
    expect(() => None.expect("foobar")).toThrow(/foobar/);
    expect(None.unwrapOr("honk")).toBe("honk");
});

test("map / andThen", () => {
    expect(None.map(() => 1)).toBe(None);
    // @ts-expect-error
    expect(None.andThen(() => 1)).toBe(None);
    expect(None.andThen(() => Some(1))).toBe(None);

    expect(someString.map(() => 1)).toEqual(Some(1));
    // @ts-expect-error
    someString.andThen(() => 1);
    expect(someString.andThen(() => Some(1))).toEqual(Some(1));
});

test("all / any", () => {
    const strings = ["foo", "bar", "baz"];
    const options = strings.map(Some);

    expect(Option.any(...options)).toEqual(Some("foo"));
    expect(Option.all(...options)).toEqual(Some(strings));

    expect(Option.any(...options, None)).toEqual(Some("foo"));
    expect(Option.all(...options, None)).toEqual(None);
});

test("Type Helpers", () => {
    eq<OptionSomeType<Option<string>>, string>(true);
    eq<OptionSomeType<Some<string>>, string>(true);
    eq<OptionSomeType<None>, never>(true)
})
