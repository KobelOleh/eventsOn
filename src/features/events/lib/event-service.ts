import { z, type ZodType } from "zod";
import { fail, fieldErrorsOf, ok, type Result } from "@/shared/result";
import {
  eventRepository,
  type EventRecord,
  type EventRepository,
} from "./event-repository";
import {
  encodeCursor,
  eventFieldsSchema,
  listQuerySchema,
  PAGE_SIZE,
  rangeSchema,
  type Importance,
} from "./schemas";

/** One List view page; `nextCursor` is null at the end of the list. */
export type EventPage = { items: EventDto[]; nextCursor: string | null };

/** What crosses the wire to the client: plain data, ISO instants in UTC. */
export type EventDto = {
  id: string;
  title: string;
  description: string;
  startsAt: string;
  importance: Importance;
};

export function toDto(record: EventRecord): EventDto {
  return {
    id: record.id,
    title: record.title,
    description: record.description ?? "",
    startsAt: record.startsAt.toISOString(),
    importance: record.importance,
  };
}

/** safeParse, or a VALIDATION failure carrying per-field errors. */
function parseOrFail<S extends ZodType>(
  schema: S,
  input: unknown
): Result<z.output<S>> {
  const parsed = schema.safeParse(input);
  return parsed.success
    ? ok(parsed.data)
    : fail("VALIDATION", fieldErrorsOf(parsed.error.issues));
}

export function createEventService(repo: EventRepository = eventRepository) {
  return {
    async create(ownerId: string, input: unknown): Promise<Result<EventDto>> {
      const parsed = parseOrFail(eventFieldsSchema, input);
      if (!parsed.ok) return parsed;
      return ok(toDto(await repo.create(ownerId, parsed.data)));
    },

    /** List-view query: one page by keyset cursor, earliest first. */
    async list(ownerId: string, input: unknown): Promise<Result<EventPage>> {
      const parsed = parseOrFail(listQuerySchema, input);
      if (!parsed.ok) return parsed;
      // One extra row tells us whether another page exists.
      const records = await repo.findPage(
        ownerId,
        parsed.data.cursor,
        PAGE_SIZE + 1,
        { importance: parsed.data.importance, q: parsed.data.q }
      );
      const page = records.slice(0, PAGE_SIZE);
      const last = page[page.length - 1];
      return ok({
        items: page.map(toDto),
        nextCursor:
          records.length > PAGE_SIZE && last
            ? encodeCursor({ startsAt: last.startsAt, id: last.id })
            : null,
      });
    },

    async update(
      ownerId: string,
      id: unknown,
      input: unknown
    ): Promise<Result<EventDto>> {
      const parsed = parseOrFail(eventFieldsSchema, input);
      if (!parsed.ok) return parsed;
      if (typeof id !== "string") return fail("NOT_FOUND");
      const record = await repo.update(ownerId, id, parsed.data);
      return record ? ok(toDto(record)) : fail("NOT_FOUND");
    },

    async delete(
      ownerId: string,
      id: unknown
    ): Promise<Result<{ id: string }>> {
      if (typeof id !== "string") return fail("NOT_FOUND");
      return (await repo.delete(ownerId, id)) ? ok({ id }) : fail("NOT_FOUND");
    },

    /** Calendar-view query: bounded range, no paging. (The List view's
     *  cursor query is a separate method.) */
    async listInRange(
      ownerId: string,
      input: unknown
    ): Promise<Result<EventDto[]>> {
      const parsed = parseOrFail(rangeSchema, input);
      if (!parsed.ok) return parsed;
      const { start, end, filter } = parsed.data;
      const records = await repo.findStartingBetween(
        ownerId,
        start,
        end,
        filter
      );
      return ok(records.map(toDto));
    },
  };
}
