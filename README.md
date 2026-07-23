# MindBridge Health Foundation — A2 Web Application

**FIT5032 — Assessment 2**
**Student:** Yiding Shao (366698389)
**Monash University, Semester 2, 2025**

## Overview

MindBridge Health Foundation is a web application designed for a distinguished health charity focused on improving mental health and well-being of underrepresented communities. This project is built as part of A2, implementing Business Requirements A-C using the VueJS 3 framework.

## Target Audience

Individuals facing mental health challenges — including young adults, elderly populations, working professionals, and caregivers.

## Tech Stack

- **VueJS 3** — Composition API with `<script setup>`
- **Vite** — Build tool and dev server
- **Vue Router 4** — Client-side routing with navigation guards
- **Bootstrap 5** — Responsive CSS framework
- **localStorage** — Client-side data persistence

## Features (Business Requirements A-C)

### Category A — Development & Design
- **A.1:** VueJS 3 framework with modular component architecture
- **A.2:** Fully responsive design across all device breakpoints

### Category B — Functionality
- **B.1:** Comprehensive input validations (contact form + registration form with real-time feedback)
- **B.2:** Dynamic data rendering from JavaScript data structures with localStorage persistence

### Category C — Advanced Features
- **C.1:** User authentication (login/register) with secure password hashing
- **C.2:** Role-based authentication (client, volunteer, professional, admin roles)
- **C.3:** Aggregated star rating system for services
- **C.4:** Security measures (XSS prevention, input sanitization, client-side validation)

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@mindbridge.org | Admin@123 |
| Client | sarah@example.com | Sarah@123 |

## Project Structure

```
src/
├── main.js                  # App entry point
├── App.vue                  # Root component
├── style.css                # Global styles
├── router/index.js          # Routes + navigation guards
├── stores/                  # State management
│   ├── auth.js              # Auth + localStorage
│   ├── resources.js         # Dynamic resource data
│   ├── ratings.js           # Rating system
│   └── services.js          # Services data
├── components/              # Reusable components
│   ├── NavBar.vue           # Responsive navigation
│   ├── FooterBar.vue        # Site footer
│   ├── CrisisHelpline.vue   # Crisis banner
│   └── StarRating.vue       # Rating component
└── views/                   # Page components
    ├── HomePage.vue
    ├── AboutPage.vue
    ├── ResourcesPage.vue
    ├── ServicesPage.vue
    ├── ServiceDetail.vue
    ├── GetInvolvedPage.vue
    ├── ContactPage.vue
    ├── LoginPage.vue
    ├── RegisterPage.vue
    ├── DashboardPage.vue
    └── AdminDashboard.vue
```
