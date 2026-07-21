# SportiZen — Sports Networking & Talent Development Platform

SportiZen is a sports-centric networking platform that connects athletes (players), coaches, and sports academies (organizations) in one ecosystem. Athletes can create verified profiles, discover tournaments, connect with certified coaches, and track achievements.

---

## 🚀 Key Features

### 👥 Role-Based Portals & Dashboards
- **Player (Athlete):** Track event registrations, record achievements, view suggested coaches, and get profile tips to improve visibility.
- **Coach:** Accept or decline athlete connection requests, manage active clients, and view your coaching stats.
- **Academy (Organization):** Create and manage events, view registration analytics, and manually review & verify athlete document submissions.

### 🛡️ Document Verification
- Players upload a College ID or Sports Certificate to request profile verification.
- Documents are stored securely in Supabase Storage.
- Academy organizations manually review uploaded documents and approve or decline them via the Verification Center.
- Upon approval, the player's profile is marked as **Verified**, unlocking full tournament registration access.

> **Note:** There is no AI or automated OCR in the verification flow. Review is done entirely by human Academy reviewers.

### 📅 Tournaments & Events
- Browse, search, and register for active events matching your sport and eligibility.
- Organizations create events with full details: venue, date, eligibility, registration deadline, and optional poster image.
- Real-time registration counts visible to organizers.

### 📣 Sports Feed & Network
- Social timeline supporting general posts, coaching updates, and academy announcements.
- Likes, comments, and image attachments.
- Follow/unfollow any user; connection requests between players and coaches.

### 🔔 Notifications
- In-app notifications for: connection requests, accepted connections, new event matching sport, verification status updates, likes, comments, and new followers.

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| Backend / Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (email + password) |
| Storage | Supabase Storage (avatars, certificates, event posters, post media, achievement media) |
| Deployment | Vercel |

---

## 📂 Project Structure

```
SportiZen/
├── schema.sql                  # Complete from-scratch database schema (run this first)
├── src/
│   ├── components/
│   │   ├── auth/               # Login & signup forms with role selector
│   │   ├── dashboard/          # Role-specific dashboards (Player, Coach, Org)
│   │   ├── events/             # Event browsing & organization event manager
│   │   ├── feed/               # Social post creator and post card widgets
│   │   ├── layout/             # Navigation bar & notifications list
│   │   ├── profile/            # Profile view & role-specific editor
│   │   ├── search/             # Search to discover coaches or athletes
│   │   ├── ui/                 # Shared UI components (Avatar, SkeletonCard, etc.)
│   │   └── verification/       # Document upload portal & org review panel
│   ├── contexts/               # AuthContext & ThemeContext
│   ├── lib/                    # Supabase JS client configuration
│   ├── services/               # supabaseService.ts — all DB queries
│   └── types/                  # TypeScript interfaces
├── .env                        # Environment variables (see setup below)
└── README.md
```

---

## 💻 Local Setup

### 1. Clone & Install

```powershell
cd SportiZen
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

You can find these in your Supabase project → **Settings → API**.

### 3. Set Up the Database

Open the [Supabase SQL Editor](https://supabase.com/dashboard/project/_/sql) and run the contents of **`schema.sql`** in one shot. This creates all tables, RLS policies, triggers, and storage policies from scratch.

Then, create the following **Storage Buckets** in Supabase Dashboard → **Storage → New Bucket** (set each as **Public**):

| Bucket Name | Purpose |
|-------------|---------|
| `avatars` | User profile pictures |
| `covers` | User cover photos |
| `event-posters` | Event poster images |
| `post-media` | Images attached to feed posts |
| `achievement-media` | Images attached to achievements |
| `certificates` | Player verification documents |

### 4. Start Development Server

```powershell
npm run dev
```

Open `http://localhost:5173` in your browser.

### 5. Build for Production

```powershell
npm run build
```

---

## 🔑 Default Test Accounts

Register new accounts directly via the app's signup form. Select a role (Player, Coach, or Academy) during registration — a role-specific profile is created automatically.

There are no pre-seeded accounts. All data is live from your Supabase instance.

---

## 📋 Database Tables

| Table | Description |
|-------|-------------|
| `profiles` | Core user record (all roles) |
| `player_profiles` | Extended player-specific data |
| `coach_profiles` | Extended coach-specific data |
| `org_profiles` | Extended organization-specific data |
| `achievements` | Player achievements/medals/trophies |
| `posts` | Social feed posts |
| `comments` | Comments on posts |
| `events` | Sports events created by organizations |
| `event_registrations` | Player registrations for events |
| `connections` | Coach ↔ Player connection requests |
| `follows` | Follow relationships |
| `verification_documents` | Player documents submitted for verification |
| `notifications` | In-app notifications |