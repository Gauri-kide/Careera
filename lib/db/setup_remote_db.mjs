import pg from "pg";
import crypto from "crypto";

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function setup() {
  try {
    const client = await pool.connect();
    
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
        ('Global Tech Innovation Hackathon', 'A 48-hour hackathon where teams build innovative solutions to real-world problems using cutting-edge technology. Mentorship from industry experts included.', 1, 'Administrator', 'Careera', 'MIT Pune', 'Pune, Maharashtra', 0, NOW(), NOW() + INTERVAL '30 days', NOW() + INTERVAL '45 days', '["Hackathons","Coding","AI/ML"]', 'upcoming'),
        ('AI & Machine Learning Workshop', 'Hands-on workshop covering machine learning fundamentals, neural networks, and practical applications using Python and TensorFlow.', 1, 'Administrator', 'Careera', 'IIT Bombay', 'Mumbai, Maharashtra', 200, NOW(), NOW() + INTERVAL '20 days', NOW() + INTERVAL '25 days', '["Workshops","AI/ML","Data Science"]', 'upcoming'),
        ('National Coding Championship', 'Competitive programming contest featuring algorithmic challenges. Top performers get internship opportunities at leading tech companies.', 1, 'Administrator', 'Careera', 'YCCE Nagpur', 'Nagpur, Maharashtra', 100, NOW(), NOW() + INTERVAL '15 days', NOW() + INTERVAL '20 days', '["Competitions","Coding"]', 'upcoming'),
        ('Web Development Bootcamp', 'Intensive 2-day bootcamp covering modern web development with React, Node.js, and cloud deployment. Build a complete project from scratch.', 1, 'Administrator', 'Careera', 'VIT Pune', 'Pune, Maharashtra', 500, NOW(), NOW() + INTERVAL '10 days', NOW() + INTERVAL '15 days', '["Workshops","Coding","Design"]', 'upcoming'),
        ('Startup Pitch Competition', 'Present your startup idea to a panel of investors and mentors. Win seed funding and incubation support for your venture.', 1, 'Administrator', 'Careera', 'COEP Pune', 'Pune, Maharashtra', 0, NOW(), NOW() + INTERVAL '25 days', NOW() + INTERVAL '35 days', '["Entrepreneurship","Networking"]', 'upcoming'),
        ('Data Science Symposium', 'A full-day symposium featuring talks from data science professionals, hands-on workshops, and networking opportunities.', 1, 'Administrator', 'Careera', 'NIT Nagpur', 'Nagpur, Maharashtra', 150, NOW(), NOW() + INTERVAL '18 days', NOW() + INTERVAL '22 days', '["Data Science","AI/ML","Tech Talks"]', 'upcoming')
      `);
      console.log("Sample events seeded!");
    } else {
      console.log("Events already exist, skipping seed.");
    }
    
    client.release();
    console.log("Setup complete!");
  } catch (err) {
    console.error("Setup Error:", err);
  } finally {
    await pool.end();
  }
}

setup();
