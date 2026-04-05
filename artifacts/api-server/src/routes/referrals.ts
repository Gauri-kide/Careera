import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "../lib/auth.js";

const router = Router();

// GET /api/referrals
router.get("/", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId!;
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const allUsers = await db.select().from(usersTable);
    const referredUsers = allUsers.filter(u => u.referredBy === userId);

    res.json({
      referralCode: user.referralCode ?? "",
      referralCount: referredUsers.length,
      referrals: referredUsers.map(u => ({
        id: u.id,
        fullName: u.fullName,
        joinedAt: u.createdAt,
      })),
    });
  } catch (err) {
    req.log.error({ err }, "Get referrals error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
