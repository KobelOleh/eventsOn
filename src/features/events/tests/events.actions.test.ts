import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

// Only the session boundary is mocked (one seam, real Postgres).
vi.mock("@/features/auth", () => ({
  requireOwnerId: vi.fn(),
}));

import { requireOwnerId } from "@/features/auth";
import { prisma } from "@/shared/db";
import { uk } from "@/shared/i18n/uk";
import {
  createEvent,
  deleteEvent,
  listEventsInRange,
  updateEvent,
} from "../actions";

async function newUser(email: string): Promise<string> {
  const user = await prisma.user.create({ data: { email } });
  return user.id;
}

function signInAs(userId: string) {
  vi.mocked(requireOwnerId).mockResolvedValue(userId);
}

const valid = {
  title: "Dentist",
  description: "Bring the card",
  startsAt: "2026-10-15T06:00:00.000Z",
  importance: "IMPORTANT",
};

const october = {
  start: "2026-10-01T00:00:00.000Z",
  end: "2026-11-01T00:00:00.000Z",
};

describe("events Server Actions", () => {
  let userA: string;
  let userB: string;

  beforeEach(async () => {
    await prisma.event.deleteMany();
    await prisma.user.deleteMany();
    userA = await newUser("a@example.com");
    userB = await newUser("b@example.com");
    signInAs(userA);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("createEvent and listEventsInRange", () => {
    it("creates an Event that then appears in the range it falls into", async () => {
      const created = await createEvent(valid);
      expect(created).toMatchObject({
        ok: true,
        data: {
          title: "Dentist",
          description: "Bring the card",
          startsAt: "2026-10-15T06:00:00.000Z",
          importance: "IMPORTANT",
        },
      });

      const listed = await listEventsInRange(october);
      expect(listed).toMatchObject({
        ok: true,
        data: [{ title: "Dentist", importance: "IMPORTANT" }],
      });
    });

    it("defaults Importance to Normal and the description to empty", async () => {
      const created = await createEvent({
        title: "Walk",
        startsAt: "2026-10-15T06:00:00.000Z",
      });
      expect(created).toMatchObject({
        ok: true,
        data: { importance: "NORMAL", description: "" },
      });
    });

    it("allows an Event in the past", async () => {
      const created = await createEvent({
        ...valid,
        startsAt: "1999-01-01T10:00:00.000Z",
      });
      expect(created.ok).toBe(true);
    });

    it("treats the range as start-inclusive and end-exclusive", async () => {
      const at = (iso: string) =>
        createEvent({ ...valid, title: iso, startsAt: iso });
      await at("2026-09-30T23:59:59.999Z"); // just before
      await at("2026-10-01T00:00:00.000Z"); // exactly start
      await at("2026-10-31T23:59:59.999Z"); // just before end
      await at("2026-11-01T00:00:00.000Z"); // exactly end

      const listed = await listEventsInRange(october);

      expect(listed.ok && listed.data.map((e) => e.title)).toEqual([
        "2026-10-01T00:00:00.000Z",
        "2026-10-31T23:59:59.999Z",
      ]);
    });

    it("accepts offset-aware range bounds like the calendar sends", async () => {
      await createEvent({ ...valid, startsAt: "2026-10-01T20:30:00.000Z" });
      // 23:00+03:00 == 20:00Z .. 00:00+03:00 == 21:00Z
      const listed = await listEventsInRange({
        start: "2026-10-01T23:00:00+03:00",
        end: "2026-10-02T00:00:00+03:00",
      });
      expect(listed.ok && listed.data).toHaveLength(1);
    });

    it("returns Events ordered by start time", async () => {
      await createEvent({
        ...valid,
        title: "late",
        startsAt: "2026-10-20T10:00:00.000Z",
      });
      await createEvent({
        ...valid,
        title: "early",
        startsAt: "2026-10-02T10:00:00.000Z",
      });
      const listed = await listEventsInRange(october);
      expect(listed.ok && listed.data.map((e) => e.title)).toEqual([
        "early",
        "late",
      ]);
    });

    it("rejects a malformed, inverted or oversized range", async () => {
      const bad = [
        { start: "nope", end: "2026-11-01T00:00:00Z" },
        { start: "2026-11-01T00:00:00Z", end: "2026-10-01T00:00:00Z" },
        { start: "2020-01-01T00:00:00Z", end: "2026-11-01T00:00:00Z" },
      ];
      for (const range of bad) {
        expect(await listEventsInRange(range)).toMatchObject({
          ok: false,
          error: { code: "VALIDATION" },
        });
      }
    });
  });

  describe("validation", () => {
    it("requires a title", async () => {
      expect(await createEvent({ ...valid, title: "   " })).toEqual({
        ok: false,
        error: {
          code: "VALIDATION",
          fieldErrors: { title: [uk.events.errors.titleRequired] },
        },
      });
    });

    it("accepts a 120-character title and rejects 121", async () => {
      expect((await createEvent({ ...valid, title: "x".repeat(120) })).ok).toBe(
        true
      );
      expect(await createEvent({ ...valid, title: "x".repeat(121) })).toEqual({
        ok: false,
        error: {
          code: "VALIDATION",
          fieldErrors: { title: [uk.events.errors.titleTooLong] },
        },
      });
    });

    it("accepts a 2000-character description and rejects 2001", async () => {
      expect(
        (await createEvent({ ...valid, description: "d".repeat(2000) })).ok
      ).toBe(true);
      expect(
        await createEvent({ ...valid, description: "d".repeat(2001) })
      ).toEqual({
        ok: false,
        error: {
          code: "VALIDATION",
          fieldErrors: { description: [uk.events.errors.descriptionTooLong] },
        },
      });
    });

    it("requires a valid date and time", async () => {
      for (const startsAt of ["", "not a date", undefined]) {
        expect(await createEvent({ ...valid, startsAt })).toEqual({
          ok: false,
          error: {
            code: "VALIDATION",
            fieldErrors: { startsAt: [uk.events.errors.dateRequired] },
          },
        });
      }
    });

    it("rejects an unknown Importance", async () => {
      expect(
        await createEvent({ ...valid, importance: "URGENT" })
      ).toMatchObject({
        ok: false,
        error: {
          code: "VALIDATION",
          fieldErrors: { importance: expect.any(Array) },
        },
      });
    });

    it("reports several field errors at once", async () => {
      const result = await createEvent({ title: "", startsAt: "" });
      expect(result).toMatchObject({
        ok: false,
        error: {
          fieldErrors: {
            title: expect.any(Array),
            startsAt: expect.any(Array),
          },
        },
      });
    });
  });

  describe("updateEvent", () => {
    async function created() {
      const result = await createEvent(valid);
      if (!result.ok) throw new Error("setup failed");
      return result.data;
    }

    it("persists every changed field, visible when read back", async () => {
      const event = await created();
      const updated = await updateEvent(event.id, {
        title: "Dentist (moved)",
        description: "",
        startsAt: "2026-10-20T08:30:00.000Z",
        importance: "CRITICAL",
      });
      expect(updated).toEqual({
        ok: true,
        data: {
          id: event.id,
          title: "Dentist (moved)",
          description: "",
          startsAt: "2026-10-20T08:30:00.000Z",
          importance: "CRITICAL",
        },
      });

      const listed = await listEventsInRange(october);
      expect(listed).toEqual({ ok: true, data: [updated.ok && updated.data] });
    });

    it("applies the same validation as creating and changes nothing on failure", async () => {
      const event = await created();
      expect(await updateEvent(event.id, { ...valid, title: " " })).toEqual({
        ok: false,
        error: {
          code: "VALIDATION",
          fieldErrors: { title: [uk.events.errors.titleRequired] },
        },
      });
      expect(
        await updateEvent(event.id, { ...valid, startsAt: "nope" })
      ).toMatchObject({ ok: false, error: { code: "VALIDATION" } });

      const listed = await listEventsInRange(october);
      expect(listed.ok && listed.data[0]).toMatchObject({ title: "Dentist" });
    });

    it("returns not-found for an unknown id", async () => {
      expect(await updateEvent("does-not-exist", valid)).toEqual({
        ok: false,
        error: { code: "NOT_FOUND" },
      });
    });

    it("returns not-found for another user's Event and changes nothing", async () => {
      const event = await created();

      signInAs(userB);
      expect(
        await updateEvent(event.id, { ...valid, title: "Hijacked" })
      ).toEqual({ ok: false, error: { code: "NOT_FOUND" } });

      signInAs(userA);
      const listed = await listEventsInRange(october);
      expect(listed.ok && listed.data).toEqual([event]);
    });

    it("cannot move an Event to another Owner via the input", async () => {
      const event = await created();
      await updateEvent(event.id, { ...valid, ownerId: userB });

      signInAs(userB);
      const listed = await listEventsInRange(october);
      expect(listed.ok && listed.data).toEqual([]);
    });
  });

  describe("deleteEvent", () => {
    it("permanently removes the Event", async () => {
      const result = await createEvent(valid);
      const id = result.ok ? result.data.id : "";

      expect(await deleteEvent(id)).toEqual({ ok: true, data: { id } });

      const listed = await listEventsInRange(october);
      expect(listed.ok && listed.data).toEqual([]);
      expect(await deleteEvent(id)).toEqual({
        ok: false,
        error: { code: "NOT_FOUND" },
      });
    });

    it("returns not-found for another user's Event and changes nothing", async () => {
      const result = await createEvent(valid);
      const id = result.ok ? result.data.id : "";

      signInAs(userB);
      expect(await deleteEvent(id)).toEqual({
        ok: false,
        error: { code: "NOT_FOUND" },
      });

      signInAs(userA);
      const listed = await listEventsInRange(october);
      expect(listed.ok && listed.data).toHaveLength(1);
    });

    it("treats a non-string id as not-found", async () => {
      expect(await deleteEvent(undefined)).toEqual({
        ok: false,
        error: { code: "NOT_FOUND" },
      });
    });
  });

  describe("Owner isolation", () => {
    it("never shows user A's Events to user B", async () => {
      await createEvent({ ...valid, title: "A secret" });

      signInAs(userB);
      await createEvent({ ...valid, title: "B own" });
      const listed = await listEventsInRange(october);

      expect(listed.ok && listed.data.map((e) => e.title)).toEqual(["B own"]);
    });

    it("ignores an ownerId smuggled in the input", async () => {
      const created = await createEvent({ ...valid, ownerId: userB });
      expect(created.ok).toBe(true);

      signInAs(userB);
      const listed = await listEventsInRange(october);
      expect(listed.ok && listed.data).toEqual([]);
    });

    it("does not touch the database for an anonymous caller", async () => {
      vi.mocked(requireOwnerId).mockRejectedValue(new Error("UNAUTHORIZED"));
      await expect(createEvent(valid)).rejects.toThrow("UNAUTHORIZED");
      await expect(listEventsInRange(october)).rejects.toThrow("UNAUTHORIZED");
      await expect(updateEvent("x", valid)).rejects.toThrow("UNAUTHORIZED");
      await expect(deleteEvent("x")).rejects.toThrow("UNAUTHORIZED");
      expect(await prisma.event.count()).toBe(0);
    });
  });
});
