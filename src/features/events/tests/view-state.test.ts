import { describe, expect, it } from "vitest";
import { clickedDateParts } from "../lib/datetime";
import {
  dateForModeSwitch,
  parseViewState,
  withViewState,
} from "../lib/view-state";

const params = (query: string) => new URLSearchParams(query);

describe("calendar mode in the URL", () => {
  it("defaults to month and ignores unknown values", () => {
    expect(parseViewState(params("")).mode).toBe("month");
    expect(parseViewState(params("mode=year")).mode).toBe("month");
  });

  it("reads week and day", () => {
    expect(parseViewState(params("mode=week")).mode).toBe("week");
    expect(parseViewState(params("mode=day")).mode).toBe("day");
  });

  it("writes the mode without touching other params", () => {
    const next = new URLSearchParams(
      withViewState("view=calendar&date=2026-10-01&importance=CRITICAL&q=a", {
        mode: "week",
      })
    );
    expect(next.get("mode")).toBe("week");
    expect(next.get("view")).toBe("calendar");
    expect(next.get("date")).toBe("2026-10-01");
    expect(next.get("importance")).toBe("CRITICAL");
    expect(next.get("q")).toBe("a");
  });

  it("drops the mode param when switching back to month", () => {
    expect(withViewState("mode=week", { mode: "month" })).toBe("");
  });
});

describe("dateForModeSwitch", () => {
  it("jumps to today when the shown month is the current month", () => {
    expect(dateForModeSwitch("2026-10-01", "2026-10-13")).toBe("2026-10-13");
    expect(dateForModeSwitch(null, "2026-10-13")).toBe("2026-10-13");
  });

  it("keeps the anchor of any other month", () => {
    expect(dateForModeSwitch("2026-12-01", "2026-10-13")).toBe("2026-12-01");
  });
});

describe("clickedDateParts", () => {
  it("a day cell click has a date and no time", () => {
    expect(clickedDateParts("2026-10-14")).toEqual({ date: "2026-10-14" });
  });

  it("a time slot click carries the slot time", () => {
    expect(clickedDateParts("2026-10-14T13:30:00+03:00")).toEqual({
      date: "2026-10-14",
      time: "13:30",
    });
  });
});

describe("filter in the URL", () => {
  it("reads the normalised Filter", () => {
    expect(
      parseViewState(params("importance=CRITICAL,x&q=%20a")).filter
    ).toEqual({ importance: ["CRITICAL"], q: "a" });
  });

  it("merges a partial Filter patch and keeps unknown params", () => {
    const next = new URLSearchParams(
      withViewState("view=list&foo=1&q=a&importance=NORMAL", {
        filter: { importance: [] },
      })
    );
    expect(next.get("foo")).toBe("1");
    expect(next.get("q")).toBe("a");
    expect(next.has("importance")).toBe(false);
  });
});
