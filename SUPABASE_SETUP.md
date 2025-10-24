# Supabase Setup Guide

## Overview
This guide will walk you through completing the Supabase integration for centerThink.

## Prerequisites
- Supabase account (you already have one ✓)
- Project created in Supabase dashboard

## Step 1: Configure Environment Variables

1. Create a `.env` file in the project root:
```bash
cp .env.example .env
```

2. Get your Supabase credentials:
   - Go to https://app.supabase.com/
   - Select your project
   - Go to **Settings** → **API**
   - Copy the **Project URL** and **anon/public key**

3. Update `.env` with your credentials:
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 2: Run Database Migrations

Execute the SQL scripts in order in the Supabase SQL Editor:

### 2.1 Create Tables
1. Go to **SQL Editor** in Supabase dashboard
2. Create new query
3. Copy content from `supabase/01_create_tables.sql`
4. Run the query
5. Verify all 7 tables are created:
   - cities
   - speakers
   - venues
   - order_types
   - events
   - event_orders
   - user_profiles

### 2.2 Enable Row Level Security
1. Create new query
2. Copy content from `supabase/02_enable_rls.sql`
3. Run the query
4. Verify RLS is enabled on all tables (check **Authentication** → **Policies**)

### 2.3 Seed Sample Data
1. Create new query
2. Copy content from `supabase/03_seed_data.sql`
3. Run the query
4. Verify sample data exists:
   - 5 cities
   - 3 speakers
   - 5 order types

## Step 3: Create Admin User

### 3.1 Create User Account
1. Go to **Authentication** → **Users**
2. Click **Add user** → **Create new user**
3. Enter email and password
4. Copy the generated **user ID** (UUID)

### 3.2 Create User Profile
1. Go to **Table Editor** → **user_profiles**
2. Click **Insert** → **Insert row**
3. Fill in:
   - `id`: Paste the user ID from step 3.1
   - `first_name`: Your first name
   - `last_name`: Your last name
   - `role`: `admin`
   - `cities`: `["city-id-1", "city-id-2"]` (get city IDs from cities table)
   - `active`: `true`

To get city IDs:
1. Go to **Table Editor** → **cities**
2. Copy the `id` values for the cities you want to assign
3. Format as JSON array: `["uuid1", "uuid2"]`

## Step 4: Verify Setup

1. Restart the dev server:
```bash
npm run dev
```

2. Open http://localhost:3000/

3. You should see the login page

4. Login with the credentials from Step 3.1

5. Verify:
   - Login successful
   - Redirected to dashboard
   - Sidebar shows menu items
   - City selector shows assigned cities
   - User menu shows your name

## Step 5: Test CRUD Operations

### Test Cities
1. Go to **Ciudades** page
2. Verify sample cities are listed
3. Try creating a new city
4. Try editing a city
5. Try deleting a city

### Test Speakers
1. Go to **Ponentes** page
2. Verify sample speakers are listed
3. Try creating a new speaker
4. Test all status workflows

### Test Venues
1. Go to **Locales** page
2. Try creating a venue (requires city selection)
3. Test edit and delete

### Test Events
1. Go to **Eventos** page
2. Try creating an event
3. Test all relationships (city, speaker, venue)
4. Verify event details page

## Troubleshooting

### Issue: "Invalid API key"
- Double-check your `.env` file credentials
- Ensure you copied the **anon/public** key, not the service key
- Restart dev server after changing `.env`

### Issue: "Row Level Security policy violation"
- Verify user_profiles entry exists for your user
- Check that `role` is set correctly (`admin` or `user`)
- Verify `active` is `true`

### Issue: "Cannot read properties of null"
- User profile not created - complete Step 3.2
- Cities array empty or invalid - use proper JSON format

### Issue: Login fails silently
- Check browser console for errors
- Verify email/password are correct
- Check Supabase dashboard → **Authentication** → **Users** to confirm user exists

### Issue: Menu items not showing
- User has no cities assigned
- Go to user_profiles table and add cities array
- Format: `["uuid1", "uuid2"]`

## Security Notes

1. **Never commit `.env` file** - it's already in `.gitignore`
2. **anon key is safe for frontend** - it's designed for public use
3. **RLS protects your data** - policies enforce role-based access
4. **Service key is SECRET** - never use it in frontend code

## Next Steps

Once setup is complete:
1. Create more users as needed
2. Customize RLS policies for your needs
3. Add more seed data
4. Configure email templates in Supabase
5. Set up password reset flow
6. Add user invitation system

## Architecture Summary

```
Frontend (React + Vite)
├── AuthContext: Manages Supabase auth state
├── AppContext: Loads user profile and cities
├── Services: CRUD operations with Supabase client
└── Protected Routes: Guard against unauthorized access

Backend (Supabase)
├── PostgreSQL: 7 tables with relationships
├── Auth: Email/password authentication
├── RLS: Row-level security policies
└── API: Auto-generated REST and GraphQL APIs
```

## Support

If you encounter issues:
1. Check Supabase logs: **Logs** → **API**
2. Check browser console for frontend errors
3. Review RLS policies if data access fails
4. Consult Supabase docs: https://supabase.com/docs
