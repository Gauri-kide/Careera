import { Router } from "express";
import { db } from "@workspace/db";
import { announcementsTable } from "@workspace/db/schema";
import { desc } from "drizzle-orm";
import { requireAuth } from "../lib/auth.js";

const router = Router();

// GET /api/announcements (all authenticated users)
router.get("/", requireAuth, async (req, res) => {
  try {
    const all = await db.select().from(announcementsTable).orderBy(desc(announcementsTable.createdAt));
    res.json(all);
  } catch (err) {
    req.log.error({ err }, "Get announcements error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
