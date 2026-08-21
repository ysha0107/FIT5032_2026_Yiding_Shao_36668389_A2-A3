# MindBridge Health Foundation — Web Application (A2 + A3)

**FIT5032 — Assessments 2 & 3**
**Student:** Yiding Shao (36668389)
**Monash University, Semester 2, 2026**

**Live app (D.4):** https://mindbridge-1kk.pages.dev
**Serverless API (E.1):** https://mindbridge-api.ysha0107.workers.dev

---

## Overview

MindBridge Health Foundation is a web application for a mental health charity that supports underrepresented communities. A2 implemented Business Requirements A–C on Vue 3. A3 extends the same repository with Business Requirements D–F: external authentication, email with attachments, interactive tables, cloud deployment, serverless functions, geo-location, accessibility, data export, and four UX innovations.

---

## Tech Stack

| Technology | Purpose |
|-----------|---------|
| VueJS 3 (Composition API) | Front-end framework (A.1) |
| Vite | Build tool & dev server |
| Vue Router 4 | Routing with auth/role guards |
| Bootstrap 5 (CSS only) | Responsive layout (A.2) |
| Firebase Auth | External authentication (D.1) — email/password + Google sign-in |
| Firestore | Users, ratings, contacts, appointments; offline persistence |
| EmailJS | Bulk email to selected users (F.1) |
| Resend (via Worker) | Contact emails with attachments (D.2) |
| Cloudflare Pages | Cloud deployment (D.4) |
| Cloudflare Workers + KV | Serverless functions: REST API + appointment validation + email (E.1) |
| Leaflet + Nominatim + OSRM | Map with place search and routing (E.2) |
| FullCalendar | Appointment booking with conflict management (F.1) |
| Chart.js | Interactive admin charts from Firestore data (F.1) |
| jsPDF | PDF export (E.4) |
| Node test runner | Unit tests for table/csv/booking logic |

---

## Business Requirements Implemented

### A2 (Categories A–C) — kept and upgraded
- **A.1** VueJS 3 · **A.2** Responsive Bootstrap layout
- **B.1** Input validation (email regex, password strength, length limits)
- **B.2** Dynamic data rendering (resources/services datasets)
- **C.1** Authentication — now via Firebase Auth (upgraded from localStorage)
- **C.2** Role-based access (client / volunteer / professional / admin)
- **C.3** Aggregated ratings — now in Firestore, one rating per user per service
- **C.4** Security — no `v-html`, input sanitisation, Firestore security rules

### A3 (Categories D–F)

| BR | Requirement | Implementation |
|----|------------|---------------|
| **D.1** | External authentication | Firebase Auth (email/password + Google popup). Profiles (name, role) in Firestore; router guards await the first auth-state callback before mounting |
| **D.2** | Email with attachment | Contact form attaches a file (≤1 MB) → `POST /api/email` on the Cloudflare Worker → Resend delivers it to the charity inbox. Firestore stores the message either way |
| **D.3** | Interactive table data (≥2 tables) | Reusable `DataTable.vue`: per-column search, column sorting, 10 rows/page. Used for Users, Contact Messages and Appointments tables |
| **D.4** | Cloud deployment | Cloudflare Pages (`wrangler pages deploy dist`), `_redirects` SPA fallback |
| **E.1** | Serverless functions | Self-designed Cloudflare Worker: `GET /api/resources`, `GET /api/resources/:id` (public REST API), `POST /api/appointments` (server-side business-hours + conflict validation stored in KV), `POST /api/email` (attachment email via Resend) |
| **E.2** | Map with ≥2 non-trivial features | Leaflet: (1) Nominatim geocoding search of places of interest, (2) OSRM routing from a searched point or the user's location to a MindBridge centre with distance/duration |
| **E.3** | WCAG 2.1 AA | Skip-to-content link, visible focus outlines, aria-invalid/aria-describedby on form errors, aria-sort on table headers, keyboard-operable star rating, contrast fixes (dark text on amber buttons) |
| **E.4** | Export CSV/PDF | Every table exports CSV (filtered view, BOM for Excel); admin tables export PDF via jsPDF + autotable |
| **F.1** | Four innovative UX features | 1) **Appointment booking** (FullCalendar): weekday 9–17 slots, global conflict management per professional, 2-upcoming limit per user; 2) **Bulk email** to selected users (EmailJS); 3) **Interactive charts** from Firestore (users by role, average rating per service, appointments per week); 4) **Offline capabilities**: online/offline banner, Firestore persistence, localStorage queue that auto-syncs contacts and ratings on reconnect |

---

## Getting Started

```bash
npm install        # deps (use --registry=https://registry.npmjs.org if the mirror is stale)
cp .env.example .env   # then fill the EmailJS values (see below)
npm run dev        # http://localhost:5173 (run with VPN on in China — Firebase needs it)
npm test           # unit tests (table/csv/booking logic)
npm run build      # production build to dist/
```

### Environment (`.env`)

```
VITE_EMAILJS_SERVICE_ID=service_xxxx      # EmailJS dashboard → Email Services
VITE_EMAILJS_PUBLIC_KEY=xxxxxxxx          # EmailJS dashboard → Account → General
VITE_EMAILJS_BULK_TEMPLATE_ID=template_yyyy  # bulk template: {{to_email}} {{to_name}} {{subject}} {{message}}
VITE_WORKER_URL=https://mindbridge-api.ysha0107.workers.dev
```

### Firebase

Project `week7-yidingshao`: Auth (email/password + Google), Firestore with security rules in `docs/firestore.rules`.

### Cloudflare Worker (`workers/mindbridge-api/`)

```bash
cd workers/mindbridge-api
npx wrangler secret put RESEND_API_KEY    # Resend API key (D.2 email)
npx wrangler deploy
```

### Deploy the SPA

```bash
npx wrangler pages deploy dist --project-name=mindbridge
```

---

## Routes

| Path | Component | Auth |
|------|-----------|:----:|
| `/` | HomePage | Public |
| `/about` | AboutPage | Public |
| `/resources` | ResourcesPage | Public |
| `/services`, `/services/:id` | ServicesPage / ServiceDetail | Public / Login for rating |
| `/locations` | LocationsPage (map) | Public |
| `/contact` | ContactPage (email + attachment) | Public |
| `/login`, `/register` | Login / Register (+ Google) | Guest only |
| `/dashboard` | DashboardPage | All roles |
| `/book-appointment` | AppointmentPage (FullCalendar) | All roles |
| `/admin` | AdminDashboard (tables, charts, bulk email) | Admin |

---

## Demo Accounts (Firebase)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@mindbridge.org | Admin@123 |
| Client | sarah@example.com | Sarah@123 |

---

## Project Structure (A3 additions)

```
mindbridge/
├── src/
│   ├── firebase.js               # Firebase app/auth/firestore init + persistence
│   ├── stores/
│   │   ├── auth.js               # Firebase Auth + Firestore profiles + role guard data
│   │   ├── ratings.js            # Firestore ratings + offline queue flusher
│   │   ├── contacts.js           # Firestore contacts + offline queue flusher
│   │   ├── appointments.js       # Firestore bookings + worker mirror POST
│   │   └── network.js            # online/offline state + localStorage queue
│   ├── utils/
│   │   ├── table.js              # filter/sort/paginate (unit-tested)
│   │   ├── csv.js                # CSV serialisation + download (unit-tested)
│   │   ├── booking.js            # business hours/conflict rules (unit-tested)
│   │   └── pdf.js                # jsPDF table export
│   ├── components/
│   │   ├── DataTable.vue         # reusable interactive table (D.3)
│   │   └── OfflineBanner.vue     # offline status banner (F.1)
│   └── views/
│       ├── LocationsPage.vue     # Leaflet map: search + routing (E.2)
│       ├── AppointmentPage.vue   # FullCalendar booking (F.1)
│       ├── BulkEmailPanel.vue    # admin bulk email (F.1)
│       └── AdminDashboard.vue    # tables + charts + bulk email + PDF export
├── workers/mindbridge-api/       # Cloudflare Worker (E.1): REST API, KV validation, email
├── tests/                        # node --test unit tests
├── docs/                         # design spec, implementation plan, firestore.rules,
│                                 # video storyboard, research report draft
└── public/_redirects             # SPA fallback for Cloudflare Pages
```

---

## Submission Checklist (A3)

- [x] External authentication (D.1) — Firebase Auth email/password + Google
- [x] Email with attachment (D.2) — Worker → Resend
- [x] 3 interactive tables: sort / per-column search / 10 rows per page (D.3)
- [x] Cloud deployment (D.4) — Cloudflare Pages
- [x] Serverless functions (E.1) — Cloudflare Worker + KV
- [x] Map with search + routing (E.2)
- [x] WCAG 2.1 AA accessibility pass (E.3)
- [x] CSV + PDF export (E.4)
- [x] Four innovations: booking, bulk email, charts, offline (F.1)
- [x] GitHub commits spread over >48h
- [ ] Screen recording video → Google Drive
- [ ] Filled submission template (docx generated by `scripts/fill_a3_template.py`)
- [ ] Zip + Moodle submission
