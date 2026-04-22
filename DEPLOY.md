# GC KSA Sales Command Center — Deployment Guide
## React 18 + TypeScript + Vite + Supabase + Vercel

---

## ⚡ Quick Start (15 minutes to live)

### Step 1 — Supabase Database
1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Name it `gc-ksa-dashboard`, choose region closest to KSA (e.g. Frankfurt or Singapore)
3. Settings → **API** → copy:
   - `Project URL` → paste into `.env` as `VITE_SUPABASE_URL`
   - `anon public` key → paste into `.env` as `VITE_SUPABASE_ANON_KEY`
4. Go to **SQL Editor** → New Query → paste contents of `supabase-schema.sql` → **Run**

### Step 2 — Configure Environment
```bash
cp .env.example .env
# Edit .env with your Supabase credentials
```

### Step 3 — Run Locally
```bash
pnpm install
pnpm dev
# Open http://localhost:5173
```

### Step 4 — Deploy to Vercel (free)
```bash
npm i -g vercel
vercel login
vercel --prod
# Vercel will ask you to set environment variables — paste your Supabase values
```
Your dashboard will be live at `https://gc-ksa-dashboard.vercel.app`

---

## 🔌 Connecting to Live Supabase Data

The app currently uses **mock data** from `src/lib/data.ts`.  
To switch to live Supabase:

1. Set `VITE_USE_MOCK_DATA=false` in `.env`
2. Open `src/App.tsx`
3. Replace the mock data imports with Supabase queries:

```typescript
// In App.tsx — replace mock state with Supabase queries
import { supabase } from './lib/supabase'
import { useEffect, useState } from 'react'
import type { Deal, Rep } from './lib/supabase'

// Inside the App component:
const [deals, setDeals] = useState<Deal[]>([])
const [reps, setReps] = useState<Rep[]>([])

useEffect(() => {
  // Fetch deals
  supabase.from('deals').select('*').order('date', { ascending: false })
    .then(({ data }) => data && setDeals(data))

  // Fetch reps  
  supabase.from('reps').select('*').order('secured', { ascending: false })
    .then(({ data }) => data && setReps(data))

  // Real-time subscription for instant updates
  const dealsSub = supabase
    .channel('deals-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'deals' }, 
      payload => {
        if (payload.eventType === 'INSERT') setDeals(d => [payload.new as Deal, ...d])
        if (payload.eventType === 'UPDATE') setDeals(d => d.map(x => x.id === payload.new.id ? payload.new as Deal : x))
        if (payload.eventType === 'DELETE') setDeals(d => d.filter(x => x.id !== payload.old.id))
      })
    .subscribe()

  return () => { supabase.removeChannel(dealsSub) }
}, [])
```

### Seeding Initial Data
After running the schema, seed your 34 deals + 13 reps:
```bash
# Option A: Use Supabase Dashboard → Table Editor → Import CSV
# Export from your Excel v9 and import

# Option B: Run the seed script
node scripts/seed-supabase.js
```

---

## 📁 Project Structure

```
gc-ksa-app/
├── src/
│   ├── lib/
│   │   ├── supabase.ts      # Supabase client + TypeScript types
│   │   └── data.ts          # Mock data + computed helpers (fmtSAR, repTier, etc.)
│   ├── pages/
│   │   ├── Overview.tsx     # Executive dashboard with charts
│   │   ├── Pipeline.tsx     # All deals, inline edit, filters
│   │   ├── Kanban.tsx       # Drag-drop board by stage
│   │   ├── Contracts.tsx    # Closed deals, collections
│   │   ├── Revenue.tsx      # Waterfall, monthly P&L
│   │   ├── Commissions.tsx  # Tier calculator, bar chart
│   │   ├── SalesTeam.tsx    # 13 reps, scorecards
│   │   ├── LostDeals.tsx    # Recovery ops, reason analysis
│   │   ├── Clients.tsx      # Company directory
│   │   └── Goals.tsx        # OKRs, progress tracking
│   ├── App.tsx              # Root with context, sidebar, topbar, routing
│   └── App.css              # Dark/light theme, all global styles
├── supabase-schema.sql      # Run this in Supabase SQL Editor
├── .env.example             # Template — copy to .env
├── DEPLOY.md                # This file
└── package.json
```

---

## 🚀 Other Deployment Options

### Netlify
```bash
pnpm build
netlify deploy --prod --dir dist
```

### AWS Amplify
```bash
# Connect your GitHub repo to Amplify
# Set env vars in Amplify console
# Auto-deploys on every push
```

### Self-hosted (nginx)
```bash
pnpm build
# Copy dist/ to your server
# Configure nginx to serve index.html for all routes
```

---

## 🔐 Adding Authentication (Optional)

Supabase Auth is built-in. To protect the dashboard:

```typescript
// Add to App.tsx
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from './lib/supabase'

// Show auth screen if not logged in
const [session, setSession] = useState(null)
useEffect(() => {
  supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
  supabase.auth.onAuthStateChange((_event, session) => setSession(session))
}, [])

if (!session) {
  return <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} providers={['google']} />
}
```

---

## 🔄 Real-time Sync Between Team Members

Once connected to Supabase, any update one team member makes (moving a deal stage, editing a value) **instantly syncs** to all open browsers via WebSocket. No refresh needed.

---

## 📞 Support

Built by Claude (Anthropic) for TryGC · Ahmed Essmat · Head of Regional Operations
Dashboard mirrors GC KSA Sales Command Center v9 HTML → React → Supabase
