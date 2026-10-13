import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

// Only the session boundary is mocked (one seam, real Postgres).
vi.mock("@/features/auth", () => ({
  requireOwnerId: vi.fn(),
}));

import { requireOwnerId } from "@/features/auth";
import { prisma } from "@/shared/db";
import { createEvent, listEvents, listEventsInRange } from "../actions";

const october = {
  start: "2026-10-01T00:00:00.000Z",
  end: "2026-12-01T00:00:00.000Z",
};

async function newUser(email: string): Promise<string> {
  return (await prisma.user.create({ data: { email } })).id;
}

const signInAs = (id: string) =>
  vi.mocked(requireOwnerId).mockResolvedValue(id);

let counter = 0;
/** Seeds an Event; events are ordered by creation order (minute steps). */
async function seed(
  title: string,
  importance = "NORMAL",
  description = ""
): Promise<void> {
  counter += 1;
  const startsAt = new Date(Date.UTC(2026, 9, 1, 0, counter)).toISOString();
  const r = await createEvent({ title, description, startsAt, importance });
  if (!r.ok) throw new Error("seed failed");
}

async function rangeTitles(filter: object = {}): Promise<string[]> {
  const r = await listEventsInRange({ ...october, ...filter });
  if (!r.ok) throw new Error(JSON.stringify(r.error));
  return r.data.map((e) => e.title);
}

async function listTitles(filter: object = {}): Promise<string[]> {
  const r = await listEvents(filter);
  if (!r.ok) throw new Error(JSON.stringify(r.error));
  return r.data.items.map((e) => e.title);
}

describe("filter and search (events Server Actions)", () => {
  let owner: string;
  let other: string;

  beforeEach(async () => {
    counter = 0;
    await prisma.event.deleteMany();
    await prisma.user.deleteMany();
    owner = await newUser("f-owner@example.com");
    other = await newUser("f-other@example.com");
    signInAs(owner);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("importance filter", () => {
    beforeEach(async () => {
      await seed("n", "NORMAL");
      await seed("i", "IMPORTANT");
      await seed("c", "CRITICAL");
    });

    it("narrows both views to one level", async () => {
      expect(await rangeTitles({ importance: ["IMPORTANT"] })).toEqual(["i"]);
      expect(await listTitles({ importance: ["IMPORTANT"] })).toEqual(["i"]);
    });

    it("narrows to several levels", async () => {
      const f = { importance: ["NORMAL", "CRITICAL"] };
      expect(await rangeTitles(f)).toEqual(["n", "c"]);
      expect(await listTitles(f)).toEqual(["n", "c"]);
    });

    it("shows everything when no level is selected", async () => {
      expect(await rangeTitles({ importance: [] })).toEqual(["n", "i", "c"]);
      expect(await listTitles({})).toEqual(["n", "i", "c"]);
    });

    it("rejects an unknown level", async () => {
      const r = await listEvents({ importance: ["URGENT"] });
      expect(r).toMatchObject({ ok: false, error: { code: "VALIDATION" } });
    });
  });

  describe("keyword search", () => {
    it("ignores letter case over title and description", async () => {
      await seed("Dentist visit");
      await seed("Other", "NORMAL", "bring the DENTIST card");
      await seed("Unrelated");
      expect(await rangeTitles({ q: "dEnTiSt" })).toEqual([
        "Dentist visit",
        "Other",
      ]);
      expect(await listTitles({ q: "dEnTiSt" })).toEqual([
        "Dentist visit",
        "Other",
      ]);
    });

    it("ignores case for Cyrillic", async () => {
      await seed("Зустріч з ЛІКАРЕМ");
      await seed("Лікар", "NORMAL", "щось");
      await seed("Інше", "NORMAL", "Візит до лікаря");
      await seed("Нічого");
      const expected = ["Зустріч з ЛІКАРЕМ", "Лікар", "Інше"];
      expect(await rangeTitles({ q: "лікар" })).toEqual(expected);
      expect(await listTitles({ q: "ЛІКАР" })).toEqual(expected);
    });

    it("treats % and _ literally", async () => {
      await seed("100% done");
      await seed("snake_case");
      await seed("snakeXcase");
      await seed("plain");
      expect(await rangeTitles({ q: "%" })).toEqual(["100% done"]);
      expect(await listTitles({ q: "%" })).toEqual(["100% done"]);
      expect(await rangeTitles({ q: "e_c" })).toEqual(["snake_case"]);
      expect(await listTitles({ q: "e_c" })).toEqual(["snake_case"]);
    });

    it("treats a backslash literally", async () => {
      await seed("a\\b");
      await seed("ab");
      expect(await listTitles({ q: "a\\b" })).toEqual(["a\\b"]);
    });

    it("treats a blank query as no search", async () => {
      await seed("x");
      expect(await listTitles({ q: "   " })).toEqual(["x"]);
      expect(await rangeTitles({ q: "" })).toEqual(["x"]);
    });

    it("rejects an over-long query", async () => {
      const r = await listEvents({ q: "x".repeat(201) });
      expect(r).toMatchObject({ ok: false, error: { code: "VALIDATION" } });
    });
  });

  describe("filter and search together", () => {
    it("returns the intersection in both views", async () => {
      await seed("team lunch", "NORMAL");
      await seed("team review", "CRITICAL");
      await seed("dentist", "CRITICAL");
      const f = { importance: ["CRITICAL"], q: "TEAM" };
      expect(await rangeTitles(f)).toEqual(["team review"]);
      expect(await listTitles(f)).toEqual(["team review"]);
    });
  });

  describe("pagination with an active filter", () => {
    it("pages only matching Events, with a correct cursor", async () => {
      for (let i = 1; i <= 25; i++) {
        await seed(`e${i}`, i % 2 === 0 ? "CRITICAL" : "NORMAL");
      }
      const filter = { importance: ["CRITICAL"] };
      const first = await listEvents(filter);
      if (!first.ok) throw new Error("first page failed");
      expect(first.data.items).toHaveLength(12);
      expect(first.data.nextCursor).toBeNull();

      for (let i = 26; i <= 60; i++) await seed(`e${i}`, "CRITICAL");
      const p1 = await listEvents(filter);
      if (!p1.ok || !p1.data.nextCursor) throw new Error("expected page 2");
      expect(p1.data.items).toHaveLength(20);
      const p2 = await listEvents({ ...filter, cursor: p1.data.nextCursor });
      if (!p2.ok) throw new Error("page 2 failed");
      expect(p2.data.items).toHaveLength(20);
      expect(p2.data.nextCursor).not.toBeNull();
      const all = [...p1.data.items, ...p2.data.items];
      expect(all.every((e) => e.importance === "CRITICAL")).toBe(true);
      expect(new Set(all.map((e) => e.id)).size).toBe(40);
    });
  });

  describe("Owner isolation", () => {
    it("never returns another Owner's matches", async () => {
      signInAs(other);
      await seed("secret dentist", "CRITICAL");
      signInAs(owner);
      await seed("my dentist", "CRITICAL");
      const f = { importance: ["CRITICAL"], q: "dentist" };
      expect(await rangeTitles(f)).toEqual(["my dentist"]);
      expect(await listTitles(f)).toEqual(["my dentist"]);
    });
  });
});
