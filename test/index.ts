import { assert, IsExact } from "conditional-type-checks";
import {
  Err,
  Ok,
  Result,
  ResultOkType,
  ResultErrType,
  Results,
} from "../src/index";

declare function work(): Result<string, number>;
declare function ok(): Ok<string>;
declare function err(): Err<number>;
//#region ok, err, val
{
  const r = new Err(0);
  assert<typeof r.err>(true);
  assert<typeof r.ok>(false);
  assert<IsExact<typeof r.val, number>>(true);
}
{
  const r = new Ok(0);
  assert<typeof r.err>(false);
  assert<typeof r.ok>(true);
  assert<IsExact<typeof r.val, number>>(true);
}
//#endregion
//#region Ok<T> & Err<E> should be Result<T, E>
{
  const r1 = new Err(0);
  const r2 = new Ok("");
  const r = Math.random() ? r1 : r2;
  assert<IsExact<typeof r, Result<string, number>>>(true);
}
//#endregion
//#region static EMPTY
assert<IsExact<typeof Err.EMPTY, Err<void>>>(true);
assert<IsExact<typeof Ok.EMPTY, Ok<void>>>(true);
//#endregion
//#region Type narrowing test (tagged union)
{
  const r = work();
  if (r.ok) {
    assert<IsExact<typeof r, Ok<string>>>(true);
  } else {
    assert<IsExact<typeof r, Err<number>>>(true);
  }
  // ---------------------------------------------
  if (r.err) {
    assert<IsExact<typeof r, Err<number>>>(true);
  } else {
    assert<IsExact<typeof r, Ok<string>>>(true);
  }
}
//#endregion
//#region Type narrowing test (instanceof)
{
  const r = work();
  if (r instanceof Ok) {
    assert<IsExact<typeof r, Ok<string>>>(true);
  } else {
    assert<IsExact<typeof r, Err<number>>>(true);
  }
  // ---------------------------------------------
  if (r instanceof Err) {
    assert<IsExact<typeof r, Err<number>>>(true);
  } else {
    assert<IsExact<typeof r, Ok<string>>>(true);
  }
}
//#endregion
//#region !!! NOT PASSING: else(val)
{
  const r1 = ok().else(false);
  expect_string(r1);

  const r2 = err().else(false);
  assert<IsExact<false, typeof r2>>(true);

  // FIXME: GH#4 TS2349: This expression (Result<?, ?>.else) is not callable
  // @ts-expect-error
  const r3 = work().else(false);
  // @ts-expect-error
  assert<IsExact<typeof r3, string | false>>(true);
}
//#endregion
//#region expect(msg)
{
  const r1 = ok().expect("");
  expect_string(r1);
  const r2 = err().expect("");
  expect_never(r2);
  const r3 = work().expect("");
  expect_string(r3);
}
//#endregion
//#region unwrap()
{
  const r1 = ok().unwrap();
  expect_string(r1);
  const r2 = err().unwrap();
  expect_never(r2);
  const r3 = work().unwrap();
  expect_string(r3);
}
//#endregion
//#region map(mapper)
{
  const r1 = ok().map(Symbol);
  assert<IsExact<typeof r1, Ok<symbol>>>(true);
  const r2 = err().map((x) => Symbol());
  assert<IsExact<typeof r2, Err<number>>>(true);
  const r3 = work().map(Symbol);
  assert<IsExact<typeof r3, Result<symbol, number>>>(true);
}
//#endregion
//#region mapErr(mapper)
{
  const r1 = ok().mapErr(Symbol);
  assert<IsExact<typeof r1, Ok<string>>>(true);
  const r2 = err().mapErr((x) => Symbol());
  assert<IsExact<typeof r2, Err<symbol>>>(true);
  const r3 = work().mapErr(Symbol);
  assert<IsExact<typeof r3, Result<string, symbol>>>(true);
}
//#endregion
//#region ResultOkType & ResultErrType
{
  type a = ResultOkType<Ok<string>>;
  assert<IsExact<string, a>>(true);
  type b = ResultOkType<Err<string>>;
  assert<IsExact<never, b>>(true);
  type c = ResultOkType<Result<string, number>>;
  assert<IsExact<string, c>>(true);
}
{
  type a = ResultErrType<Ok<string>>;
  assert<IsExact<never, a>>(true);
  type b = ResultErrType<Err<string>>;
  assert<IsExact<string, b>>(true);
  type c = ResultErrType<Result<string, number>>;
  assert<IsExact<number, c>>(true);
}
//#endregion
//#region !!! NOT PASSING: Results(...args)
{
  const r0 = Results();
  // @ts-expect-error, actually Result<any[], any>
  assert<IsExact<typeof r0, Result<[], void>>>(true);
  const r1 = Results(work());
  // @ts-expect-error, actually Result<any[], any>
  assert<IsExact<typeof r1, Result<[string], number>>>(true);
  const r2 = Results(work(), work());
  assert<IsExact<typeof r2, Result<[string, string], number>>>(true);
  const r3 = Results(ok(), err(), work());
  assert<IsExact<typeof r3, Result<[string, never, string], number>>>(true);
}
//#endregion
function expect_string(x: string) {}
function expect_never(x: never) {}
