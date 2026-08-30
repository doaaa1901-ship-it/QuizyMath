# Admin panel — setup & what changed

## 1. Install and add the new env variable
Your `.env` already got a new line added automatically:

```
ADMIN_URL_SECRET=<a random 24-character string>
```

This is the secret part of your admin panel's URL. **Keep `.env` private** — anyone with
this value can find the admin login page. If you ever share this project, your terminal
history, or this chat, treat that string as compromised and generate a new one:

```bash
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

then update `ADMIN_URL_SECRET` in `.env` (this changes your panel's URL).

## 2. Install dependencies (node_modules was removed from this download)
```bash
npm install
```

## 3. Create your admin account
Signup/verify in this project are still empty stubs, so admin accounts are created
directly via a script:

```bash
npm run create-admin -- "Your Name" you@example.com "StrongPassword123"
```

Running it again on the same email just promotes/updates that account.

## 4. Find your panel URL
Start the server (`npm start` / however you normally run it, or `node server.js`).
On boot it prints:

```
🔐 لوحة الأدمن شغالة على المسار السري: /panel-<your-secret>
```

Go to `http://localhost:5000/panel-<your-secret>` and log in with the admin account
from step 3. The dashboard lives at `/panel-<your-secret>/dashboard` after login.

## What was added / changed

**New — Admin panel**
- `middlewares/auth.js` — real JWT auth (`protect`, `optionalAuth`, `adminOnly`).
- `controllers/adminController.js`, `routes/adminRoutes.js` — stats, user list, per-user
  detail (login history + their scores), all scores.
- `public/admin/login.html`, `public/admin/dashboard.html`, `public/css/admin.css` —
  the panel UI. These are **not** served through the normal static file folder, so they
  can't be found by browsing `/admin` or guessing filenames — only through the exact
  secret URL, which itself only unlocks the login *form*. The actual data endpoints
  still require a real admin JWT regardless of whether someone finds the URL.
- `scripts/createAdmin.js` — CLI to create/promote an admin user.
- `User` model gained `role`, `lastLoginAt`, `lastLoginIP`, `loginHistory` (last 10 logins
  with IP + device), and timestamps — this is the "how users log in" data shown per-user
  in the dashboard.
- Admin login reuses the normal `/api/login` endpoint — same email/password, the server
  just checks the account's `role` before letting the token access anything under
  `/api/panel-<secret>/*`.

**Fixed — these were open before and are now locked down**
- `GET /api/user/profile` and `PUT /api/user/update` used to take an `email` in the query
  string / body and return **that** person's data — anyone could read or edit any
  account by guessing an email. They now require a valid login token and only ever
  act on the logged-in user's own account.
- `GET /api/scores/user` had the same problem for quiz history — now requires a token
  and only returns the caller's own scores.
- `POST /api/scores` no longer trusts a client-supplied email; if you're logged in it
  uses your account's real email, otherwise it saves as `guest` (per your choice).
- The public leaderboard (`/api/scores/leaderboard`) now masks emails
  (`j***@gmail.com`) instead of showing them in full to any visitor.

**Frontend**
- `log.html` now stores the login token in `localStorage`.
- `settings.html` and `quiz.js` send that token in an `Authorization: Bearer` header
  instead of the old plain-email fields.

## Note on "unguessable URLs"
A secret path is a reasonable extra layer, but it isn't the real security boundary —
that's the `protect` + `adminOnly` check on every admin API call. Even if the URL leaks,
no data comes back without a valid admin login. Treat the secret path as "keeps casual
snooping and search-engine crawlers out," not as the only lock.
