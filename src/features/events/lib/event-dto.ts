// What crosses the wire between the Server Actions and the client. Types only,
// so both the service and the UI may import it without pulling in server code.

import type { Importance } from "./constants";

/** Plain data, ISO instants in UTC. */
export type EventDto = {
  id: string;
  title: string;
  description: string;
  startsAt: string;
  importance: Importance;
};

/** One List view page; `nextCursor` is null at the end of the list. */
export type EventPage = { items: EventDto[]; nextCursor: string | null };
