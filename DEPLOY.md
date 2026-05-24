# ☀️ Solar EV Charging PH — Deployment Guide

This is a **React + Vite** survey app that stores responses in **Supabase** and is deployed on **Netlify**.

---

## 1 · Supabase Setup

### 1.1 Create a project
1. Go to [supabase.com](https://supabase.com) → **New project**
2. Name it `ev-charging-solar` (or anything you like)
3. Choose a strong database password — save it somewhere safe
4. Pick the **Southeast Asia (Singapore)** region for lowest latency from PH

### 1.2 Run the schema
1. In your Supabase project → **SQL Editor** → **New query**
2. Paste the contents of `supabase_schema.sql` and click **Run**
3. You should see `survey_responses` appear under **Table Editor**

### 1.3 Get your credentials
Go to **Settings → API** and copy:
- **Project URL** → `https://xxxx.supabase.co`
- **anon / public** key → long JWT string

---

## 2 · Local Development

```bash
# 1. Install dependencies
npm install

# 2. Create your local env file
cp .env.example .env.local

# 3. Fill in .env.local with your Supabase credentials:
#    VITE_SUPABASE_URL=https://your-project-id.supabase.co
#    VITE_SUPABASE_ANON_KEY=your-anon-key

# 4. Start the dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) — fill out the survey, check Supabase **Table Editor** to confirm data lands.

---

## 3 · Netlify Deployment

### Option A — Netlify CLI (recommended)
```bash
# Install Netlify CLI globally
npm install -g netlify-cli

# Login
netlify login

# Link or create site
netlify init

# Set environment variables (one-time)
netlify env:set VITE_SUPABASE_URL     "https://your-project-id.supabase.co"
netlify env:set VITE_SUPABASE_ANON_KEY "your-anon-key"

# Deploy to production
netlify deploy --build --prod
```

### Option B — Netlify Dashboard (drag & drop)
1. Run `npm run build` locally → a `dist/` folder is created
2. Go to [app.netlify.com](https://app.netlify.com) → **Add new site → Deploy manually**
3. Drag the `dist/` folder into the upload zone
4. After deploy → **Site configuration → Environment variables** → add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. **Trigger a redeploy** so the env vars are baked into the build

### Option C — Git-connected auto-deploy
1. Push this repo to GitHub / GitLab
2. In Netlify → **Add new site → Import an existing project**
3. Connect your repo
4. Build settings are auto-detected from `netlify.toml`:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Add the two env vars under **Site configuration → Environment variables**
6. Every push to `main` triggers a new deploy automatically

---

## 4 · Viewing Survey Results

In Supabase → **Table Editor → survey_responses** you'll see every submission.

For a quick aggregation, run in the SQL Editor:

```sql
-- Responses by location
SELECT location, COUNT(*) AS total
FROM survey_responses
GROUP BY location
ORDER BY total DESC;

-- Solar preference breakdown
SELECT solar_preference, COUNT(*) AS total
FROM survey_responses
GROUP BY solar_preference
ORDER BY total DESC;

-- EV timeline
SELECT ev_timeline, COUNT(*) AS total
FROM survey_responses
GROUP BY ev_timeline
ORDER BY total DESC;
```

---

## 5 · Project Structure

```
├── netlify.toml              ← Netlify build + redirect config
├── .env.example              ← Template for env vars (safe to commit)
├── .env.local                ← Your actual secrets (DO NOT COMMIT)
├── supabase_schema.sql       ← Run once in Supabase SQL Editor
├── src/
│   ├── supabaseClient.js     ← Supabase client + submitSurveyResponse()
│   ├── App.jsx               ← Main survey UI (updated with DB integration)
│   ├── main.jsx
│   └── index.css
├── public/
└── vite.config.js
```

---

## 6 · Security Notes

- The `anon` key is safe to expose in frontend code — Supabase Row-Level Security limits it to **INSERT only**.
- Respondents cannot read each other's data.
- Your Supabase **service role key** must never go in frontend code.
- All survey names are self-reported nicknames — no PII verification.
