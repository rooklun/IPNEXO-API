-- Add role column to users and default existing rows to 'user'
ALTER TABLE users 
  ADD COLUMN role ENUM('user','admin') NOT NULL DEFAULT 'user' AFTER email;

-- Existing rows will default to 'user' automatically due to DEFAULT
-- Optional: enforce index if you plan to query by role often
-- CREATE INDEX idx_users_role ON users(role);
