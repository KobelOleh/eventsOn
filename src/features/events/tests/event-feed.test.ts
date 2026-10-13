import { describe, expect, it } from "vitest";
import type { EventDto } from "../lib/event-dto";
import { feedView, initialFeed, reduceFeed } from "../lib/event-feed";

const event = (id: string): EventDto => ({
  id,
  title: id,
  description: "",
  startsAt: "2026-10-01T09:00:00.000Z",
  importance: "NORMAL",
});

const page = (ids: string[], nextCursor: string | null = null) => ({
  items: ids.map(event),
  nextCursor,
});

describe("event feed", () => {
  it("starts on the skeleton", () => {
    expect(feedView(initialFeed)).toBe("loading");
  });

  it("shows the first page, then the empty state when there is none", () => {
    const loaded = reduceFeed(initialFeed, {
      type: "loaded",
      page: page(["a"], "c1"),
    });
    expect(feedView(loaded)).toBe("rows");
    expect(loaded.nextCursor).toBe("c1");

    const empty = reduceFeed(initialFeed, { type: "loaded", page: page([]) });
    expect(feedView(empty)).toBe("empty");
  });

  it("keeps the rows on screen, dimmed, while a new Filter loads", () => {
    const shown = reduceFeed(initialFeed, {
      type: "loaded",
      page: page(["a"]),
    });
    const reloading = reduceFeed(shown, { type: "reload", mode: "filter" });
    expect(reloading.items).toHaveLength(1);
    expect(reloading.refreshing).toBe(true);
    expect(feedView(reloading)).toBe("rows");

    const done = reduceFeed(reloading, { type: "loaded", page: page(["b"]) });
    expect(done.items.map((e) => e.id)).toEqual(["b"]);
    expect(done.refreshing).toBe(false);
  });

  it("refreshes silently after a change without any indicator", () => {
    const shown = reduceFeed(initialFeed, {
      type: "loaded",
      page: page(["a"]),
    });
    const reloading = reduceFeed(shown, { type: "reload", mode: "silent" });
    expect(reloading.refreshing).toBe(false);
    expect(reloading.loading).toBe(false);
  });

  it("drops rows of an older Filter when a visible reload fails", () => {
    const shown = reduceFeed(initialFeed, {
      type: "loaded",
      page: page(["a"], "c"),
    });
    const failed = reduceFeed(
      reduceFeed(shown, { type: "reload", mode: "filter" }),
      { type: "loadFailed", mode: "filter" }
    );
    expect(failed.items).toEqual([]);
    expect(failed.nextCursor).toBeNull();
    expect(feedView(failed)).toBe("failed");
    expect(failed.refreshing).toBe(false);
  });

  it("keeps the rows when a silent reload fails, and says so", () => {
    const shown = reduceFeed(initialFeed, {
      type: "loaded",
      page: page(["a"], "c"),
    });
    const failed = reduceFeed(shown, { type: "loadFailed", mode: "silent" });
    expect(failed.items).toHaveLength(1);
    expect(failed.nextCursor).toBeNull();
    expect(failed.failed).toBe(true);
    expect(feedView(failed)).toBe("rows");
  });

  it("appends the next page, and keeps the rows when it fails", () => {
    const first = reduceFeed(initialFeed, {
      type: "loaded",
      page: page(["a"], "c1"),
    });
    const loading = reduceFeed(first, { type: "more" });
    expect(loading.loadingMore).toBe(true);

    const second = reduceFeed(loading, {
      type: "moreLoaded",
      page: page(["b"]),
    });
    expect(second.items.map((e) => e.id)).toEqual(["a", "b"]);
    expect(second.nextCursor).toBeNull();
    expect(second.loadingMore).toBe(false);

    const failed = reduceFeed(loading, { type: "moreFailed" });
    expect(failed.items.map((e) => e.id)).toEqual(["a"]);
    expect(failed.nextCursor).toBe("c1");
    expect(failed.failed).toBe(true);
    expect(failed.loadingMore).toBe(false);
  });

  it("restarting the list cancels a load-more in progress", () => {
    const first = reduceFeed(initialFeed, {
      type: "loaded",
      page: page(["a"], "c1"),
    });
    const more = reduceFeed(first, { type: "more" });
    const restarted = reduceFeed(more, { type: "reload", mode: "filter" });
    expect(restarted.loadingMore).toBe(false);
  });
});
