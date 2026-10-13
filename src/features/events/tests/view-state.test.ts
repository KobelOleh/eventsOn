import { describe, expect, it } from "vitest";
import { clickedDateParts } from "../lib/datetime";
import {
  changeFilter,
  navigateToDate,
  parseViewState,
  switchMode,
  switchView,
} from "../lib/view-state";

const params = (query: string) => new URLSearchParams(query);
const TODAY = "2026-10-13";

describe("parseViewState", () => {
  it("reads the normalised Filter", () => {
    expect(
      parseViewState(params("importance=CRITICAL,x&q=%20a")).filter
    ).toEqual({ importance: ["CRITICAL"], q: "a" });
  });
});

describe("calendar mode in the URL", () => {
  it("defaults to month and ignores unknown values", () => {
    expect(parseViewState(params("")).mode).toBe("month");
    expect(parseViewState(params("mode=year")).mode).toBe("month");
  });

  it("reads week and day", () => {
    expect(parseViewState(params("mode=week")).mode).toBe("week");
    expect(parseViewState(params("mode=day")).mode).toBe("day");
  });
});

describe("switchView", () => {
  it("pushes and writes the view explicitly", () => {
    const t = switchView("", "list");
    expect(t.history).toBe("push");
    expect(params(t.search).get("view")).toBe("list");
  });

  it("preserves unknown params", () => {
    const next = params(switchView("foo=1&q=a", "list").search);
    expect(next.get("foo")).toBe("1");
    expect(next.get("q")).toBe("a");
  });
});

describe("switchMode", () => {
  it("pushes, writes the mode and keeps other params", () => {
    const t = switchMode(
      "view=calendar&date=2026-12-01&importance=CRITICAL&q=a&foo=1",
      "week",
      TODAY
    );
    const next = params(t.search);
    expect(t.history).toBe("push");
    expect(next.get("mode")).toBe("week");
    expect(next.get("view")).toBe("calendar");
    expect(next.get("importance")).toBe("CRITICAL");
    expect(next.get("q")).toBe("a");
    expect(next.get("foo")).toBe("1");
  });

  it("drops the mode param when switching back to month", () => {
    const next = params(switchMode("mode=week", "month", TODAY).search);
    expect(next.has("mode")).toBe(false);
  });

  it("lands on today when leaving the current month's grid", () => {
    const shown = switchMode("date=2026-10-01", "week", TODAY).search;
    expect(params(shown).get("date")).toBe(TODAY);
    expect(params(switchMode("", "day", TODAY).search).get("date")).toBe(TODAY);
  });

  it("keeps the anchor when leaving any other month", () => {
    const next = switchMode("date=2026-12-01", "week", TODAY).search;
    expect(params(next).get("date")).toBe("2026-12-01");
  });

  it("keeps the date when not leaving the month grid", () => {
    const toDay = switchMode("mode=week&date=2026-10-05", "day", TODAY).search;
    expect(params(toDay).get("date")).toBe("2026-10-05");
    const toMonth = switchMode("mode=week&date=2026-10-05", "month", TODAY);
    expect(params(toMonth.search).get("date")).toBe("2026-10-05");
  });
});

describe("navigateToDate", () => {
  it("replaces, writes the date and preserves other params", () => {
    const t = navigateToDate("view=calendar&mode=week&foo=1", "2026-11-02");
    const next = params(t!.search);
    expect(t!.history).toBe("replace");
    expect(next.get("date")).toBe("2026-11-02");
    expect(next.get("mode")).toBe("week");
    expect(next.get("foo")).toBe("1");
  });

  it("is a no-op for the date already shown", () => {
    expect(navigateToDate("date=2026-11-02", "2026-11-02")).toBeNull();
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

describe("changeFilter", () => {
  it("replaces, merges a partial patch and keeps unknown params", () => {
    const t = changeFilter("view=list&foo=1&q=a&importance=NORMAL", {
      importance: [],
    });
    const next = params(t.search);
    expect(t.history).toBe("replace");
    expect(next.get("foo")).toBe("1");
    expect(next.get("q")).toBe("a");
    expect(next.has("importance")).toBe(false);
  });

  it("does not disturb view, mode or date", () => {
    const next = params(
      changeFilter("view=calendar&mode=week&date=2026-10-05", { q: "x" }).search
    );
    expect(next.get("view")).toBe("calendar");
    expect(next.get("mode")).toBe("week");
    expect(next.get("date")).toBe("2026-10-05");
    expect(next.get("q")).toBe("x");
  });
});
