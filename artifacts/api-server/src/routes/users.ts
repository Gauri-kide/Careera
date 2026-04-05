import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, registrationsTable, eventsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "../lib/auth.js";

const router = Router();

// GET /api/users/profile
router.get("/profile", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId!;
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Count referrals
    const allUsers = await db.select().from(usersTable);
    const referralCount = allUsers.filter(u => u.referredBy === userId).length;

    res.json({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      collegeName: user.collegeName,
      interests: user.interests ?? [],
      pastExperience: user.pastExperience,
      referralCode: user.referralCode,
      referralCount,
      createdAt: user.createdAt,
    });
  } catch (err) {
    req.log.error({ err }, "Get user profile error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/users/profile
router.put("/profile", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId!;
    const { fullName, collegeName, interests, pastExperience } = req.body;

    const [updated] = await db.update(usersTable).set({
      fullName,
      collegeName,
      interests: interests ?? [],
      pastExperience,
    }).where(eq(usersTable.id, userId)).returning();

    const allUsers = await db.select().from(usersTable);
    const referralCount = allUsers.filter(u => u.referredBy === userId).length;

    res.json({
      id: updated.id,
      fullName: updated.fullName,
      email: updated.email,
      collegeName: updated.collegeName,
      interests: updated.interests ?? [],
      pastExperience: updated.pastExperience,
      referralCode: updated.referralCode,
      referralCount,
      createdAt: updated.createdAt,
    });
  } catch (err) {
    req.log.error({ err }, "Update user profile error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/users/registrations
router.get("/registrations", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId!;
    const regs = await db.select().from(registrationsTable).where(eq(registrationsTable.userId, userId));

    const result = await Promise.all(regs.map(async (reg) => {
      const [event] = await db.select().from(eventsTable).where(eq(eventsTable.id, reg.eventId));
      return {
        id: reg.id,
        eventId: reg.eventId,
        userId: reg.userId,
        event,
        registeredAt: reg.registeredAt,
      };
    }));

    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Get user registrations error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
