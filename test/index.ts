import { assert, IsExact, IsNever } from "conditional-type-checks";
import {
  Err,
  Ok,
  Result,
  ResultOkType,
  ResultErrType,
  Results,
} from "../dist/index";

declare function work(): Result<string, number>;
declare function work2(x: string): Result<symbol, string>;
declare function ok(): Ok<string>;
declare function err(): Err<number>;
//#region Callable
{
  const x = Err(0);
  eq<Err<number>, typeof x>(true);
  const y = Ok(0);
  eq<Ok<number>, typeof y>(true);
}
//#endregion
//#region ok, err, val
{
  const r = new Err(0);
  assert<typeof r.err>(true);
  assert<typeof r.ok>(false);
  eq<typeof r.val, number>(true);
}
{
  const r = new Ok(0);
  assert<typeof r.err>(false);
  assert<typeof r.ok>(true);
  eq<typeof r.val, number>(true);
}
//#endregion
//#region Ok<T> & Err<E> should be Result<T, E>
{
  const r1 = new Err(0);
  const r2 = new Ok("");
  const r = Math.random() ? r1 : r2;
  eq<typeof r, Result<string, number>>(true);
}
//#endregion
//#region static EMPTY
eq<typeof Err.EMPTY, Err<void>>(true);
eq<typeof Ok.EMPTY, Ok<void>>(true);
//#endregion
//#region Type narrowing test (tagged union)
{
  const r = work();
  if (r.ok) {
    eq<typeof r, Ok<string>>(true);
  } else {
    eq<typeof r, Err<number>>(true);
  }
  // ---------------------------------------------
  if (r.err) {
    eq<typeof r, Err<number>>(true);
  } else {
    eq<typeof r, Ok<string>>(true);
  }
}
//#endregion
//#region Type narrowing test (instanceof)
{
  const r = work();
  if (r instanceof Ok) {
    eq<typeof r, Ok<string>>(true);
  } else {
    eq<typeof r, Err<number>>(true);
  }
  // ---------------------------------------------
  if (r instanceof Err) {
    eq<typeof r, Err<number>>(true);
  } else {
    eq<typeof r, Ok<string>>(true);
  }
}
//#endregion
//#region else(val)
{
  const r1 = ok().else(false);
  expect_string(r1, true);

  const r2 = err().else(false);
  eq<false, typeof r2>(true);

  const r3 = work().else(false);
  eq<typeof r3, string | false>(true);
}
//#endregion
//#region expect(msg)
{
  const r1 = ok().expect("");
  expect_string(r1, true);
  const r2 = err().expect("");
  expect_never(r2, true);
  const r3 = work().expect("");
  expect_string(r3, true);
}
//#endregion
//#region unwrap()
{
  const r1 = ok().unwrap();
  expect_string(r1, true);
  const r2 = err().unwrap();
  expect_never(r2, true);
  const r3 = work().unwrap();
  expect_string(r3, true);
}
//#endregion
//#region map(mapper)
{
  const r1 = ok().map(Symbol);
  eq<typeof r1, Ok<symbol>>(true);
  const r2 = err().map((x) => Symbol());
  eq<typeof r2, Err<number>>(true);
  const r3 = work().map(Symbol);
  eq<typeof r3, Result<symbol, number>>(true);
}
//#endregion
//#region flatMap
{
  const r1 = ok().flatMap(work);
  eq<typeof r1, Result<string, number>>(true);
  const r2 = err().flatMap(work);
  eq<typeof r2, Err<number>>(true);
  const r3 = work().flatMap(work2);
  eq<typeof r3, Result<symbol, string | number>>(true);
}
//#endregion
//#region mapErr(mapper)
{
  const r1 = ok().mapErr(Symbol);
  eq<typeof r1, Ok<string>>(true);
  const r2 = err().mapErr((x) => Symbol());
  eq<typeof r2, Err<symbol>>(true);
  const r3 = work().mapErr(Symbol);
  eq<typeof r3, Result<string, symbol>>(true);
}
//#endregion
//#region ResultOkType & ResultErrType
{
  type a = ResultOkType<Ok<string>>;
  eq<string, a>(true);
  type b = ResultOkType<Err<string>>;
  eq<never, b>(true);
  type c = ResultOkType<Result<string, number>>;
  eq<string, c>(true);
}
{
  type a = ResultErrType<Ok<string>>;
  eq<never, a>(true);
  type b = ResultErrType<Err<string>>;
  eq<string, b>(true);
  type c = ResultErrType<Result<string, number>>;
  eq<number, c>(true);
}
//#endregion
//#region Results(...args)
{
  const r0 = Results();
  eq<typeof r0, Result<[], never>>(true);
  const r1 = Results(work());
  eq<typeof r1, Result<[string], number>>(true);
  const r2 = Results(work(), work());
  eq<typeof r2, Result<[string, string], number>>(true);
  const r3 = Results(ok(), err(), work());
  eq<typeof r3, Result<[string, never, string], number>>(true);
}
//#endregion
//#region Iterable<T>
{
  const x = work()[Symbol.iterator];
  assert<
    IsExact<
      typeof x,
      | (() => Iterator<string, any, undefined>)
      | (() => Iterator<never, any, undefined>)
    >
  >(true);
  for (const char of work()) {
    expect_string(char, true);
  }
  for (const item of Ok([1, 2, 3])) {
    assert<IsExact<number, typeof item>>(true);
  }
  for (const item of Err(0)) {
    expect_never(item, true);
    throw new Error(
      "Unreachable, Err@@iterator should emit no value and return"
    );
  }
  // @ts-expect-error An iterator must have a 'next()' method.ts(2489)
  for (const expectError of Ok(1)) {
  }
}
//#endregion
function expect_string<T>(x: T, y: IsExact<T, string>) {}
function expect_never<T>(x: T, y: IsNever<T>) {}
function eq<A, B>(x: IsExact<A, B>) {}
