# Database Schema Fix Instructions

## 🔍 Problem Analysis

After thorough code analysis, I found that your application has **conflicting database expectations** between different parts of the codebase:

### ✅ What the CODE EXPECTS TO QUERY:
Based on grep'ing for `.from()` calls in your source code, the application expects these tables:
- `users` (auth flow profiles)
- `registered_users` (email/password auth)
- `patients` (medical patient info)
- `appointments`
- `lab_reports` (with conflicting expectations)
- `prescriptions` (with conflicting expectations)
- `medical_records`
- `activity_log`
- `diagnoses`
- `medical_docs`
- `prescription_medications`

### ⚠️ The Core Conflict:
Two different systems expect different structures for `lab_reports` and `prescriptions`:

| Table | Service Layer Expects | Auth Flow/Dashboards Expect |
|-------|----------------------|----------------------------|
| **lab_reports** | `patient_id`, `patient_name`, `test_type`, `test_date`, `results`, `status` | `patient_id`, `lab_id`, `test_name`, `test_date`, `summary`, `status` |
| **prescriptions** | `patient_id`, `patient_name`, `prescribed_date`, `expiry_date`, `status` | `patient_id`, `doctor_id`, `diagnosis`, `drugs` |

Additionally, there are disagreements about:
- Whether `patient_id` references `users` table (auth flow) or `patients` table (service layer)
- ID generation systems (sequential vs random)

## 🛠️ Solution: Unified Schema Fix

I've created a comprehensive SQL script (`UNIFIED_SCHEMA_FIX.sql`) that:

1. **Creates all required tables** with structures that satisfy BOTH expectation sets where possible
2. **Uses a unified approach** for conflicting tables by including ALL expected columns
3. **Implements proper RLS policies** for role-based access control
4. **Preserves existing functionality** while making the database match code expectations
5. **Includes the authentication trigger system** (`get_next_id` function) required for login

### Key Design Decisions:
- **Separate `users` and `patients` tables**: `users` for login profiles, `patients` for medical info
- **Unified lab_reports/prescriptions tables**: Contain columns from BOTH expectation sets
- **Patient ID references**: `patient_id` in medical tables references `patients.id` (logical separation)
- **Role-based security**: RLS policies ensure users only see appropriate data
- **ID generation**: Uses the sequential `get_next_id` function expected by auth flow

## 📋 How to Apply the Fix

### Step 1: Backup Current Data (Recommended)
If you have existing data in your Supabase database that you want to preserve:
1. Go to Supabase Dashboard → Table Editor
2. Export each table as CSV (via the ⋮ menu on each table)

### Step 2: Apply the SQL Fix
1. Open [Supabase SQL Editor](https://app.supabase.com/project/cfyfeewbitawephfqzpg/sql)
2. Copy the entire contents of `UNIFIED_SCHEMA_FIX.sql`
3. Paste into the SQL editor and click **RUN**

### Step 3: Verify Installation
After running the SQL, you should see:
- All expected tables listed in the results
- Success messages for function creation
- No error messages

### Step 4: Test Your Application
1. Test login with demo accounts from `src/auth/types.ts`:
   - Patient: `UDHRS-PAT-10001` / `patient123`
   - Doctor: `UDHRS-DOC-20001` / `doctor123`
   - Laboratory: `UDHRS-LAB-30001` / `lab123`
   - Pharmacy: `UDHRS-PHM-40001` / `pharm123`
   - Records Staff: `UDHRS-MRC-50001` / `records123`
   - Admin: `UDHRS-ADM-90001` / `admin123`
2. Verify data loads correctly in all modules
3. Test creating/viewing appointments, lab reports, prescriptions, etc.

## 📄 Files Created
- `UNIFIED_SCHEMA_FIX.sql` - The complete schema fix script
- `SCHEMA_VERIFICATION_GUIDE.md` - Additional verification guidance

## ⚠️ Important Notes
1. **This script is designed to be IDEMPOTENT** - running it multiple times is safe
2. **Existing data may need migration** - if you have data in the old schema, you'll need to:
   - Map old `patients` data to the new `patients` table
   - Map old `lab_reports`/`prescriptions` data to the unified tables
   - The script preserves existing tables if they match expected structure
3. **Service layer compatibility** - The unified `lab_reports` and `prescriptions` tables include all columns expected by both systems, so service layer functions should continue to work (they'll simply ignore the additional columns they don't use)
4. **Auth flow priority** - The design prioritizes auth flow and dashboard compatibility since login is the gateway to all functionality

## 🔧 Troubleshooting
If you encounter issues after applying the fix:

1. **Login fails** → Check that `get_next_id` function and `users` table exist and have correct structure
2. **Missing data in dashboard** → Verify RLS policies are allowing appropriate access
3. **Service layer errors** → Check that the unified table structures have all expected columns
4. **Constraint violations** → Ensure ID generation is working correctly for sequential IDs

For detailed verification steps, see `SCHEMA_VERIFICATION_GUIDE.md`.

## 🎯 Expected Outcome
After applying this fix:
- ✅ Login works with demo accounts
- ✅ Dashboard loads patient/medical data correctly
- ✅ All modules (Appointments, Laboratory, Pharmacy, Records) function properly
- ✅ No database-related errors during Vercel deployment
- ✅ Application stays connected to Supabase without errors