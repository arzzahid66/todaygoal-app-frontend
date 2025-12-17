-- ⚠️ DEPRECATED - This doesn't work with Supabase Auth
-- Use the Supabase Dashboard to create users instead
-- See: https://app.supabase.com/project/YOUR_PROJECT/auth/users

-- Old seed script (kept for reference)
INSERT INTO users (email, password_hash, full_name, role)
VALUES (
  'admin@example.com',
  '$2a$10$rO5RvZn4.ZIVz5dZXH8.XeFqF2K5WqX2Z8nBxO5HqZt6vK6ZhXQQe',
  'Admin User',
  'admin'
)
ON CONFLICT (email) DO NOTHING;

