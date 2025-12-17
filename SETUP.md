# Serenity - Setup Guide

## Prerequisites
- Node.js 18+ installed
- A Supabase account and project created at https://supabase.com
- Your Supabase database tables created (see SQL scripts below)

## 1. Enable Email Authentication

**IMPORTANT:** Before anything else, enable email auth in Supabase:

1. Go to: https://app.supabase.com/project/YOUR_PROJECT_ID/auth/providers
2. Click on **"Email"**
3. Toggle **"Enable Email provider"** to ON
4. Click **"Save"**

## 2. Environment Setup

Copy `env.example` to `.env.local`:

```bash
cp env.example .env.local
```

Then fill in your Supabase credentials from https://app.supabase.com/project/YOUR_PROJECT_ID/settings/api:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...your-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...your-service-role-key
```

**Where to find each key:**
- URL and anon key are visible immediately
- Service role key is hidden - click the **eye icon** next to it to reveal

## 3. Database Setup

Run these SQL scripts in your Supabase SQL Editor (in order):

### Step 1: Create Tables
```bash
scripts/001-create-tables.sql
```

### Step 2: Enable RLS Policies
```bash
scripts/002-create-rls-policies.sql
```

### Step 3: (Optional) Seed Admin User
```bash
scripts/003-seed-admin.sql
```

**Default admin credentials:**
- Email: `admin@example.com`
- Password: `admin123`
- ⚠️ **CHANGE THIS IN PRODUCTION!**

## 4. Install Dependencies

```bash
pnpm install
```

## 5. Run Development Server

```bash
pnpm dev
```

Open http://localhost:3000

## 6. Build for Production

```bash
pnpm build
pnpm start
```

## Key Features

- **Supabase Auth**: Email/password authentication with secure session management
- **Row Level Security**: All data automatically scoped to the authenticated user
- **Real-time Ready**: Supabase Realtime subscriptions supported (optional)
- **Admin Invite System**: Admins can create invite tokens for new users
- **Edge Function Ready**: Integrate with Supabase Edge Functions for invite emails (Resend API)

## Troubleshooting

### "Email logins are disabled"
You need to enable the Email provider in Supabase:
1. Go to https://app.supabase.com/project/YOUR_PROJECT_ID/auth/providers
2. Enable "Email" provider
3. Restart your dev server

### "Missing env: NEXT_PUBLIC_SUPABASE_URL"
Make sure your `.env.local` file exists and contains all required variables.

### "Invalid API key"
Double-check you copied the **anon (public)** key, not the service role key, for `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

### Database connection errors
Verify your Supabase project is active and the URL is correct. Check your Supabase dashboard for any paused projects.

### RLS policy errors
Make sure you ran `scripts/002-create-rls-policies.sql` after creating tables.

## Architecture

- **Auth**: Supabase Auth with cookie-based sessions (SSR-compatible)
- **Database**: PostgreSQL via Supabase with Row Level Security
- **API Routes**: Next.js App Router route handlers with Supabase client
- **Frontend**: React 19 + shadcn/ui components + SWR for data fetching
- **Middleware**: Automatic session refresh and route protection

