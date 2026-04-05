import { Router } from "express";
import { db } from "@workspace/db";
import { eventsTable, registrationsTable, usersTable } from "@workspace/db/schema";
import { eq, and, lt, gt, desc } from "drizzle-orm";
import { requireAuth, requireRole } from "../lib/auth.js";

const router = Router();

function computeStatus(event: { registrationDeadline: Date; eventDate: Date; status: string }): string {
  const now = new Date();
  if (event.status === "cancelled") return "cancelled";
  if (now > event.eventDate) return "closed";
  const daysUntilDeadline = (event.registrationDeadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  if (now > event.registrationDeadline) return "closed";
  if (daysUntilDeadline <= 3) return "deadline_soon";
  return "upcoming";
}

async function formatEvent(event: any, userId?: number) {
  let isRegistered = false;
  let registrationCount = 0;

  if (userId) {
    const [reg] = await db.select().from(registrationsTable)
      .where(and(eq(registrationsTable.eventId, event.id), eq(registrationsTable.userId, userId)));
    isRegistered = !!reg;
  }

  const regs = await db.select().from(registrationsTable).where(eq(registrationsTable.eventId, event.id));
  registrationCount = regs.length;

  return {
    ...event,
    status: computeStatus(event),
    isRegistered,
    registrationCount,
  };
}

// GET /api/events/public (no login required)
router.get("/public", async (req, res) => {
  try {
    const allEvents = await db.select().from(eventsTable)
      .where(eq(eventsTable.status, "upcoming"))
      .orderBy(desc(eventsTable.eventDate))
      .limit(6);

    req.log.info({ count: allEvents.length }, "Fetched public events");
    const formatted = await Promise.all(allEvents.map(e => formatEvent(e)));
    res.json(formatted);
  } catch (err) {
    req.log.error({ err }, "Get public events error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/events
router.get("/", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId!;
    const filter = req.query.filter as string || "all";
    const now = new Date();

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
    const allEvents = await db.select().from(eventsTable).orderBy(desc(eventsTable.eventDate));

    let filtered = allEvents;

    if (filter === "upcoming") {
      filtered = allEvents.filter(e => e.eventDate > now && e.status !== "cancelled");
    } else if (filter === "past") {
      filtered = allEvents.filter(e => e.eventDate <= now || e.status === "closed");
    } else if (filter === "recommended") {
      const interests = user?.interests ?? [];
      if (interests.length > 0) {
        filtered = allEvents.filter(e => {
          const tags = (e.tags ?? []) as string[];
          return tags.some(tag => interests.some((i: string) => i.toLowerCase().includes(tag.toLowerCase()) || tag.toLowerCase().includes(i.toLowerCase())));
        });
        if (filtered.length === 0) filtered = allEvents.slice(0, 5);
      } else {
        filtered = allEvents.slice(0, 10);
      }
    }

    const formatted = await Promise.all(filtered.map(e => formatEvent(e, userId)));
    res.json(formatted);
  } catch (err) {
    req.log.error({ err }, "Get events error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/events/:id
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [event] = await db.select().from(eventsTable).where(eq(eventsTable.id, id));
    if (!event) {
      res.status(404).json({ error: "Event not found" });
      return;
    }
    const formatted = await formatEvent(event, req.session.userId);
    res.json(formatted);
  } catch (err) {
    req.log.error({ err }, "Get event error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/events (organizer only)
router.post("/", requireRole("organizer"), async (req, res) => {
  try {
    const userId = req.session.userId!;
    const [organizer] = await db.select().from(usersTable).where(eq(usersTable.id, userId));

    if (!organizer.isApproved) {
      res.status(403).json({ error: "Organizer not approved yet" });
      return;
    }

    const { name, description, collegeName, location, fees, registrationStartDate, registrationDeadline, eventDate, tags } = req.body;

    const [event] = await db.insert(eventsTable).values({
      name,
      description,
      organizerId: userId,
      organizerName: organizer.fullName,
      organizationName: organizer.organizationName ?? undefined,
      collegeName,
      location,
      fees: fees ?? 0,
      registrationStartDate: registrationStartDate ? new Date(registrationStartDate) : undefined,
      registrationDeadline: new Date(registrationDeadline),
      eventDate: new Date(eventDate),
      tags: tags ?? [],
      status: "upcoming",
    }).returning();

    const formatted = await formatEvent(event, userId);
    res.status(201).json(formatted);
  } catch (err) {
    req.log.error({ err }, "Create event error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/events/:id
router.put("/:id", requireRole("organizer"), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.session.userId!;
    const [existing] = await db.select().from(eventsTable).where(eq(eventsTable.id, id));

    if (!existing) {
      res.status(404).json({ error: "Event not found" });
      return;
    }
    if (existing.organizerId !== userId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const { name, description, collegeName, location, fees, registrationStartDate, registrationDeadline, eventDate, tags } = req.body;
    const [updated] = await db.update(eventsTable).set({
      name,
      description,
      collegeName,
      location,
      fees: fees ?? 0,
      registrationStartDate: registrationStartDate ? new Date(registrationStartDate) : undefined,
      registrationDeadline: new Date(registrationDeadline),
      eventDate: new Date(eventDate),
      tags: tags ?? [],
    }).where(eq(eventsTable.id, id)).returning();

    const formatted = await formatEvent(updated, userId);
    res.json(formatted);
  } catch (err) {
    req.log.error({ err }, "Update event error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/events/:id
router.delete("/:id", requireRole("organizer"), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.session.userId!;
    const [existing] = await db.select().from(eventsTable).where(eq(eventsTable.id, id));

    if (!existing) {
      res.status(404).json({ error: "Event not found" });
      return;
    }
    if (existing.organizerId !== userId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    await db.delete(registrationsTable).where(eq(registrationsTable.eventId, id));
    await db.delete(eventsTable).where(eq(eventsTable.id, id));
    res.json({ message: "Event deleted" });
  } catch (err) {
    req.log.error({ err }, "Delete event error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/events/:id/registrations (organizer view)
router.get("/:id/registrations", requireRole("organizer"), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.session.userId!;
    const [event] = await db.select().from(eventsTable).where(eq(eventsTable.id, id));
    if (!event) { res.status(404).json({ error: "Event not found" }); return; }
    if (event.organizerId !== userId) { res.status(403).json({ error: "Forbidden" }); return; }

    const regs = await db.select().from(registrationsTable).where(eq(registrationsTable.eventId, id));
    const result = await Promise.all(regs.map(async (reg) => {
      const [user] = await db.select().from(usersTable).where(eq(usersTable.id, reg.userId));
      return {
        id: reg.id,
        userId: reg.userId,
        fullName: user?.fullName ?? "Unknown",
        email: user?.email ?? "",
        collegeName: user?.collegeName ?? "",
        registeredAt: reg.registeredAt,
      };
    }));
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Get event registrations error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/events/:id/register
router.post("/:id/register", requireRole("user"), async (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    const userId = req.session.userId!;

    const [event] = await db.select().from(eventsTable).where(eq(eventsTable.id, eventId));
    if (!event) {
      res.status(404).json({ error: "Event not found" });
      return;
    }

    const status = computeStatus(event);
    if (status === "closed" || status === "cancelled") {
      res.status(400).json({ error: "Registration is closed for this event" });
      return;
    }

    const [existing] = await db.select().from(registrationsTable)
      .where(and(eq(registrationsTable.eventId, eventId), eq(registrationsTable.userId, userId)));
    if (existing) {
      res.status(400).json({ error: "Already registered for this event" });
      return;
    }

    const [reg] = await db.insert(registrationsTable).values({ eventId, userId }).returning();
    res.status(201).json({
      id: reg.id,
      eventId: reg.eventId,
      userId: reg.userId,
      registeredAt: reg.registeredAt,
    });
  } catch (err) {
    req.log.error({ err }, "Register for event error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
