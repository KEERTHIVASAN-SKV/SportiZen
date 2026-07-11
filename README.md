# SportiZen: AI-Powered Sports Networking & Talent Development Platform

SportiZen is a dedicated sports-centric networking platform designed to bring athletes (players), coaches, and sports organizations (academies) into a single ecosystem. It helps athletes create verified sports profiles, discover tournaments, connect with certified coaches, and get AI-driven career path analyses.

---

## 🚀 Key Features

### 👥 Role-Based Portals & Dashboards
*   **Player (Athlete)**: Track registrations, record achievements, timelines, and consult the **AI Talent Advisor** for coaching tips and tournament recommendations based on profile metrics.
*   **Coach**: Accept or decline athlete connection requests, list clients, monitor ratings, and publish coaching tips.
*   **Academy (Organization)**: Create, edit, and delete events. View registrations analytics through graphic CSS chart bars, manage event rosters, and verify athlete profiles.

### 🛡️ AI OCR Verification
*   Players can upload College IDs or Sports Certificates.
*   Simulated **AI OCR document engine** parses uploaded credentials, checks security seals, matches athlete details, and submits reports to the Academy panel for approval.

### 📅 Tournaments & Events
*   Browse, search, and register for active events matching sport and eligibility guidelines.
*   Organizations can view registration rosters in real-time.

### 📣 Sports Feed & Network
*   Social timeline supporting general posts, coaching updates, and academy announcements with likes, comments, and image attachments.

---

## 🛠️ Technology Stack
*   **Frontend**: React (v18), TypeScript, Vite, Tailwind CSS
*   **Icons**: Lucide React
*   **Mock Database Layer**: In-memory database with `localStorage` persistence that replicates PostgreSQL table relations.

---

## 📂 Project Structure
```text
src/
├── components/
│   ├── auth/          # Login & Signup forms with Role Selector cards
│   ├── dashboard/     # Dashboards (Player, Coach, Org, and AI Chatbot)
│   ├── events/        # Events browsing & Organization tournament managers
│   ├── feed/          # Social post creator and post card widgets
│   ├── layout/        # Dynamic Navigation and NotificationsList page
│   ├── profile/       # Profile view sections & role-specific editor fields
│   ├── search/        # Search pages to discover coaches or athletes
│   └── verification/  # Upload portal with terminal AI OCR check logs
├── contexts/          # Auth Context & Theme Context
├── lib/               # Supabase JS configuration files
├── services/          # mockDb central database services layer
└── types/             # Extended TypeScript interfaces
```

---

## 💻 Local Setup Instructions

Follow these steps to run the application locally:

### 1. Clone & Enter Directory
```powershell
cd SportiZen
```

### 2. Install Dependencies
Install all required Node packages:
```powershell
npm install
```

### 3. Start Development Server
Run Vite's local hot-reloading dev server:
```powershell
npm run dev
```
Open your browser and navigate to the local host URL shown in your terminal (usually `http://localhost:5173`).

### 4. Build for Production
To build static production-ready bundles, run:
```powershell
npm run build
```

---

## 🔑 Seeding & Mock Accounts
The system pre-seeds default credentials for testing. You can use any password to log in:

*   **Player Account**: `liam@sportizen.com` (Basketball, 19 yrs old, pending certificate verification)
*   **Coach Account**: `marcus@sportizen.com` (Basketball Coach, 8 yrs experience, rating 4.9)
*   **Academy Account**: `admin@nsa.org` (National Sports Academy, hosts basketball and soccer events)