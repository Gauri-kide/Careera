import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, eventsTable, registrationsTable, notificationsTable, announcementsTable } from "@workspace/db/schema";
import { eq, desc } from "drizzle-orm";
import { requireRole } from "../lib/auth.js";

const router = Router();

// GET /api/admin/users
router.get("/users", requireRole("admin"), async (req, res) => {
  try {
    const users = await db.select().from(usersTable)
      .where(eq(usersTable.role, "user"))
      .orderBy(desc(usersTable.createdAt));
    res.json(users.map(u => ({
      id: u.id,
      fullName: u.fullName,
      email: u.email,
      collegeName: u.collegeName,
      interests: u.interests ?? [],
      createdAt: u.createdAt,
      lastLogin: u.lastLogin,
    })));
  } catch (err) {
    req.log.error({ err }, "Admin get users error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/admin/organizers
router.get("/organizers", requireRole("admin"), async (req, res) => {
  try {
    const organizers = await db.select().from(usersTable)
      .where(eq(usersTable.role, "organizer"))
      .orderBy(desc(usersTable.createdAt));
    res.json(organizers.map(o => ({
      id: o.id,
      name: o.fullName,
      email: o.email,
      organizationName: o.organizationName,
      collegeName: o.collegeName,
      location: o.location,
      role: o.organizerRole,
      isApproved: o.isApproved,
      isRejected: o.isRejected,
      createdAt: o.createdAt,
    })));
  } catch (err) {
    req.log.error({ err }, "Admin get organizers error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/admin/organizers/:id/approve
router.post("/organizers/:id/approve", requireRole("admin"), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.update(usersTable).set({ isApproved: true, isRejected: false }).where(eq(usersTable.id, id));

    // Notify organizer
    await db.insert(notificationsTable).values({
      userId: id,
      title: "Account Approved",
      message: "Congratulations! Your organizer account has been approved. You can now create and manage events.",
      type: "announcement",
    });

    res.json({ message: "Organizer approved" });
  } catch (err) {
    req.log.error({ err }, "Approve organizer error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/admin/organizers/:id/reject
router.post("/organizers/:id/reject", requireRole("admin"), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.update(usersTable).set({ isRejected: true, isApproved: false }).where(eq(usersTable.id, id));

    await db.insert(notificationsTable).values({
      userId: id,
      title: "Account Rejected",
      message: "Your organizer account application has been rejected. Please contact support for more details.",
      type: "announcement",
    });

    res.json({ message: "Organizer rejected" });
  } catch (err) {
    req.log.error({ err }, "Reject organizer error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/admin/events
router.get("/events", requireRole("admin"), async (req, res) => {
  try {
    const events = await db.select().from(eventsTable).orderBy(desc(eventsTable.createdAt));
    const formatted = await Promise.all(events.map(async (e) => {
      const regs = await db.select().from(registrationsTable).where(eq(registrationsTable.eventId, e.id));
      return { ...e, registrationCount: regs.length };
    }));
    res.json(formatted);
  } catch (err) {
    req.log.error({ err }, "Admin get events error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/admin/announcements
router.get("/announcements", requireRole("admin"), async (req, res) => {
  try {
    const all = await db.select().from(announcementsTable).orderBy(desc(announcementsTable.createdAt));
    res.json(all);
  } catch (err) {
    req.log.error({ err }, "Admin get announcements error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/admin/announcements/:id
router.delete("/announcements/:id", requireRole("admin"), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(announcementsTable).where(eq(announcementsTable.id, id));
    res.json({ message: "Announcement deleted" });
  } catch (err) {
    req.log.error({ err }, "Admin delete announcement error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/admin/announcements
router.post("/announcements", requireRole("admin"), async (req, res) => {
  try {
    const userId = req.session.userId!;
    const { title, message, targetRole } = req.body;

    if (!title || !message) {
      res.status(400).json({ error: "Title and message required" });
      return;
    }

    const [announcement] = await db.insert(announcementsTable).values({
      title,
      message,
      targetRole: targetRole || "all",
      createdById: userId,
    }).returning();

    // Broadcast notification to all users
    await db.insert(notificationsTable).values({
      userId: null as any,
      title,
      message,
      type: "announcement",
    });

    res.status(201).json(announcement);
  } catch (err) {
    req.log.error({ err }, "Admin create announcement error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/admin/stats
router.get("/stats", requireRole("admin"), async (req, res) => {
  try {
    const users = await db.select().from(usersTable).where(eq(usersTable.role, "user"));
    const organizers = await db.select().from(usersTable).where(eq(usersTable.role, "organizer"));
    const events = await db.select().from(eventsTable);
    const registrations = await db.select().from(registrationsTable);
    const now = new Date();

    res.json({
      totalUsers: users.length,
      totalOrganizers: organizers.length,
      pendingOrganizers: organizers.filter(o => !o.isApproved && !o.isRejected).length,
      totalEvents: events.length,
      activeEvents: events.filter(e => e.eventDate > now && e.status !== "cancelled").length,
      totalRegistrations: registrations.length,
    });
  } catch (err) {
    req.log.error({ err }, "Admin get stats error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
