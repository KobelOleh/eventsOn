import { prisma } from "@/shared/db";
import { Prisma } from "@/generated/prisma/client";
import type { Importance } from "./constants";
import type { Cursor } from "./cursor";
import type { EventFilterState } from "./event-filter";

export type EventRecord = {
  id: string;
  title: string;
  description: string | null;
  startsAt: Date;
  importance: Importance;
};

export type NewEvent = {
  title: string;
  description: string;
  startsAt: Date;
  importance: Importance;
};

const select = {
  id: true,
  title: true,
  description: true,
  startsAt: true,
  importance: true,
} as const;

/** Prisma's `contains` does NOT escape LIKE wildcards (verified by tests), so
 *  `\`, `%` and `_` are escaped here to match literally (Postgres' default
 *  LIKE escape character is the backslash). */
const escapeLike = (text: string) => text.replace(/[\\%_]/g, "\\$&");

/** Keyword search: every whitespace-separated word must appear (any order,
 *  case-insensitive) in the title or the description. */
function searchWhere(q: string): Prisma.EventWhereInput[] {
  return q
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => {
      const text = escapeLike(word);
      return {
        OR: [
          { title: { contains: text, mode: "insensitive" } },
          { description: { contains: text, mode: "insensitive" } },
        ],
      };
    });
}

function filterWhere(filter: EventFilterState): Prisma.EventWhereInput {
  return {
    ...(filter.importance.length > 0 && {
      importance: { in: filter.importance },
    }),
    ...(filter.q && { AND: searchWhere(filter.q) }),
  };
}

/** The only place that touches Prisma for Events. Every method takes the
 *  ownerId and scopes by it (ADR 0002). */
export const eventRepository = {
  create(ownerId: string, data: NewEvent): Promise<EventRecord> {
    return prisma.event.create({ data: { ...data, ownerId }, select });
  },

  /** Keyset page ordered by (startsAt, id): up to `take` Events strictly
   *  after `after` (or from the beginning when absent). */
  findPage(
    ownerId: string,
    after: Cursor | undefined,
    take: number,
    filter: EventFilterState
  ): Promise<EventRecord[]> {
    return prisma.event.findMany({
      where: {
        ownerId,
        ...filterWhere(filter),
        ...(after && {
          OR: [
            { startsAt: { gt: after.startsAt } },
            { startsAt: after.startsAt, id: { gt: after.id } },
          ],
        }),
      },
      orderBy: [{ startsAt: "asc" }, { id: "asc" }],
      take,
      select,
    });
  },

  /** Null when the Event does not exist or belongs to another Owner. One
   *  query, so a concurrent delete cannot slip in between write and read. */
  async update(
    ownerId: string,
    id: string,
    data: NewEvent
  ): Promise<EventRecord | null> {
    try {
      return await prisma.event.update({
        where: { id, ownerId },
        data,
        select,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025" // the update matched no record
      ) {
        return null;
      }
      throw error;
    }
  },

  /** Permanent. False when nothing of this Owner matched. */
  async delete(ownerId: string, id: string): Promise<boolean> {
    const { count } = await prisma.event.deleteMany({ where: { id, ownerId } });
    return count > 0;
  },

  /** Events whose start lies in [start, end), earliest first. */
  findStartingBetween(
    ownerId: string,
    start: Date,
    end: Date,
    filter: EventFilterState
  ): Promise<EventRecord[]> {
    return prisma.event.findMany({
      where: {
        ownerId,
        ...filterWhere(filter),
        startsAt: { gte: start, lt: end },
      },
      orderBy: [{ startsAt: "asc" }, { id: "asc" }],
      select,
    });
  },
};

export type EventRepository = typeof eventRepository;
