import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, generateReferralCode } from "../lib/auth.js";

const router = Router();

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "Email and password required" });
      return;
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase()));
    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const hash = hashPassword(password);
    if (user.passwordHash !== hash) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    // Update last login
    await db.update(usersTable).set({ lastLogin: new Date() }).where(eq(usersTable.id, user.id));

    req.session.userId = user.id;
    req.session.userRole = user.role;
    req.session.userEmail = user.email;

    res.json({
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        collegeName: user.collegeName,
        interests: user.interests ?? [],
        isApproved: user.isApproved,
        referralCode: user.referralCode,
      },
      message: "Login successful",
    });
  } catch (err) {
    req.log.error({ err }, "Login error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/signup", async (req, res) => {
  try {
    const { fullName, email, password, collegeName, interests, pastExperience, referralCode } = req.body;
    if (!fullName || !email || !password || !collegeName) {
      res.status(400).json({ error: "Required fields missing" });
      return;
    }

    const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase()));
    if (existing) {
      res.status(400).json({ error: "Email already registered" });
      return;
    }

    let referredById: number | undefined;
    if (referralCode) {
      const [referrer] = await db.select().from(usersTable).where(eq(usersTable.referralCode, referralCode.toUpperCase()));
      if (referrer) referredById = referrer.id;
    }

    const myReferralCode = generateReferralCode();
    const [user] = await db.insert(usersTable).values({
      fullName,
      email: email.toLowerCase(),
      passwordHash: hashPassword(password),
      role: "user",
      collegeName,
      interests: interests ?? [],
      pastExperience,
      referralCode: myReferralCode,
      referredBy: referredById,
      isApproved: true, // Students auto-approved
    }).returning();

    req.session.userId = user.id;
    req.session.userRole = user.role;
    req.session.userEmail = user.email;

    res.status(201).json({
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        collegeName: user.collegeName,
        interests: user.interests ?? [],
        isApproved: user.isApproved,
        referralCode: user.referralCode,
      },
      message: "Account created successfully",
    });
  } catch (err) {
    req.log.error({ err }, "Signup error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/organizer-signup", async (req, res) => {
  try {
    const { name, email, password, organizationName, collegeName, location, role } = req.body;
    if (!name || !email || !password || !organizationName || !collegeName || !location) {
      res.status(400).json({ error: "Required fields missing" });
      return;
    }

    const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase()));
    if (existing) {
      res.status(400).json({ error: "Email already registered" });
      return;
    }

    const myReferralCode = generateReferralCode();
    await db.insert(usersTable).values({
      fullName: name,
      email: email.toLowerCase(),
      passwordHash: hashPassword(password),
      role: "organizer",
      collegeName,
      organizationName,
      location,
      organizerRole: role ?? "Member",
      referralCode: myReferralCode,
      isApproved: false, // Organizers need admin approval
    });

    res.status(201).json({ message: "Organizer registration submitted. Awaiting admin approval." });
  } catch (err) {
    req.log.error({ err }, "Organizer signup error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ message: "Logged out successfully" });
  });
});

router.get("/me", async (req, res) => {
  if (!req.session?.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId));
    if (!user) {
      res.status(401).json({ error: "User not found" });
      return;
    }
    res.json({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      collegeName: user.collegeName,
      interests: user.interests ?? [],
      isApproved: user.isApproved,
      referralCode: user.referralCode,
    });
  } catch (err) {
    req.log.error({ err }, "Get me error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
