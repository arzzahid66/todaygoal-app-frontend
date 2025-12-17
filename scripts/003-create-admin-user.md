# Creating Admin User (Supabase Auth Compatible)

## ⚠️ Important
The old SQL seed script **doesn't work** with Supabase Auth because:
- Supabase Auth manages users in a separate `auth.users` table
- We can't directly insert into `auth.users` via SQL
- We need to use Supabase Dashboard or API

## ✅ Method 1: Via Supabase Dashboard (Easiest)

### Step 1: Create Auth User
1. Go to: `https://app.supabase.com/project/YOUR_PROJECT_ID/auth/users`
2. Click **"Add user"** → **"Create new user"**
3. Fill in:
   - **Email:** `admin@example.com`
   - **Password:** `admin123` (or your choice)
   - **Auto Confirm User:** ✅ **ON** (important!)
4. Click **"Create user"**
5. **Copy the User ID** (UUID) shown in the users list

### Step 2: Create Profile in Users Table
Run this in Supabase SQL Editor (replace `USER_ID_FROM_STEP_1`):

```sql
-- Create admin profile linked to auth user
INSERT INTO public.users (id, email, full_name, role)
VALUES (
  'USER_ID_FROM_STEP_1',  -- ← Paste the UUID from auth.users here
  'admin@example.com',
  'Admin User',
  'admin'
)
ON CONFLICT (id) DO NOTHING;
```

**Done!** Now you can login at http://localhost:3000/login

---

## ✅ Method 2: Via Supabase API (For Scripts)

If you want to automate this, use the Supabase Management API or create a one-time admin setup endpoint.

### Example: Create Admin via API

```typescript
// This would go in a one-time setup script
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Need admin key
)

// 1. Create auth user
const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
  email: 'admin@example.com',
  password: 'admin123',
  email_confirm: true,
  user_metadata: {
    full_name: 'Admin User'
  }
})

if (authError) throw authError

// 2. Create profile
const { error: profileError } = await supabase
  .from('users')
  .insert({
    id: authUser.user.id,
    email: 'admin@example.com',
    full_name: 'Admin User',
    role: 'admin'
  })

if (profileError) throw profileError

console.log('Admin user created:', authUser.user.email)
```

---

## 🔐 Default Admin Credentials

After setup:
- **Email:** `admin@example.com`
- **Password:** `admin123` (or what you set)

⚠️ **CHANGE THIS IMMEDIATELY IN PRODUCTION!**

---

## 🐛 Troubleshooting

### "Invalid login credentials"
→ User exists in `public.users` but NOT in `auth.users`
→ Use Method 1 above to create the auth user first

### "User already exists" error
→ The auth user exists but profile is missing
→ Just run the Step 2 SQL to create the profile

### Can't see users in Supabase dashboard
→ Check you're looking at Authentication → Users (not Database → users table)

