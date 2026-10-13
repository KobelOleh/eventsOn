import { describe, expect, it } from "vitest";
import {
  filterEquals,
  isNarrowing,
  normaliseFilter,
  parseFilter,
  UNFILTERED,
  writeFilter,
} from "../lib/event-filter";
import { MAX_SEARCH_LENGTH } from "../lib/constants";
import { filterSchema } from "../lib/schemas";

describe("parseFilter", () => {
  it("reads no params as Unfiltered", () => {
    expect(parseFilter("")).toEqual({ importance: [], q: "" });
  });

  it("trims the keyword search", () => {
    expect(parseFilter("q=%20a")).toEqual(parseFilter("q=a"));
    expect(parseFilter("q=%20a%20").q).toBe("a");
  });

  it("cuts an over-long keyword search to the maximum length", () => {
    const q = parseFilter(`q=${"x".repeat(MAX_SEARCH_LENGTH + 50)}`).q;
    expect(q).toHaveLength(MAX_SEARCH_LENGTH);
  });

  it("dedupes, drops unknown and orders Importance canonically", () => {
    expect(
      parseFilter("importance=CRITICAL,bogus,NORMAL,CRITICAL,,").importance
    ).toEqual(["NORMAL", "CRITICAL"]);
  });
});

describe("writeFilter", () => {
  it("writes nothing for Unfiltered", () => {
    expect(writeFilter(UNFILTERED)).toBe("");
  });

  it("removes Filter params but keeps unknown ones", () => {
    expect(writeFilter(UNFILTERED, "view=list&importance=NORMAL&q=a")).toBe(
      "view=list"
    );
  });

  it("round-trips through parse", () => {
    const filter = parseFilter("importance=IMPORTANT,NORMAL&q=%20cake");
    expect(writeFilter(filter)).toBe("importance=NORMAL%2CIMPORTANT&q=cake");
    expect(parseFilter(writeFilter(filter))).toEqual(filter);
  });
});

describe("filterEquals and isNarrowing", () => {
  const cases = {
    unfiltered: UNFILTERED,
    importance: parseFilter("importance=CRITICAL"),
    keyword: parseFilter("q=a"),
    both: parseFilter("importance=CRITICAL&q=a"),
  };

  it("compares Filters by value", () => {
    expect(
      filterEquals(cases.both, parseFilter("q=a&importance=CRITICAL"))
    ).toBe(true);
    expect(filterEquals(cases.importance, cases.both)).toBe(false);
    expect(filterEquals(cases.keyword, cases.unfiltered)).toBe(false);
  });

  it("is narrowing unless Unfiltered", () => {
    expect(isNarrowing(cases.unfiltered)).toBe(false);
    expect(isNarrowing(cases.importance)).toBe(true);
    expect(isNarrowing(cases.keyword)).toBe(true);
    expect(isNarrowing(cases.both)).toBe(true);
  });
});

describe("normaliseFilter", () => {
  it("trims, dedupes and orders Importance canonically", () => {
    expect(
      normaliseFilter({
        importance: ["CRITICAL", "NORMAL", "CRITICAL"],
        q: " a ",
      })
    ).toEqual({ importance: ["NORMAL", "CRITICAL"], q: "a" });
  });

  it("reads missing parts as Unfiltered", () => {
    expect(normaliseFilter({})).toEqual(UNFILTERED);
  });
});

describe("the server filter schema and the URL parser", () => {
  const raw = {
    importance: ["IMPORTANT", "NORMAL", "IMPORTANT"] as const,
    q: "  cake ",
  };

  it("normalise the same Filter the same way", () => {
    const fromUrl = parseFilter(
      "importance=IMPORTANT,NORMAL,IMPORTANT&q=%20%20cake%20"
    );
    const parsed = filterSchema.parse({
      ...raw,
      importance: [...raw.importance],
    });
    expect(parsed).toEqual(fromUrl);
  });

  it("reads a blank search as Unfiltered, like the URL parser", () => {
    expect(filterSchema.parse({ q: "   " })).toEqual(parseFilter(""));
  });
});
