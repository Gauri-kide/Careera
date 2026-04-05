import { Router } from "express";
import { db } from "@workspace/db";
import { notificationsTable } from "@workspace/db/schema";
import { eq, or, isNull, desc } from "drizzle-orm";
import { requireAuth } from "../lib/auth.js";

const router = Router();

// GET /api/notifications
router.get("/", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId!;
    // Get notifications for this user OR broadcast notifications (userId = null)
    const notifications = await db.select().from(notificationsTable)
      .where(or(eq(notificationsTable.userId, userId), isNull(notificationsTable.userId)))
      .orderBy(desc(notificationsTable.createdAt));
    res.json(notifications);
  } catch (err) {
    req.log.error({ err }, "Get notifications error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/notifications/:id/read
router.post("/:id/read", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.update(notificationsTable).set({ isRead: true }).where(eq(notificationsTable.id, id));
    res.json({ message: "Marked as read" });
  } catch (err) {
    req.log.error({ err }, "Mark notification read error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
