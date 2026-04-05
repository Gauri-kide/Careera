import { PGlite } from "@electric-sql/pglite";
import crypto from "crypto";
import path from "path";
import { fileURLToPath } from "url";

const dataDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "local-db-data"
);

console.log("Setting up local database at:", dataDir);

const client = new PGlite(dataDir);

// Create tables
await client.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    college_name TEXT,
    interests JSON DEFAULT '[]',
    past_experience TEXT,
    referral_code TEXT UNIQUE,
    referred_by INTEGER,
    is_approved BOOLEAN DEFAULT false,
    is_rejected BOOLEAN DEFAULT false,
    organization_name TEXT,
    location TEXT,
    organizer_role TEXT,
    last_login TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    organizer_id INTEGER NOT NULL,
    organizer_name TEXT NOT NULL,
    organization_name TEXT,
    college_name TEXT NOT NULL,
    location TEXT NOT NULL,
    fees REAL DEFAULT 0,
    registration_start_date TIMESTAMP,
    registration_deadline TIMESTAMP NOT NULL,
    event_date TIMESTAMP NOT NULL,
    tags JSON DEFAULT '[]',
    status TEXT NOT NULL DEFAULT 'upcoming',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS registrations (
    id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    registered_at TIMESTAMP NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'general',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS announcements (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    target_role TEXT NOT NULL DEFAULT 'all',
    created_by_id INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
  );
`);

console.log("Tables created successfully!");

// Hash password using same logic as the app
function hashPassword(password) {
  return crypto.createHash("sha256").update(password + "careera_salt_2024").digest("hex");
}

// Check if admin already exists
const adminCheck = await client.query("SELECT id FROM users WHERE email = 'gaurik8149@gmail.com'");
if (adminCheck.rows.length === 0) {
  const adminHash = hashPassword("Admin");
  await client.query(
    `INSERT INTO users (full_name, email, password_hash, role, is_approved, referral_code)
     VALUES ('Administrator', 'gaurik8149@gmail.com', $1, 'admin', true, 'ADMIN001')`,
    [adminHash]
  );
  console.log("Admin user seeded: gaurik8149@gmail.com / Admin");
} else {
  console.log("Admin user already exists.");
}

// Add some sample events
const eventCheck = await client.query("SELECT id FROM events LIMIT 1");
if (eventCheck.rows.length === 0) {
  await client.query(`
    INSERT INTO events (name, description, organizer_id, organizer_name, organization_name, college_name, location, fees, registration_start_date, registration_deadline, event_date, tags, status)
    VALUES
    ('Global Tech Innovation Hackathon', 'A 48-hour hackathon where teams build innovative solutions to real-world problems using cutting-edge technology.', 1, 'Administrator', 'Careera', 'MIT Pune', 'Pune, Maharashtra', 0, NOW(), NOW() + INTERVAL '30 days', NOW() + INTERVAL '45 days', '["Hackathons","Coding","AI/ML"]', 'upcoming'),
    ('AI & Machine Learning Workshop', 'Hands-on workshop covering machine learning fundamentals, neural networks, and practical applications.', 1, 'Administrator', 'Careera', 'IIT Bombay', 'Mumbai, Maharashtra', 200, NOW(), NOW() + INTERVAL '20 days', NOW() + INTERVAL '25 days', '["Workshops","AI/ML","Data Science"]', 'upcoming'),
    ('National Coding Championship', 'Competitive programming contest with algorithmic challenges. Top performers get internship opportunities.', 1, 'Administrator', 'Careera', 'YCCE Nagpur', 'Nagpur, Maharashtra', 100, NOW(), NOW() + INTERVAL '15 days', NOW() + INTERVAL '20 days', '["Competitions","Coding"]', 'upcoming'),
    ('Web Development Bootcamp', 'Intensive 2-day bootcamp covering modern web development with React, Node.js, and cloud deployment.', 1, 'Administrator', 'Careera', 'VIT Pune', 'Pune, Maharashtra', 500, NOW(), NOW() + INTERVAL '10 days', NOW() + INTERVAL '15 days', '["Workshops","Coding","Design"]', 'upcoming'),
    ('Startup Pitch Competition', 'Present your startup idea to investors and mentors. Win seed funding and incubation support.', 1, 'Administrator', 'Careera', 'COEP Pune', 'Pune, Maharashtra', 0, NOW(), NOW() + INTERVAL '25 days', NOW() + INTERVAL '35 days', '["Entrepreneurship","Networking"]', 'upcoming'),
    ('Data Science Symposium', 'A full-day symposium with talks from data science professionals and hands-on workshops.', 1, 'Administrator', 'Careera', 'NIT Nagpur', 'Nagpur, Maharashtra', 150, NOW(), NOW() + INTERVAL '18 days', NOW() + INTERVAL '22 days', '["Data Science","AI/ML","Tech Talks"]', 'upcoming')
  `);
  console.log("Sample events seeded!");
} else {
  console.log("Events already exist, skipping seed.");
}

await client.close();
console.log("\nSetup complete! You can now start the application.");
