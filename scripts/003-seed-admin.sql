-- Seed an admin user (password: admin123 - CHANGE THIS IN PRODUCTION)
-- Note: You'll need to hash the password properly in your auth system
INSERT INTO users (email, password_hash, full_name, role)
VALUES (
  'admin@example.com',
  '$2a$10$rO5RvZn4.ZIVz5dZXH8.XeFqF2K5WqX2Z8nBxO5HqZt6vK6ZhXQQe', -- This is a bcrypt hash of 'admin123'
  'Admin User',
  'admin'
)
ON CONFLICT (email) DO NOTHING;
