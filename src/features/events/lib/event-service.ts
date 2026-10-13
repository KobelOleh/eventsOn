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

export function createEventService(repo: EventRepository = eventRepository) {
  return {
    async create(ownerId: string, input: unknown): Promise<Result<EventDto>> {
      const parsed = eventFieldsSchema.safeParse(input);
      if (!parsed.success) {
        return fail("VALIDATION", fieldErrorsOf(parsed.error.issues));
      }
      return ok(toDto(await repo.create(ownerId, parsed.data)));
    },

    /** List-view query: one page by keyset cursor, earliest first. */
    async list(ownerId: string, input: unknown): Promise<Result<EventPage>> {
      const parsed = listQuerySchema.safeParse(input);
      if (!parsed.success) {
        return fail("VALIDATION", fieldErrorsOf(parsed.error.issues));
      }
      // One extra row tells us whether another page exists.
      const records = await repo.findPage(
        ownerId,
        parsed.data.cursor,
        PAGE_SIZE + 1
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

    /** Calendar-view query: bounded range, no paging. (The List view's
     *  cursor query is a separate method.) */
    async listInRange(
      ownerId: string,
      input: unknown
    ): Promise<Result<EventDto[]>> {
      const parsed = rangeSchema.safeParse(input);
      if (!parsed.success) {
        return fail("VALIDATION", fieldErrorsOf(parsed.error.issues));
      }
      const { start, end } = parsed.data;
      const records = await repo.findStartingBetween(ownerId, start, end);
      return ok(records.map(toDto));
    },
  };
}
