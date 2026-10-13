"use server";

import { requireOwnerId } from "@/features/auth";
import type { Result } from "@/shared/result";
import { createEventService, type EventDto } from "./lib/event-service";

const service = createEventService();

/** Creates an Event for the signed-in Owner. `input` is untrusted. */
export async function createEvent(input: unknown): Promise<Result<EventDto>> {
  const ownerId = await requireOwnerId();
  return service.create(ownerId, input);
}

/** The signed-in Owner's Events starting in [start, end) (ISO instants). */
export async function listEventsInRange(
  input: unknown
): Promise<Result<EventDto[]>> {
  const ownerId = await requireOwnerId();
  return service.listInRange(ownerId, input);
}
