import { fail, fieldErrorsOf, ok, type Result } from "@/shared/result";
import {
  eventRepository,
  type EventRecord,
  type EventRepository,
} from "./event-repository";
import { eventFieldsSchema, rangeSchema, type Importance } from "./schemas";

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
