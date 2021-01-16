import {
    Option,
    Some,
    None,
    some,
    none,
    isOption,
    anyOption,
    allOptions,
} from "../src/option";

const someString = some("foo");
const someNum = some(10);

test("basic invariants", () => {
    expect(someString.some).toBeTruthy();
    expect(someNum.some).toBeTruthy();
    expect(none).toBe(none);
    expect(someString.val).toBe("foo");
    expect(someNum.val).toBe(10);

    expect(isOption(someString)).toBe(true);
    expect(isOption(someNum)).toBe(true);
    expect(isOption(none)).toBe(true);
    expect(isOption("foo")).toBe(false);
});

function funcTakesString(s: string) {}

test("type narrowing", () => {
    const opt = none as Option<string>;
    if (opt.some) {
        funcTakesString(opt.val);
    } else {
        // @ts-expect-error
        funcTakesString(opt.val);
    }

    const opt2 = none as Option<number>;
    if (opt2.some) {
        // @ts-expect-error
        funcTakesString(opt2.val);
    } else {
        // @ts-expect-error
        funcTakesString(opt2.val);
    }

    expect(someString).toBeInstanceOf(Some);
    expect(none).toBeInstanceOf(None);
});

test("unwrap", () => {
    expect(() => someString.unwrap()).not.toThrow();
    expect(someString.unwrap()).toBe("foo");
    expect(someString.unwrapOr("bar")).toBe("foo");
    expect(() => none.unwrap()).toThrow(/Tried to unwrap None/);
    expect(() => none.expect("foobar")).toThrow(/foobar/);
    expect(none.unwrapOr("honk")).toBe("honk");
});

test("map / andThen", () => {
    expect(none.map(() => 1)).toBe(none);
    // @ts-expect-error
    expect(none.andThen(() => 1)).toBe(none);
    expect(none.andThen(() => some(1))).toBe(none);

    expect(someString.map(() => 1)).toEqual(some(1));
    // @ts-expect-error
    someString.andThen(() => 1);
    expect(someString.andThen(() => some(1))).toEqual(some(1));
});

test("all / any", () => {
    const strings = ["foo", "bar", "baz"];
    const options = strings.map(some);

    expect(anyOption(...options)).toEqual(some("foo"));
    expect(allOptions(...options)).toEqual(some(strings));

    expect(anyOption(...options, none)).toEqual(some("foo"));
    expect(allOptions(...options, none)).toEqual(none);
});
