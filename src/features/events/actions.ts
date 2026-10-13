"use server";

import { requireOwnerId } from "@/features/auth";
import type { Result } from "@/shared/result";
import type { EventDto, EventPage } from "./lib/event-dto";
import { createEventService } from "./lib/event-service";

const service = createEventService();

/** The one place an action gets its Owner: from the session, never from
 *  client input; throws UnauthorizedError for anonymous callers. */
async function withOwner<T>(run: (ownerId: string) => Promise<T>): Promise<T> {
  return run(await requireOwnerId());
}

/** Creates an Event for the signed-in Owner. `input` is untrusted. */
export async function createEvent(input: unknown): Promise<Result<EventDto>> {
  return withOwner((ownerId) => service.create(ownerId, input));
}

/** One page (20) of the Owner's Events by start time; pass the previous
 *  page's opaque `nextCursor` as `cursor` to continue. */
export async function listEvents(input: unknown): Promise<Result<EventPage>> {
  return withOwner((ownerId) => service.list(ownerId, input));
}

/** Replaces all fields of the Owner's Event; not-found if not theirs. */
export async function updateEvent(
  id: unknown,
  input: unknown
): Promise<Result<EventDto>> {
  return withOwner((ownerId) => service.update(ownerId, id, input));
}

/** Permanently deletes the Owner's Event; not-found if not theirs. */
export async function deleteEvent(
  id: unknown
): Promise<Result<{ id: string }>> {
  return withOwner((ownerId) => service.delete(ownerId, id));
}

/** The signed-in Owner's Events starting in [start, end) (ISO instants). */
export async function listEventsInRange(
  input: unknown
): Promise<Result<EventDto[]>> {
  return withOwner((ownerId) => service.listInRange(ownerId, input));
}
