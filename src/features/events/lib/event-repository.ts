import { prisma } from "@/shared/db";
import type { Importance } from "./schemas";

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
    after: { startsAt: Date; id: string } | undefined,
    take: number
  ): Promise<EventRecord[]> {
    return prisma.event.findMany({
      where: {
        ownerId,
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

  /** Events whose start lies in [start, end), earliest first. */
  findStartingBetween(
    ownerId: string,
    start: Date,
    end: Date
  ): Promise<EventRecord[]> {
    return prisma.event.findMany({
      where: { ownerId, startsAt: { gte: start, lt: end } },
      orderBy: [{ startsAt: "asc" }, { id: "asc" }],
      select,
    });
  },
};

export type EventRepository = typeof eventRepository;
