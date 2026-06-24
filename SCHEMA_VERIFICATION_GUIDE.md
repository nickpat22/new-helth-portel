# UDHRS Health Portal - Schema Verification & Fix Guide

## Current Status Analysis

Based on code review, your application is configured to use the **UDHRS Health Portal** schema with these tables:
- `patients`
- `appointments`
- `lab_reports`
- `prescriptions`
- `prescription_medications`
- `medical_records`
- `activity_log`
- `registered_users`

The authentication system uses the `registered_users` table with email/password_hash verification.

## Files That Need Attention

### ✅ Correct Files (Match Application Expectations):
- `supabase_schema.sql` - Contains correct UDHRS schema
- `sql_to_run.txt` - Identical to supabase_schema.sql
- `src/data.ts` - Mock data matches UDHRS schema
- `src/auth/AuthContext.tsx` - Queries `registered_users` table
- `.env` - Contains valid Supabase credentials for project `cfyfeewbitawephfqzpg`

### ⚠️ Conflicting/Leftover Files (Not Used by Application):
- `fix_schema.sql` - Contains "DocuMed Health Portal" schema (different system)
- `check_db.js` - Tests the DocuMed system (not referenced anywhere)

**These files are NOT used by your application and can be safely removed or ignored.**

## Verification Steps

### 1. Check Your Supabase Database Schema
You need to verify that your Supabase project (`cfyfeewbitawephfqzpg`) has the UDHRS schema installed.

**Option A: Using Supabase Dashboard**
1. Go to https://app.supabase.com/project/cfyfeewbitawephfqzpg
2. Navigate to **Table Editor**
3. Check for these tables: patients, appointments, lab_reports, prescriptions, prescription_medications, medical_records, activity_log, registered_users
4. Verify table structures match the definitions in `supabase_schema.sql`

**Option B: Using SQL Editor**
1. In Supabase dashboard, go to **SQL Editor**
2. Run this query to list all tables:
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   ORDER BY table_name;
   ```
3. Compare output with expected tables listed above

### 2. If Schema is Missing or Incorrect
If your database doesn't have the correct schema:

**Run the UDHRS Schema:**
1. Copy contents of `supabase_schema.sql` or `sql_to_run.txt`
2. Go to Supabase SQL Editor for project `cfyfeewbitawephfqzpg`
3. Paste and run the SQL
4. This will create all necessary tables with correct structure and seed data

### 3. Clean Up Conflicting Files (Optional but Recommended)
To prevent future confusion, you can remove or archive these files:
- `fix_schema.sql` 
- `check_db.js`

Since they are not referenced anywhere in the codebase, removing them won't affect your application.

## Vercel Deployment Checklist

Your `.vercel` and `vercel.json` files indicate Vercel is configured correctly:

**To Deploy:**
1. Push code to GitHub repository
2. Connect repository to Vercel
3. Ensure environment variables are set in Vercel:
   - `VITE_SUPABASE_URL=https://cfyfeewbitawephfqzpg.supabase.co`
   - `VITE_SUPABASE_ANON_KEY=sb_publishable_Ok4Q7_UEW5d9vj04wSUF_A_C5yzR90w`
4. Build command: `npm run build`
5. Output directory: `dist`

## Testing After Deployment

After deploying to Vercel:
1. Visit your deployed URL
2. Test login with demo accounts (check `src/auth/types.ts` for DEMO_ACCOUNTS)
3. Verify data loads correctly (patients, appointments, etc.)
4. Test navigation between different modules (Dashboard, Patients, Appointments, etc.)

## Expected Demo Accounts
Check `src/auth/types.ts` for the DEMO_ACCOUNTS object which contains test login credentials for different roles.

---

**Summary:** Your application code is consistent and expects the UDHRS Health Portal schema. The conflicting files (`fix_schema.sql`, `check_db.js`) are leftovers and not used. Simply ensure your Supabase database has the UDHRS schema installed (from `supabase_schema.sql`), then deploy to Vercel using the provided credentials.