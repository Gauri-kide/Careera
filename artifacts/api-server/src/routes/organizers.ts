import { Router } from "express";
import { db } from "@workspace/db";
import { eventsTable, notificationsTable, announcementsTable, usersTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";
import { requireRole } from "../lib/auth.js";

const router = Router();

// GET /api/organizers/events
router.get("/events", requireRole("organizer"), async (req, res) => {
  try {
    const userId = req.session.userId!;
    const events = await db.select().from(eventsTable).where(eq(eventsTable.organizerId, userId));
    res.json(events);
  } catch (err) {
    req.log.error({ err }, "Get organizer events error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/organizers/announcements
router.post("/announcements", requireRole("organizer"), async (req, res) => {
  try {
    const userId = req.session.userId!;
    const { title, message } = req.body;

    if (!title || !message) {
      res.status(400).json({ error: "Title and message required" });
      return;
    }

    const [announcement] = await db.insert(announcementsTable).values({
      title,
      message,
      createdById: userId,
    }).returning();

    // Broadcast to all users as notification (userId = null means all)
    await db.insert(notificationsTable).values({
      userId: null as any,
      title,
      message,
      type: "announcement",
    });

    res.status(201).json(announcement);
  } catch (err) {
    req.log.error({ err }, "Create announcement error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/organizers/announcements/:id
router.put("/announcements/:id", requireRole("organizer"), async (req, res) => {
  try {
    const userId = req.session.userId!;
    const id = parseInt(req.params.id);
    const { title, message } = req.body;

    if (!title || !message) {
      res.status(400).json({ error: "Title and message required" });
      return;
    }

    const [updated] = await db
      .update(announcementsTable)
      .set({ title, message })
      .where(and(eq(announcementsTable.id, id), eq(announcementsTable.createdById, userId)))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Announcement not found or unauthorized" });
      return;
    }

    res.json(updated);
  } catch (err) {
    req.log.error({ err }, "Update announcement error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/organizers/announcements/:id
router.delete("/announcements/:id", requireRole("organizer"), async (req, res) => {
  try {
    const userId = req.session.userId!;
    const id = parseInt(req.params.id);

    const [deleted] = await db
      .delete(announcementsTable)
      .where(and(eq(announcementsTable.id, id), eq(announcementsTable.createdById, userId)))
      .returning();

    if (!deleted) {
      res.status(404).json({ error: "Announcement not found or unauthorized" });
      return;
    }

    res.json({ message: "Announcement deleted" });
  } catch (err) {
    req.log.error({ err }, "Delete announcement error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

