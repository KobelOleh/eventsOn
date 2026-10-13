"use server";

import { requireOwnerId } from "@/features/auth";
import type { Result } from "@/shared/result";
import {
  createEventService,
  type EventDto,
  type EventPage,
} from "./lib/event-service";

const service = createEventService();

/** Creates an Event for the signed-in Owner. `input` is untrusted. */
export async function createEvent(input: unknown): Promise<Result<EventDto>> {
  const ownerId = await requireOwnerId();
  return service.create(ownerId, input);
}

/** One page (20) of the Owner's Events by start time; pass the previous
 *  page's opaque `nextCursor` as `cursor` to continue. */
export async function listEvents(input: unknown): Promise<Result<EventPage>> {
  const ownerId = await requireOwnerId();
  return service.list(ownerId, input);
}

/** The signed-in Owner's Events starting in [start, end) (ISO instants). */
export async function listEventsInRange(
  input: unknown
): Promise<Result<EventDto[]>> {
  const ownerId = await requireOwnerId();
  return service.listInRange(ownerId, input);
}
