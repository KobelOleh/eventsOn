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

  /** Null when the Event does not exist or belongs to another Owner. */
  async update(
    ownerId: string,
    id: string,
    data: NewEvent
  ): Promise<EventRecord | null> {
    const { count } = await prisma.event.updateMany({
      where: { id, ownerId },
      data,
    });
    if (count === 0) return null;
    return prisma.event.findFirst({ where: { id, ownerId }, select });
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
