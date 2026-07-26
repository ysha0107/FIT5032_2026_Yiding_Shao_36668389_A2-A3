# MindBridge Health Foundation — A2 Web Application

**FIT5032 — Assessment 2**
**Student:** Yiding Shao (366698389)
**Monash University, Semester 2, 2025**

---

## Overview

MindBridge Health Foundation is a web application designed for a distinguished health charity focused on improving mental health and well-being of underrepresented communities. The app targets individuals facing mental health challenges — including young adults, elderly populations, working professionals, and caregivers.

This project is built as part of A2, implementing **Business Requirements A, B, and C** using the **VueJS 3** framework.

---

## Tech Stack

| Technology | Purpose |
|-----------|---------|
| VueJS 3 (Composition API) | Front-end framework |
| Vite | Build tool & dev server |
| Vue Router 4 | Client-side routing with navigation guards |
| Bootstrap 5 | Responsive CSS framework |
| localStorage | Client-side data persistence |

---

## Business Requirements Implemented

### Category A — Development & Design
| BR | Requirement | Implementation |
|----|------------|---------------|
| **A.1** | VueJS 3 framework | Composition API + `<script setup>`, modular SFC architecture, 11 views, 4 components |
| **A.2** | Responsiveness | Bootstrap 5 grid, hamburger menu on mobile, fluid layouts across all breakpoints |

### Category B — Functionality
| BR | Requirement | Implementation |
|----|------------|---------------|
| **B.1** | Input validations (2+ types) | Contact form: required fields, email regex, character limits. Registration: password strength, confirmation match, email uniqueness. Real-time visual feedback. |
| **B.2** | Dynamic data | Resources and services rendered from JS data structures via `v-for`. localStorage persists users, ratings, and contact messages. |

### Category C — Advanced Features
| BR | Requirement | Implementation |
|----|------------|---------------|
| **C.1** | Authentication | Login/register with localStorage-backed user accounts and salted password hashing |
| **C.2** | Role-based auth (2+ roles) | client, volunteer, professional, admin roles. Route guards prevent unauthorized access. Admin dashboard shows user statistics. |
| **C.3** | Aggregated rating | Interactive star rating component. One rating per user per item. Average score displayed with count. |
| **C.4** | Security | No `v-html` (XSS prevention). Input sanitization (`/<[^>]*>/g`). Client-side validation on all forms. Password never stored plain-text or in session object. No API keys in source. |

---

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

---

## Routes

| Path | Component | Auth | Access |
|------|-----------|:----:|--------|
| `/` | HomePage | No | Public |
| `/about` | AboutPage | No | Public |
| `/resources` | ResourcesPage | No | Public |
| `/services` | ServicesPage | No | Public |
| `/services/:id` | ServiceDetail | Yes | All roles |
| `/get-involved` | GetInvolvedPage | No | Public |
| `/contact` | ContactPage | No | Public |
| `/login` | LoginPage | No | Guest only |
| `/register` | RegisterPage | No | Guest only |
| `/dashboard` | DashboardPage | Yes | All roles |
| `/admin` | AdminDashboard | Yes | Admin only |

---

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@mindbridge.org | Admin@123 |
| Client | sarah@example.com | Sarah@123 |

---

## Project Structure

```
mindbridge/
├── index.html
├── package.json
├── vite.config.js
├── public/
└── src/
    ├── main.js                  # App entry point
    ├── App.vue                  # Root component
    ├── style.css                # Global styles (calming blues/greens theme)
    ├── router/
    │   └── index.js             # 11 routes + beforeEach navigation guards
    ├── stores/
    │   ├── auth.js              # Authentication + localStorage user management
    │   ├── resources.js         # 10 resources with category/tag filtering
    │   ├── ratings.js           # Rating system (itemId+userId composite key)
    │   └── services.js          # 6 services across 6 categories
    ├── components/
    │   ├── NavBar.vue           # Responsive nav with auth-aware UI
    │   ├── FooterBar.vue        # Site footer with links + newsletter
    │   ├── CrisisHelpline.vue   # Persistent crisis banner (Lifeline 13 11 14)
    │   └── StarRating.vue       # Reusable 1-5 star rating component
    └── views/
        ├── HomePage.vue         # Hero, stats, featured services & resources, testimonials
        ├── AboutPage.vue        # Mission, values, impact stats, team
        ├── ResourcesPage.vue    # Filterable/searchable article library (B.2)
        ├── ServicesPage.vue     # Service cards with aggregated ratings (C.3)
        ├── ServiceDetail.vue    # Full service detail + interactive rating form
        ├── GetInvolvedPage.vue  # Donate, volunteer, partner
        ├── ContactPage.vue      # Contact form with real-time validation (B.1)
        ├── LoginPage.vue        # Login form with demo account hints (C.1)
        ├── RegisterPage.vue     # Registration with password strength meter (C.1)
        ├── DashboardPage.vue    # Role-based user dashboard (C.2)
        └── AdminDashboard.vue   # Admin: user stats, role breakdown, system status (C.2)
```

---

## Submission Checklist

- [x] VueJS 3 web application (BR A.1)
- [x] Responsive design (BR A.2)
- [x] Input validations (BR B.1)
- [x] Dynamic data rendering (BR B.2)
- [x] Authentication (BR C.1)
- [x] Role-based authentication (BR C.2)
- [x] Rating system (BR C.3)
- [x] Security measures (BR C.4)
- [x] GitHub repository with commit history
- [ ] Screen recording video (upload to Google Drive)
- [ ] Filled submission template
- [ ] Zip file submission on Moodle
