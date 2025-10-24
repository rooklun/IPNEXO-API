-- Add uid column to users table, populate, and enforce uniqueness
-- 1) Add column as NULLable to allow backfill
ALTER TABLE users ADD COLUMN uid VARCHAR(32) NULL AFTER id;

-- 2) Backfill existing rows with UUID without hyphens
UPDATE users SET uid = REPLACE(UUID(), '-', '') WHERE uid IS NULL;

-- 3) Make column NOT NULL and add UNIQUE index
ALTER TABLE users 
  MODIFY COLUMN uid VARCHAR(32) NOT NULL,
  ADD UNIQUE KEY uk_users_uid (uid);
