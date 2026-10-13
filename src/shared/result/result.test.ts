import { describe, expect, it } from "vitest";
import { fail, ok } from "./index";

describe("Result", () => {
  it("wraps data in a success result", () => {
    expect(ok({ id: "1" })).toEqual({ ok: true, data: { id: "1" } });
  });

  it("carries an error code, optionally with field errors", () => {
    expect(fail("NOT_FOUND")).toEqual({
      ok: false,
      error: { code: "NOT_FOUND" },
    });
    expect(fail("VALIDATION", { title: ["required"] })).toEqual({
      ok: false,
      error: { code: "VALIDATION", fieldErrors: { title: ["required"] } },
    });
  });
});
