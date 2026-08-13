# UDHRS / DocuMed — Authorization System Documentation

This document describes the **real, live authorization (login/register) page** in this
codebase — the one actually shown to users — how it works end‑to‑end, and exactly what
is needed so it runs cleanly with **no unnecessary error banners**.

---

## 1. Which login system is actually live

This repository contains **two** authorization implementations. Only one of them is wired
into the app:

| | File(s) | Used by `App.tsx`? | What it is |
|---|---|---|---|
| ✅ **Live system** | `src/components/auth.tsx` (`AuthFlow`) + `src/lib/supa.ts` | **Yes** | Real Supabase Auth — sign‑up/sign‑in create actual `auth.users` rows and sessions |
| ⚠️ Legacy/unused | `src/components/LoginPage.tsx` + `src/auth/AuthContext.tsx` | No | Hard‑coded demo accounts (`DEMO_ACCOUNTS`) compared in plain text + `localStorage`; kept in the repo but never imported by `App.tsx` |

`src/App.tsx` imports `AuthFlow` from `./components/auth` and renders it whenever no
Supabase session exists. **`AuthFlow` is the authorization page** covered by the rest of
this document. It is "authentic" in the sense that it performs real authentication against
Supabase (`supabase.auth.signUp` / `signInWithPassword` / `resetPasswordForEmail`), not a
mock — there is no bypass and no hard‑coded password check in this path.

---

## 2. Why an error currently appears on load (root cause)

`index.html` includes two small diagnostic scripts (added during earlier debugging) that
are working exactly as designed:

- A **red full‑width overlay** that catches any uncaught JS error or unhandled promise
  rejection and prints its stack trace.
- A **yellow "Diagnostic: root empty" badge** that appears if `#root` is still empty
  1.5s after page load.

These only fire when something actually throws — and something currently does:

```
src/lib/supabaseClient.js
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

No `.env` file exists in this project. Without `VITE_SUPABASE_URL` /
`VITE_SUPABASE_ANON_KEY` set, `createClient(undefined, undefined)` throws
**`supabaseUrl is required.`** synchronously, on the very first import, before React ever
renders — which is exactly what the red overlay is catching. This is the "unnecessary
error" a user sees; the authorization page code itself is not at fault.

The project already contains the real project credentials in plain text at the repo root
(`url.txt`, `key.txt`) — they simply aren't wired into an `.env` file yet.

---

## 3. Fix checklist (do this once, in order)

1. **Create `.env` in the project root** (same folder as `package.json`):
   ```env
   VITE_SUPABASE_URL=https://cfyfeewbitawephfqzpg.supabase.co
   VITE_SUPABASE_ANON_KEY=sb_publishable_Ok4Q7_UEW5d9vj04wSUF_A_C5yzR90w
   ```
   This is the Supabase **publishable/anon** key — it is safe to ship to the browser and
   is meant to be public; access control is enforced by the Row Level Security (RLS)
   policies below, not by hiding this key.
   On Vercel, set the same two variables under Project → Settings → Environment Variables
   instead of (or in addition to) the `.env` file.

2. **Apply the database schema.** `fix_schema.sql` is the current, corrected migration —
   it creates `users`, `user_roles`, `id_counters`, `diagnoses`, `lab_reports`,
   `prescriptions`, `medical_docs`, `audit_logs`, the `handle_new_user()` trigger, the
   `get_next_id()` function, and RLS policies. Run it once in the Supabase SQL Editor.
   `feature_migrations.sql` additionally adds `get_email_from_id()` (lets users log in
   with their display ID instead of their synthetic email).

   ⚠️ **Known bug to fix before running `feature_migrations.sql`:** the
   `get_email_from_id` function is declared with `$$$ ... $$$` instead of the standard
   Postgres dollar-quoting `$$ ... $$`. As written it will raise a SQL syntax error in the
   Supabase SQL Editor. Change both `$$$` to `$$` before running that block.

3. **Turn off "Confirm email" for this project** (Supabase Dashboard → Authentication →
   Providers → Email → "Confirm email" = off), or configure a working SMTP sender.
   Registration signs users up with a synthetic address (`pat1001@documed.com`, etc.) that
   nobody can read — if email confirmation is required, `signInWithPassword` will fail
   right after registration with `Email not confirmed`, which looks like a bug but is a
   configuration setting.

4. **Restart the dev server** (`npm run dev`) after adding `.env` — Vite only reads
   `.env` at startup, not on hot reload.

Once these four steps are done, the red overlay and the "root empty" badge will not
appear under normal use, because the underlying `throw` no longer happens.

---

## 4. How the live authorization page works

```
Welcome  →  Role choice (Patient / Doctor / Laboratory Staff / Medical Records Staff)
                 │
        ┌────────┴────────┐
        ▼                 ▼
   Register           Sign In
        │                 │
        ▼                 ▼
 RegistrationComplete   App loads profile → routes to that role's dashboard
   (shows generated ID)
```

- **Roles**: exactly four — `Patient`, `Doctor`, `Laboratory Staff`,
  `Medical Records Staff`. (The legacy `LoginPage.tsx` additionally lists `Pharmacy` and
  `Admin`, but those only exist in the unused demo system.)
- **Register** (`RegisterForm`): validates required fields, password ≥ 8 chars and
  matching confirmation, calls `get_next_id` to pre-allocate a sequential display ID
  (e.g. `PAT1001`), then `supabase.auth.signUp(...)` with that ID and role in the user's
  metadata. A database trigger (`handle_new_user`) creates the matching `public.users`
  profile row automatically.
- **Sign In** (`LoginForm`): converts the entered ID to its synthetic email (or resolves
  the real email via `get_email_from_id` if one was provided at registration), calls
  `supabase.auth.signInWithPassword`, then double-checks the profile's role matches the
  role tab the user signed in from.
- **Forgot / Reset Password**: real Supabase flows — `resetPasswordForEmail` sends an
  email with a recovery link; `AuthFlow` detects `#type=recovery` in the URL and shows
  `ResetPasswordForm`, which calls `supabase.auth.updateUser({ password })`.
- **Session persistence**: handled by `supabase.auth.onAuthStateChange` in `App.tsx` — no
  manual `localStorage` bookkeeping in this path.

---

## 5. Error messages shown (all intentional, not bugs)

Only one message box (`<Msg kind="err">`) is rendered per form, and it is cleared at the
start of every submit — so the page never stacks multiple error banners on top of each
other.

| Screen | Message | Trigger |
|---|---|---|
| Register | "Please fill: `<field>`" | A required field for that role is empty |
| Register | "Password must be at least 8 characters." | Password too short |
| Register | "Passwords do not match." | Confirmation doesn't match |
| Register | "Could not allocate ID: …" | `get_next_id` RPC failed (schema not applied) |
| Sign In | "Please enter your ID and password." | Empty field on submit |
| Sign In | "Incorrect ID or password." | Supabase rejected the credentials |
| Sign In | "This ID is registered as `<role>`, not `<role>`." | User picked the wrong role tab |
| Forgot password | "Password reset instructions sent to your email." | Success (shown in green) |
| Reset password | "Password must be at least 8 characters." / "Passwords do not match." | Client-side validation |

These are expected, user-facing validation/auth messages — they are not the
"unnecessary" red overlay described in Section 2, and no code change is needed for them.

---

## 6. Verifying it's clean

1. Add `.env`, restart `npm run dev`, open the app in a fresh tab.
2. Open the browser console — there should be no red overlay and no yellow
   "Diagnostic: root empty" badge.
3. Register a test **Patient** account, confirm you land on `RegistrationComplete` with a
   generated ID like `PAT1001`.
4. Sign in with that ID and password — confirm you land on the Patient dashboard.
5. Try signing in with the wrong role tab selected for that same ID — confirm you get the
   "registered as …" message, not a crash.
6. Use "Forgot Password" with a real email you provided at registration and confirm the
   green success message appears.

If all six steps pass with no red overlay at any point, the authorization page is fully
working end‑to‑end with no unnecessary errors.
