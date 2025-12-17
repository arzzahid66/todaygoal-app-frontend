# 🚀 Quick Start - Your App is Ready!

## ✅ What's Done

Your productivity app is **fully integrated with Supabase** and production-ready:

- ✅ Supabase Auth (email/password with secure cookies)
- ✅ All API routes use Supabase client
- ✅ Row Level Security (RLS) enforces per-user data access
- ✅ Middleware automatically refreshes sessions
- ✅ Production build passes
- ✅ No Neon/old database references remain

---

## 🔧 Setup in 4 Steps

### 1. Enable Email Authentication in Supabase

Go to: https://app.supabase.com/project/YOUR_PROJECT/auth/providers

- Click on **"Email"**
- Toggle **"Enable Email provider"** to ON
- Click **"Save"**

### 2. Copy your `.env` file with Supabase credentials

Your `.env` file should look like this:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
```

Get these from: https://app.supabase.com/project/YOUR_PROJECT/settings/api

**Where to find each key:**
- `NEXT_PUBLIC_SUPABASE_URL` → Project URL at the top
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` → The **anon public** key
- `SUPABASE_SERVICE_ROLE_KEY` → The **service_role secret** key (click eye icon to reveal)

### 3. Run the SQL scripts in your Supabase SQL Editor

Run these **in order** at https://app.supabase.com/project/YOUR_PROJECT/sql/new:

1. **`scripts/001-create-tables.sql`** - Creates all tables
2. **`scripts/002-create-rls-policies.sql`** - Enables security policies

### 3a. Create Admin User (via Supabase Dashboard)

⚠️ **Important:** Don't use the old SQL seed script - it doesn't work with Supabase Auth!

Instead:
1. Go to: `https://app.supabase.com/project/YOUR_PROJECT/auth/users`
2. Click **"Add user"** → **"Create new user"**
3. Email: `admin@example.com`, Password: `admin123`, **Auto Confirm: ON** ✅
4. Copy the User ID (UUID)
5. Run this SQL (replace `USER_ID`):
   ```sql
   INSERT INTO public.users (id, email, full_name, role)
   VALUES ('USER_ID', 'admin@example.com', 'Admin User', 'admin');
   ```

See `scripts/003-create-admin-user.md` for detailed instructions.

### 4. Start the app

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000

---

## 🔐 Default Admin Login

After creating the admin user (Step 3a):
- Email: `admin@example.com`
- Password: `admin123` (or what you set)
- ⚠️ **Change this immediately in production!**

---

## 🎯 What Works Right Now

✅ **Authentication**: Login, signup, logout via Supabase Auth
✅ **Tasks**: Create, edit, delete, mark as done (per user)
✅ **Habits**: Track daily habits with streak counting
✅ **Journal**: Write and manage journal entries
✅ **Life Goals**: Set goals with milestones
✅ **Focus Timer**: Pomodoro timer with session history
✅ **Security**: All data automatically filtered by logged-in user (RLS)

---

## 📊 Database Tables in Supabase

Your app uses these tables (all with RLS enabled):

- `users` - User profiles and roles
- `invites` - Admin invite system
- `tasks` - Daily tasks
- `habits` - Habit definitions
- `habit_logs` - Habit completion tracking
- `journal_entries` - Journal entries
- `focus_sessions` - Focus timer history
- `life_goals` - Long-term goals
- `goal_milestones` - Goal progress tracking

---

## 🐛 Troubleshooting

### "Email logins are disabled"
→ Go to Supabase Dashboard → Authentication → Providers → Enable "Email" provider

### "Missing env: NEXT_PUBLIC_SUPABASE_URL"
→ Your `.env` file is missing or not in the project root

### "Invalid API key"
→ Double-check you copied the **anon key**, not the service role key for `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Where to find service role key?
→ Supabase Dashboard → Settings → API → Look for **service_role** key (click eye icon to reveal)

### "Invalid login credentials" error
→ User exists in `public.users` table but NOT in Supabase Auth
→ You need to create the user in Supabase Auth Dashboard first (see Step 3a above)
→ Or the password is wrong - you can reset it in Auth → Users → click user → Reset Password

### Can't log in after running SQL scripts
→ Make sure you ran `002-create-rls-policies.sql` to enable Row Level Security

### Build errors about middleware/proxy
→ Already fixed! Only `middleware.ts` exists now (old `proxy.ts` removed)

---

## 🚀 Deploy to Production

This app is ready to deploy to:
- **Vercel** (recommended for Next.js)
- **Netlify**
- **Railway**
- **Any Node.js hosting**

Just set your environment variables in the hosting platform's dashboard!

---

**Your app is production-ready! 🎉**

