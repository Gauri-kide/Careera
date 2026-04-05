import { pgTable, text, serial, integer, boolean, timestamp, real, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("user"), // user | organizer | admin
  collegeName: text("college_name"),
  interests: json("interests").$type<string[]>().default([]),
  pastExperience: text("past_experience"),
  referralCode: text("referral_code").unique(),
  referredBy: integer("referred_by"),
  isApproved: boolean("is_approved").default(false),
  isRejected: boolean("is_rejected").default(false),
  // Organizer fields
  organizationName: text("organization_name"),
  location: text("location"),
  organizerRole: text("organizer_role"),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const eventsTable = pgTable("events", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  organizerId: integer("organizer_id").notNull(),
  organizerName: text("organizer_name").notNull(),
  organizationName: text("organization_name"),
  collegeName: text("college_name").notNull(),
  location: text("location").notNull(),
  fees: real("fees").default(0),
  registrationStartDate: timestamp("registration_start_date"),
  registrationDeadline: timestamp("registration_deadline").notNull(),
  eventDate: timestamp("event_date").notNull(),
  tags: json("tags").$type<string[]>().default([]),
  status: text("status").notNull().default("upcoming"), // upcoming | deadline_soon | closed | cancelled
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const registrationsTable = pgTable("registrations", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  userId: integer("user_id").notNull(),
  registeredAt: timestamp("registered_at").defaultNow().notNull(),
});

export const notificationsTable = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"), // null = broadcast to all
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull().default("general"), // reminder | cancellation | postponement | announcement | general
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const announcementsTable = pgTable("announcements", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  targetRole: text("target_role").default("all").notNull(),
  createdById: integer("created_by_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, createdAt: true });
export const insertEventSchema = createInsertSchema(eventsTable).omit({ id: true, createdAt: true });
export const insertRegistrationSchema = createInsertSchema(registrationsTable).omit({ id: true, registeredAt: true });
export const insertNotificationSchema = createInsertSchema(notificationsTable).omit({ id: true, createdAt: true });
export const insertAnnouncementSchema = createInsertSchema(announcementsTable).omit({ id: true, createdAt: true });

export type User = typeof usersTable.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Event = typeof eventsTable.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Registration = typeof registrationsTable.$inferSelect;
export type Notification = typeof notificationsTable.$inferSelect;
export type Announcement = typeof announcementsTable.$inferSelect;
