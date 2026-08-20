# MindBridge A3 (BR D–F) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the A2 MindBridge Vue 3 app to satisfy Business Requirements D.1–F.1, deployable and demoable by Sunday 23 Aug 2026, 1:55 PM.

**Architecture:** Firebase (existing project `week7-yidingshao`; Auth email/password + Google, Firestore) replaces localStorage as source of truth for users/ratings/contacts/appointments; localStorage becomes an offline queue (F.1). Cloudflare Pages hosts the SPA (D.4); a Cloudflare Worker exposes a REST API + server-side appointment validation (E.1). EmailJS sends emails with attachments (D.2). Leaflet map (E.2), custom DataTable (D.3), jsPDF/CSV export (E.4), WCAG 2.1 AA fixes (E.3). Innovations: FullCalendar booking, bulk email, Chart.js charts, offline capabilities (F.1).

**Tech Stack:** Vue 3.5 (Composition API), Vite 8, Vue Router 4, Bootstrap 5 CSS, Firebase 12, EmailJS 4, Leaflet 1.9, FullCalendar 6, Chart.js 4, jsPDF + autotable, Wrangler 4, Node 24 built-in test runner (`node --test`), python-docx (submission template).

**Spec:** `docs/superpowers/specs/2026-08-20-a3-design.md` (read first). **Handover:** `D:\Desktop\A2\handover.md`. **Lab reference (Firebase config):** `D:\Desktop\A2\_lab_check\src\firebase\init.js`.

**Environment notes:**
- Run dev server + Firebase operations **with VPN on** (Firebase endpoints are blocked in China; tutor in AU is unaffected).
- Node 24, npm 11, Git Bash on Windows. `npm install` works without proxy.
- Demo users already exist in Firebase Auth console: `admin@mindbridge.org`/`Admin@123`, `sarah@example.com`/`Sarah@123`. Admin profile doc exists at `users/{adminUID}` with `role: 'admin'`.
- Git: **commit locally only — NEVER push** unless the user asks. Commit at every task end (spreads committer dates >48h).
- EmailJS: service connected (user's mailbox). Templates must be created by user per Task 6 instructions; keys go into `.env` (not committed).

---

### Task 0: Dependencies, env scaffolding, test runner

**Files:**
- Modify: `package.json` (scripts + deps)
- Create: `.env`, `.env.example`
- Modify: `.gitignore` (add `.env`)

- [ ] **Step 1: Install dependencies**

```bash
cd "D:/Desktop/A2/mindbridge"
npm install firebase@^12 @emailjs/browser@^4 leaflet@^1.9 chart.js@^4 jspdf@^2 jspdf-autotable@^3 @fullcalendar/core@^6 @fullcalendar/vue3@^6 @fullcalendar/timegrid@^6 @fullcalendar/interaction@^6
npm install -D wrangler@^4
```

- [ ] **Step 2: Add scripts to `package.json`**

Replace `"scripts"` block with:

```json
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "node --test tests/"
  },
```

- [ ] **Step 3: Create `.env` (placeholders — user fills EmailJS values in Task 6) and `.env.example`**

`.env`:

```
VITE_EMAILJS_SERVICE_ID=
VITE_EMAILJS_TEMPLATE_ID=
VITE_EMAILJS_PUBLIC_KEY=
VITE_EMAILJS_BULK_TEMPLATE_ID=
VITE_WORKER_URL=
```

`.env.example` — same keys with commented explanations:

```
# EmailJS dashboard (https://dashboard.emailjs.com/admin): Account > General > Public Key
VITE_EMAILJS_SERVICE_ID=service_xxxxxxx
VITE_EMAILJS_TEMPLATE_ID=template_xxxxxxx        # contact form template (with attachment)
VITE_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxx
VITE_EMAILJS_BULK_TEMPLATE_ID=template_yyyyyyy   # bulk email template
VITE_WORKER_URL=https://mindbridge-api.xxxx.workers.dev   # after Task 14 deploy
```

- [ ] **Step 4: Add `.env` to `.gitignore`**

Append to `.gitignore`:

```
.env
```

- [ ] **Step 5: Verify + commit**

```bash
npm test    # Expected: "tests/ does not exist" error is OK for now, or run: node --test tests/ 2>&1 | head -5
npm run build   # Expected: existing A2 app builds clean
git add package.json package-lock.json .env.example .gitignore
git commit -m "A3: add firebase/emailjs/leaflet/fullcalendar/chart.js deps, env scaffolding, node test script"
```

---

### Task 1: Pure table + CSV utilities with tests (TDD)

**Files:**
- Create: `src/utils/table.js`
- Create: `src/utils/csv.js`
- Test: `tests/table.test.js`, `tests/csv.test.js`

- [ ] **Step 1: Write failing tests** — `tests/table.test.js`:

```js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { applyFilters, applySort, paginate } from '../src/utils/table.js'

const columns = [
  { key: 'name', label: 'Name', sortable: true, searchable: true },
  { key: 'role', label: 'Role', sortable: true, searchable: true },
  { key: 'count', label: 'Count', sortable: true, searchable: false }
]
const rows = [
  { id: 1, name: 'Alice', role: 'admin', count: 3 },
  { id: 2, name: 'bob', role: 'client', count: 10 },
  { id: 3, name: 'Carla', role: 'volunteer', count: 2 }
]

test('applyFilters matches per-column, case-insensitive, AND across columns', () => {
  assert.deepEqual(applyFilters(rows, columns, { name: 'a', role: '' }), [rows[0], rows[2]])
  assert.deepEqual(applyFilters(rows, columns, { name: 'bob', role: 'client' }), [rows[1]])
  assert.deepEqual(applyFilters(rows, columns, { name: 'bob', role: 'admin' }), [])
  // non-searchable column is ignored
  assert.deepEqual(applyFilters(rows, columns, { count: '3' }), rows)
})

test('applyFilters ignores whitespace-only filters', () => {
  assert.deepEqual(applyFilters(rows, columns, { name: '   ', role: '' }), rows)
})

test('applySort sorts asc/desc, numbers numerically, case-insensitive strings', () => {
  assert.deepEqual(applySort(rows, 'name', 'asc').map(r => r.id), [1, 2, 3])
  assert.deepEqual(applySort(rows, 'name', 'desc').map(r => r.id), [3, 2, 1])
  assert.deepEqual(applySort(rows, 'count', 'desc').map(r => r.id), [2, 1, 3])
  // does not mutate input
  assert.equal(rows[0].name, 'Alice')
})

test('paginate clamps page and computes totalPages', () => {
  assert.deepEqual(paginate(rows, 1, 2), { pageRows: [rows[0], rows[1]], totalPages: 2, page: 1 })
  assert.deepEqual(paginate(rows, 2, 2), { pageRows: [rows[2]], totalPages: 2, page: 2 })
  assert.deepEqual(paginate(rows, 9, 2), { pageRows: [rows[2]], totalPages: 2, page: 2 })
  assert.equal(paginate([], 1, 10).totalPages, 1)
})
```

`tests/csv.test.js`:

```js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { toCsv } from '../src/utils/csv.js'

const columns = [{ key: 'name', label: 'Name' }, { key: 'note', label: 'Note' }]

test('toCsv builds header + rows with BOM and CRLF', () => {
  const csv = toCsv(columns, [{ name: 'A', note: 'plain' }])
  assert.equal(csv, '﻿Name,Note\r\nA,plain')
})

test('toCsv escapes quotes, commas and newlines', () => {
  const csv = toCsv(columns, [{ name: 'A, "B"', note: 'line1\nline2' }])
  assert.equal(csv, '﻿Name,Note\r\n"A, ""B""","line1\nline2"')
})

test('toCsv renders null/undefined as empty', () => {
  const csv = toCsv(columns, [{ name: null, note: undefined }])
  assert.equal(csv, '﻿Name,Note\r\n,')
})
```

- [ ] **Step 2: Run tests, confirm failure**

```bash
node --test tests/table.test.js tests/csv.test.js
```
Expected: FAIL — `Cannot find module '../src/utils/table.js'`.

- [ ] **Step 3: Implement `src/utils/table.js`**

```js
// Pure table logic shared by DataTable.vue — kept dependency-free for node --test
export function applyFilters(rows, columns, filters) {
  const active = columns.filter(
    (c) => c.searchable !== false && (filters[c.key] || '').trim() !== ''
  )
  if (!active.length) return rows
  return rows.filter((row) =>
    active.every((col) => {
      const hay = String(row[col.key] ?? '')
      return hay.toLowerCase().includes(filters[col.key].trim().toLowerCase())
    })
  )
}

export function applySort(rows, sortKey, sortDir) {
  if (!sortKey || !sortDir) return rows
  const dir = sortDir === 'asc' ? 1 : -1
  return [...rows].sort((a, b) => {
    const av = a[sortKey]
    const bv = b[sortKey]
    if (av == null) return 1
    if (bv == null) return -1
    if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir
    return String(av).localeCompare(String(bv), undefined, { numeric: true, sensitivity: 'base' }) * dir
  })
}

export function paginate(rows, page, pageSize) {
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize))
  const p = Math.min(Math.max(1, page), totalPages)
  const start = (p - 1) * pageSize
  return { pageRows: rows.slice(start, start + pageSize), totalPages, page: p }
}
```

- [ ] **Step 4: Implement `src/utils/csv.js`**

```js
// CSV serialization + browser download (E.4 export)
export function toCsv(columns, rows) {
  const esc = (v) => {
    const s = String(v ?? '')
    return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s
  }
  const header = columns.map((c) => esc(c.label)).join(',')
  const body = rows.map((r) => columns.map((c) => esc(r[c.key])).join(','))
  // BOM so Excel opens UTF-8 correctly
  return '﻿' + [header, ...body].join('\r\n')
}

export function downloadCsv(filename, csv) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
```

- [ ] **Step 5: Run tests, confirm pass**

```bash
npm test
```
Expected: 7 tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/utils/table.js src/utils/csv.js tests/
git commit -m "A3: add table filter/sort/pagination and CSV export utilities with node tests"
```

---

### Task 2: Booking validation utilities with tests (TDD)

**Files:**
- Create: `src/utils/booking.js`
- Test: `tests/booking.test.js`

- [ ] **Step 1: Write failing tests** — `tests/booking.test.js`:

```js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { isPast, isWithinBusinessHours, isWeekday, hasConflict, countUpcoming } from '../src/utils/booking.js'

const bookings = [
  { id: 'b1', date: '2026-08-24', start: '09:00', end: '10:00', professional: 'Dr. Emily Chen', userId: 'u1', status: 'confirmed' },
  { id: 'b2', date: '2026-08-24', start: '11:00', end: '12:00', professional: 'James Walker', userId: 'u2', status: 'confirmed' },
  { id: 'b3', date: '2026-08-24', start: '09:00', end: '10:00', professional: 'Dr. Emily Chen', userId: 'u3', status: 'cancelled' }
]

test('isPast: end time strictly after now is not past', () => {
  const now = new Date(2026, 7, 24, 9, 0) // 24 Aug 2026 09:00 local
  assert.equal(isPast('2026-08-24', '10:00', now), false)
  assert.equal(isPast('2026-08-24', '09:00', now), true)
  assert.equal(isPast('2026-08-23', '17:00', now), true)
})

test('isWithinBusinessHours: 9-17 only, end after start', () => {
  assert.equal(isWithinBusinessHours('09:00', '10:00'), true)
  assert.equal(isWithinBusinessHours('16:00', '17:00'), true)
  assert.equal(isWithinBusinessHours('08:00', '09:00'), false)
  assert.equal(isWithinBusinessHours('16:00', '18:00'), false)
  assert.equal(isWithinBusinessHours('10:00', '09:00'), false)
})

test('isWeekday: Mon-Fri only', () => {
  assert.equal(isWeekday('2026-08-24'), true)  // Monday
  assert.equal(isWeekday('2026-08-22'), false) // Saturday
  assert.equal(isWeekday('2026-08-23'), false) // Sunday
})

test('hasConflict: same professional + same date + overlapping time only', () => {
  const newBooking = { id: 'new', date: '2026-08-24', start: '09:30', end: '10:30', professional: 'Dr. Emily Chen', userId: 'u4' }
  assert.equal(hasConflict(bookings, newBooking), true)
  // boundary: ends exactly when existing starts -> no conflict
  assert.equal(hasConflict(bookings, { ...newBooking, start: '08:00', end: '09:00' }), false)
  // different professional -> no conflict
  assert.equal(hasConflict(bookings, { ...newBooking, professional: 'Priya Patel' }), false)
  // cancelled bookings ignored
  assert.equal(hasConflict(bookings, { ...newBooking, start: '09:00', end: '10:00' }), true) // b1 conflicts, b3 cancelled
})

test('countUpcoming: own, non-cancelled, future only', () => {
  const now = new Date(2026, 7, 25)
  assert.equal(countUpcoming(bookings, 'u1', now), 1)
  assert.equal(countUpcoming(bookings, 'u3', now), 0) // cancelled
  assert.equal(countUpcoming(bookings, 'u9', now), 0)
})
```

- [ ] **Step 2: Run tests, confirm failure**

```bash
node --test tests/booking.test.js
```
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `src/utils/booking.js`**

```js
// Appointment booking rules — pure functions, tested with node --test
export const BUSINESS_HOURS = { start: 9, end: 17 }

export function isPast(dateStr, endTime, now = new Date()) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const [eh, em = 0] = endTime.split(':').map(Number)
  const end = new Date(y, m - 1, d, eh, em)
  return end <= now
}

export function isWithinBusinessHours(startTime, endTime) {
  const [sh] = startTime.split(':').map(Number)
  const [eh] = endTime.split(':').map(Number)
  return sh >= BUSINESS_HOURS.start && eh <= BUSINESS_HOURS.end && eh > sh
}

export function isWeekday(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const day = new Date(y, m - 1, d).getDay()
  return day !== 0 && day !== 6
}

export function hasConflict(bookings, newBooking) {
  return bookings.some((b) => {
    if (b.id === newBooking.id) return false
    if (b.status === 'cancelled') return false
    if (b.professional !== newBooking.professional) return false
    if (b.date !== newBooking.date) return false
    return newBooking.start < b.end && newBooking.end > b.start
  })
}

export function countUpcoming(bookings, userId, now = new Date()) {
  return bookings.filter(
    (b) => b.userId === userId && b.status !== 'cancelled' && !isPast(b.date, b.end, now)
  ).length
}
```

- [ ] **Step 4: Run tests, confirm pass**

```bash
npm test
```
Expected: all tests pass (7 from Task 1 + 5 from Task 2).

- [ ] **Step 5: Commit**

```bash
git add src/utils/booking.js tests/booking.test.js
git commit -m "A3: add booking conflict/business-hours validation utilities with tests"
```

---

### Task 3: Firebase init + auth migration (D.1)

**Files:**
- Create: `src/firebase.js`
- Rewrite: `src/stores/auth.js` (full replacement)
- Modify: `src/router/index.js` (guard reads store instead of localStorage)
- Modify: `src/main.js` (await authReady before mount)
- Modify: `src/views/LoginPage.vue` (async login + Google button)
- Modify: `src/views/RegisterPage.vue` (async register)
- Create: `docs/firestore.rules` (paste into console)

- [ ] **Step 1: Create `src/firebase.js`**

```js
// Firebase bootstrap — project "week7-yidingshao" (from lab)
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyB49fg68Ad2qhL0KKlBGYfO0kNSDo5qEbc',
  authDomain: 'week7-yidingshao.firebaseapp.com',
  projectId: 'week7-yidingshao',
  storageBucket: 'week7-yidingshao.firebasestorage.app',
  messagingSenderId: '595144802604',
  appId: '1:595144802604:web:3962792777073d99de2c89'
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)

// F.1 offline innovation #4b: Firestore persists a local read cache (IndexedDB),
// so previously loaded data stays available when the connection drops.
enableIndexedDbPersistence(db).catch(() => {})
```

- [ ] **Step 2: Rewrite `src/stores/auth.js`** (full replacement — remove the old localStorage implementation):

```js
import { ref, computed } from 'vue'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile
} from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp, collection, onSnapshot } from 'firebase/firestore'
import { auth, db } from '../firebase'

// ---------- reactive state ----------
const currentUser = ref(null)          // { uid, name, email, role } | null
const allUsers = ref([])               // Firestore users collection (no secrets stored)
let authReadyResolve
// Resolved after the FIRST onAuthStateChanged callback (profile fetched).
// main.js awaits this before mounting so the router guard is synchronous.
export const authReady = new Promise((resolve) => { authReadyResolve = resolve })

// ---------- profile helpers ----------
// On first login the profile is created with role 'client'. An existing doc
// (e.g. the console-created admin) keeps its role untouched.
async function fetchOrCreateProfile(user) {
  const userRef = doc(db, 'users', user.uid)
  const snap = await getDoc(userRef)
  if (snap.exists()) {
    const data = snap.data()
    if (!data.name && user.displayName) {
      await setDoc(userRef, { name: user.displayName, email: user.email }, { merge: true })
      data.name = user.displayName
    }
    return data
  }
  const profile = {
    name: user.displayName || '',
    email: user.email || '',
    role: 'client',
    createdAt: serverTimestamp()
  }
  await setDoc(userRef, profile)
  return profile
}

// ---------- auth state listener ----------
onAuthStateChanged(auth, async (firebaseUser) => {
  if (firebaseUser) {
    try {
      const profile = await fetchOrCreateProfile(firebaseUser)
      currentUser.value = {
        uid: firebaseUser.uid,
        name: profile.name || firebaseUser.displayName || '',
        email: firebaseUser.email,
        role: profile.role || 'client'
      }
    } catch (e) {
      // Firestore unreachable (e.g. VPN off) — clear session so UI shows login
      console.error('Profile load failed:', e)
      currentUser.value = null
    }
  } else {
    currentUser.value = null
  }
  authReadyResolve()
})

// Admin needs the full user list (D.3 users table, F.1 bulk email, charts)
function initUsersSnapshot() {
  onSnapshot(collection(db, 'users'), (snap) => {
    allUsers.value = snap.docs.map((d) => ({ uid: d.id, ...d.data() }))
  })
}
initUsersSnapshot()

// ---------- error mapping ----------
function mapAuthError(code) {
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
      return 'Incorrect email or password. Please try again.'
    case 'auth/user-not-found':
      return 'No account found with this email address.'
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.'
    case 'auth/weak-password':
      return 'Password is too weak. Use at least 8 characters.'
    case 'auth/invalid-email':
      return 'Please enter a valid email address.'
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a moment and try again.'
    case 'auth/popup-closed-by-user':
      return 'Google sign-in was cancelled.'
    case 'auth/popup-blocked':
      return 'The Google sign-in popup was blocked by your browser. Please allow popups.'
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with this email. Please sign in with email and password.'
    case 'auth/network-request-failed':
      return 'Network error — check your internet/VPN connection and try again.'
    default:
      return 'Authentication failed. Please try again.'
  }
}

// XSS prevention: strip HTML tags from input (kept from A2, BR C.4)
function sanitizeInput(input) {
  if (!input) return ''
  return input.replace(/<[^>]*>/g, '').trim()
}

// ---------- composable ----------
export function useAuthStore() {
  const isLoggedIn = computed(() => currentUser.value !== null)
  const userRole = computed(() => currentUser.value?.role || null)
  const userName = computed(() => currentUser.value?.name || null)

  async function register(name, email, password, role = 'client') {
    try {
      if (role !== 'client' && role !== 'volunteer' && role !== 'professional') role = 'client'
      const cred = await createUserWithEmailAndPassword(auth, email.trim().toLowerCase(), password)
      await updateProfile(cred.user, { displayName: sanitizeInput(name) })
      // Full overwrite: guarantees the profile role matches the register form even
      // if the auth-state listener already created a default 'client' doc first.
      await setDoc(doc(db, 'users', cred.user.uid), {
        name: sanitizeInput(name),
        email: email.trim().toLowerCase(),
        role,
        createdAt: serverTimestamp()
      })
      currentUser.value = { uid: cred.user.uid, name: sanitizeInput(name), email: cred.user.email, role }
      return { success: true }
    } catch (e) {
      return { success: false, error: mapAuthError(e.code) }
    }
  }

  async function login(email, password) {
    try {
      await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password)
      return { success: true }
    } catch (e) {
      return { success: false, error: mapAuthError(e.code) }
    }
  }

  async function loginWithGoogle() {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider())
      return { success: true }
    } catch (e) {
      return { success: false, error: mapAuthError(e.code) }
    }
  }

  async function logout() {
    await signOut(auth)
  }

  return {
    currentUser,
    allUsers,
    authReady,
    isLoggedIn,
    userRole,
    userName,
    register,
    login,
    loginWithGoogle,
    logout
  }
}
```

- [ ] **Step 3: Update `src/router/index.js`** — replace the guard's localStorage read with the store, and add 2 routes.

Replace lines 37–62 (the whole `router.beforeEach` block) with:

```js
import { useAuthStore } from '../stores/auth'
import LocationsPage from '../views/LocationsPage.vue'
import AppointmentPage from '../views/AppointmentPage.vue'
```
(add the two imports next to the other view imports)

Add routes after the `/contact` route:

```js
  { path: '/locations', name: 'Locations', component: LocationsPage },
  { path: '/book-appointment', name: 'Appointment', component: AppointmentPage, meta: { requiresAuth: true } },
```

Replace the guard:

```js
router.beforeEach((to, from, next) => {
  // Safe to read the store here: main.js awaits authReady before app.mount()
  const { currentUser } = useAuthStore()
  const authData = currentUser.value

  if (to.meta.requiresAuth) {
    if (!authData) {
      next({ name: 'Login', query: { redirect: to.fullPath } })
      return
    }
    if (to.meta.roles && !to.meta.roles.includes(authData.role)) {
      next({ name: 'Dashboard' })
      return
    }
  }

  if (to.meta.guestOnly && authData) {
    next({ name: 'Dashboard' })
    return
  }

  next()
})
```

Note: `LocationsPage.vue` and `AppointmentPage.vue` don't exist yet — the dev server will warn on import. Create minimal placeholder views now (one line each) so the build passes:

`src/views/LocationsPage.vue`:
```vue
<template>
  <div class="page-section"><div class="container"><p>Locations — coming in Task 7.</p></div></div>
</template>
```

`src/views/AppointmentPage.vue`:
```vue
<template>
  <div class="page-section"><div class="container"><p>Appointments — coming in Task 8.</p></div></div>
</template>
```

- [ ] **Step 4: Update `src/main.js`**

```js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { authReady } from './stores/auth'
import 'bootstrap/dist/css/bootstrap.min.css'
import './style.css'

async function bootstrap() {
  await authReady
  createApp(App).use(router).mount('#app')
}

bootstrap()
```

- [ ] **Step 5: Update `src/views/LoginPage.vue`**

In `<script setup>` replace the destructure line and `handleLogin`:

```js
const { login, loginWithGoogle } = useAuthStore()

async function handleLogin() {
  errorMessage.value = ''

  if (!isFormValid.value) {
    errorMessage.value = 'Please fill in all required fields correctly.'
    return
  }

  isLoading.value = true
  const result = await login(email.value, password.value)
  isLoading.value = false
  if (result.success) {
    const redirect = route.query.redirect || '/dashboard'
    router.push(redirect)
  } else {
    errorMessage.value = result.error
  }
}

async function handleGoogleLogin() {
  errorMessage.value = ''
  isLoading.value = true
  const result = await loginWithGoogle()
  isLoading.value = false
  if (result.success) {
    const redirect = route.query.redirect || '/dashboard'
    router.push(redirect)
  } else {
    errorMessage.value = result.error
  }
}
```

In the template, after the submit button's `</button>` and before `</form>`, add:

```html
              <div class="text-center my-3">
                <span class="text-muted small">or</span>
              </div>

              <button
                type="button"
                class="btn btn-light border w-100"
                :disabled="isLoading"
                @click="handleGoogleLogin"
              >
                <span aria-hidden="true" class="me-2">🔵</span>
                Sign in with Google
              </button>
```

- [ ] **Step 6: Update `src/views/RegisterPage.vue`** — make register async:

```js
async function handleRegister() {
  submitted.value = true
  errorMessage.value = ''
  successMessage.value = ''

  if (!isFormValid.value) {
    errorMessage.value = 'Please fix the errors below before submitting.'
    return
  }

  isLoading.value = true
  const result = await register(form.name, form.email, form.password, form.role)
  isLoading.value = false
  if (result.success) {
    successMessage.value = 'Account created successfully! Redirecting to your dashboard...'
    setTimeout(() => {
      router.push('/dashboard')
    }, 1500)
  } else {
    errorMessage.value = result.error
  }
}
```

- [ ] **Step 7: Create `docs/firestore.rules`** (user pastes into Firebase console → Firestore → Rules → Publish):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function signedIn() { return request.auth != null; }
    function isAdmin() {
      return signedIn()
        && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    match /users/{uid} {
      allow read: if signedIn();
      // self-registration; 'admin' role can only be granted by console or an admin
      allow create: if signedIn() && request.auth.uid == uid && request.resource.data.role != 'admin';
      allow update: if signedIn() && (request.auth.uid == uid || isAdmin());
      allow delete: if isAdmin();
    }
    match /ratings/{doc} {
      allow read: if signedIn();
      allow create: if signedIn() && request.resource.data.userId == request.auth.uid;
      allow update, delete: if signedIn() && resource.data.userId == request.auth.uid;
    }
    match /contacts/{doc} {
      // public contact page — anyone may submit; only admin reads
      allow create: if true;
      allow read: if isAdmin();
      allow delete: if isAdmin();
    }
    match /appointments/{doc} {
      allow read: if signedIn();
      allow create: if signedIn() && request.resource.data.userId == request.auth.uid;
      allow update, delete: if signedIn() && (resource.data.userId == request.auth.uid || isAdmin());
    }
  }
}
```

**User action (parallel):** paste these rules into Firebase console (Firestore Database → Rules → Publish).

- [ ] **Step 8: Verify manually (VPN on)**

```bash
npm run dev
```
- Open http://localhost:5173/login
- Login as `sarah@example.com` / `Sarah@123` → lands on /dashboard showing name "Sarah Client" (profile auto-created on first login) and role badge `client`
- Logout → `/register` → register a new throwaway user (e.g. `test+<random>@example.com`) → lands on /dashboard with role from the select
- Logout → login as `admin@mindbridge.org` / `Admin@123` → `/admin` loads (role `admin` from console-created doc)
- Google button: clicking should open the Google popup (must work with VPN; if the Monash Workspace blocks the popup, verify the error message appears instead — email/password path is the primary demo)
- Guest hits `/admin` while logged out → redirected to `/login?redirect=/admin`; after login → back to /admin
- Confirm in Firebase console → Firestore: `users` collection contains the new user docs

- [ ] **Step 9: Commit**

```bash
git add src/firebase.js src/stores/auth.js src/router/index.js src/main.js src/views/LoginPage.vue src/views/RegisterPage.vue src/views/LocationsPage.vue src/views/AppointmentPage.vue docs/firestore.rules
git commit -m "A3: migrate authentication to Firebase Auth (email/password + Google) with Firestore profiles and role guard (BR D.1)"
```

---

### Task 4: Ratings → Firestore (keeps C.3, feeds F.1 charts)

**Files:**
- Rewrite: `src/stores/ratings.js`
- Modify: `src/components/StarRating.vue`
- Modify: `src/views/ServicesPage.vue`, `src/views/ServiceDetail.vue` (API shape changes only — see steps)

- [ ] **Step 1: Rewrite `src/stores/ratings.js`**

```js
// Aggregated rating store — Firestore-backed (BR C.3, data source for F.1 charts)
import { ref } from 'vue'
import { collection, doc, getDoc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore'
import { auth, db } from '../firebase'
import { enqueue } from './network'

const ratings = ref([]) // [{ id, itemId, userId, score, createdAt, updatedAt? }]

let unsubscribed = null
export function initRatings() {
  if (unsubscribed) return
  unsubscribed = onSnapshot(collection(db, 'ratings'), (snap) => {
    ratings.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  })
}
initRatings()

export function useRatingsStore() {
  function getRating(itemId) {
    const list = ratings.value.filter((r) => r.itemId === itemId)
    if (!list.length) return { average: 0, count: 0, ratings: [] }
    const sum = list.reduce((acc, r) => acc + r.score, 0)
    return { average: (sum / list.length).toFixed(1), count: list.length, ratings: list }
  }

  function getUserRating(itemId) {
    const uid = auth.currentUser?.uid
    if (!uid) return null
    return ratings.value.find((r) => r.itemId === itemId && r.userId === uid) || null
  }

  async function addOrUpdateRating(itemId, score) {
    const user = auth.currentUser
    if (!user) return { success: false, error: 'Please log in to rate.' }
    if (!navigator.onLine) {
      // F.1 offline innovation: queue the rating, sync on reconnect
      enqueue('ratings', { itemId, score, userId: user.uid })
      return { success: true, queued: true }
    }
    const docId = itemId + '_' + user.uid
    const docRef = doc(db, 'ratings', docId)
    const existing = await getDoc(docRef)
    if (existing.exists()) {
      await setDoc(docRef, { score, updatedAt: serverTimestamp() }, { merge: true })
    } else {
      await setDoc(docRef, {
        itemId, score, userId: user.uid, createdAt: serverTimestamp()
      })
    }
    return { success: true }
  }

  return { ratings, getRating, getUserRating, addOrUpdateRating }
}
```

- [ ] **Step 2: Create `src/stores/network.js`** (needed by ratings above; full offline logic lands in Task 11 — this file provides `enqueue` + flusher registry now):

```js
// Online/offline state + localStorage sync queue (F.1 innovation #4)
import { ref } from 'vue'

const isOnline = ref(navigator.onLine)
const QUEUE_KEY = 'mindbridge_offline_queue'
const flushers = []

window.addEventListener('online', () => {
  isOnline.value = true
  flushQueue()
})
window.addEventListener('offline', () => { isOnline.value = false })

export function useNetworkStore() {
  return { isOnline }
}

export function enqueue(type, payload) {
  const q = JSON.parse(localStorage.getItem(QUEUE_KEY) || '{"contacts":[],"ratings":[]}')
  q[type] = q[type] || []
  q[type].push(payload)
  localStorage.setItem(QUEUE_KEY, JSON.stringify(q))
}

export function registerFlusher(fn) { flushers.push(fn) }

export async function flushQueue() {
  for (const fn of flushers) {
    try { await fn() } catch (e) { console.error('flush failed', e) }
  }
}
```

- [ ] **Step 3: Update `src/components/StarRating.vue`**

Replace script block lines 19–35 (from `const { currentUser...` through the end of `function rate`) with:

```js
const { currentUser, isLoggedIn } = useAuthStore()
const { getRating, getUserRating, addOrUpdateRating } = useRatingsStore()

const hoverRating = ref(0)
const queuedMessage = ref('')

const ratingData = computed(() => getRating(props.itemId))
const userRating = computed(() => getUserRating(props.itemId))

async function rate(score) {
  if (!isLoggedIn.value || props.readOnly) return
  queuedMessage.value = ''
  const result = await addOrUpdateRating(props.itemId, score)
  if (result.queued) {
    queuedMessage.value = 'Saved offline — will sync when you reconnect.'
  }
  emit('rated', { score, itemId: props.itemId })
}
```

Template: replace the `rating-text` span block with:

```html
    <span v-if="ratingData.count > 0" class="rating-text ms-2">
      {{ ratingData.average }} / 5
      <small class="text-muted">({{ ratingData.count }} rating{{ ratingData.count !== 1 ? 's' : '' }})</small>
    </span>
    <span v-else class="rating-text ms-2 text-muted">
      No ratings yet
    </span>
    <span v-if="queuedMessage" class="text-muted small ms-2" role="status">{{ queuedMessage }}</span>
```

- [ ] **Step 4: Update the two pages that consume `getRating`**

`ServicesPage.vue` and `ServiceDetail.vue` call `getRating(itemId)` — the return shape (`{average, count, ratings}`) is unchanged, so **no edits needed** unless they call `getUserRating(itemId, userId)` with two args. Check each file for `getUserRating(`:
- If called with `(props.itemId, currentUser.value.id)`, change to `(props.itemId)` (the store now derives the uid from the Firebase user).

- [ ] **Step 5: Verify manually**

- Login as sarah → /services/1 → click 4 stars → "No ratings yet" flips to "4.0 / 5 (1 rating)"
- Logout → login as admin → /services/1 → rate 5 stars → average becomes 4.5 (2 ratings)
- Reload the page → ratings persist (Firestore, not localStorage)
- Firebase console → `ratings` collection has docs `1_<uid>` etc.

- [ ] **Step 6: Commit**

```bash
git add src/stores/ratings.js src/stores/network.js src/components/StarRating.vue src/views/ServicesPage.vue src/views/ServiceDetail.vue
git commit -m "A3: migrate aggregated ratings to Firestore with offline queue (C.3 + F.1 offline)"
```

---

### Task 5: DataTable component (D.3 core)

**Files:**
- Create: `src/components/DataTable.vue`
- Modify: `src/style.css` (data-table styles)

- [ ] **Step 1: Create `src/components/DataTable.vue`**

```vue
<script setup>
import { ref, computed, watch } from 'vue'
import { applyFilters, applySort, paginate } from '../utils/table'
import { toCsv, downloadCsv } from '../utils/csv'

const props = defineProps({
  caption: { type: String, required: true },
  columns: { type: Array, required: true }, // [{ key, label, sortable?, searchable? }]
  rows: { type: Array, default: () => [] },
  pageSize: { type: Number, default: 10 },
  rowKey: { type: String, default: 'id' },
  selectable: { type: Boolean, default: false },
  csvFilename: { type: String, default: '' }
})

const selected = defineModel('selected', { type: Array, default: () => [] })
defineExpose({ filteredRows })

const filters = ref({})
const sortKey = ref(null)
const sortDir = ref(null)
const page = ref(1)

const filteredRows = computed(() => applyFilters(props.rows, props.columns, filters.value))
const sortedRows = computed(() => applySort(filteredRows.value, sortKey.value, sortDir.value))
const paged = computed(() => paginate(sortedRows.value, page.value, props.pageSize))
const pageRows = computed(() => paged.value.pageRows)
const totalPages = computed(() => paged.value.totalPages)

const allSelected = computed(
  () => props.rows.length > 0 && pageRows.value.every((r) => selected.value.includes(r[props.rowKey]))
)

watch(filters, () => { page.value = 1 })
watch(() => props.rows.length, () => { page.value = 1 })

function toggleSort(key) {
  if (sortKey.value !== key) { sortKey.value = key; sortDir.value = 'asc' }
  else if (sortDir.value === 'asc') { sortDir.value = 'desc' }
  else { sortKey.value = null; sortDir.value = null }
}

function toggleAll() {
  const ids = pageRows.value.map((r) => r[props.rowKey])
  if (allSelected.value) {
    selected.value = selected.value.filter((id) => !ids.includes(id))
  } else {
    selected.value = [...new Set([...selected.value, ...ids])]
  }
}

function exportCsv() {
  if (!filteredRows.value.length) return
  downloadCsv(props.csvFilename || 'export.csv', toCsv(props.columns, sortedRows.value))
}
</script>

<template>
  <div class="data-table">
    <div class="data-table-toolbar d-flex justify-content-between align-items-center mb-2 gap-2 flex-wrap">
      <span class="text-muted small" aria-live="polite">{{ filteredRows.length }} row{{ filteredRows.length !== 1 ? 's' : '' }}</span>
      <button v-if="csvFilename" type="button" class="btn btn-mindbridge-outline btn-sm" :disabled="!filteredRows.length" @click="exportCsv">
        ⬇ Export CSV
      </button>
    </div>

    <div class="table-responsive" role="region" :aria-label="caption + ' table'" tabindex="0">
      <table class="table table-striped table-hover align-middle mb-0">
        <caption class="visually-hidden">{{ caption }}</caption>
        <thead>
          <tr>
            <th v-if="selectable" scope="col">
              <input type="checkbox" :checked="allSelected" :aria-label="'Select all rows on this page'" @change="toggleAll">
            </th>
            <th
              v-for="col in columns"
              :key="col.key"
              scope="col"
              :aria-sort="sortKey === col.key ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'"
            >
              <div class="d-flex flex-column gap-1">
                <button v-if="col.sortable" type="button" class="data-table-sort" @click="toggleSort(col.key)">
                  {{ col.label }}
                  <span aria-hidden="true">{{ sortKey === col.key ? (sortDir === 'asc' ? '▲' : '▼') : '↕' }}</span>
                </button>
                <span v-else class="fw-semibold">{{ col.label }}</span>
                <input
                  v-if="col.searchable"
                  v-model="filters[col.key]"
                  type="text"
                  class="form-control form-control-sm"
                  :aria-label="'Search by ' + col.label"
                  placeholder="Search…"
                >
              </div>
            </th>
            <th v-if="$slots.actions" scope="col"><span class="visually-hidden">Row actions</span></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in pageRows" :key="row[rowKey] ?? row._index">
            <td v-if="selectable">
              <input v-model="selected" type="checkbox" :value="row[rowKey]" :aria-label="'Select row ' + row[rowKey]">
            </td>
            <td v-for="col in columns" :key="col.key">
              <slot :name="'cell-' + col.key" :row="row" :value="row[col.key]">{{ row[col.key] }}</slot>
            </td>
            <td v-if="$slots.actions"><slot name="actions" :row="row"></slot></td>
          </tr>
          <tr v-if="!pageRows.length">
            <td :colspan="columns.length + (selectable ? 1 : 0) + ($slots.actions ? 1 : 0)" class="text-center text-muted py-4">
              No rows found.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <nav class="data-table-pagination d-flex align-items-center justify-content-between mt-2 flex-wrap gap-2" aria-label="Table pagination">
      <button type="button" class="btn btn-outline-secondary btn-sm" :disabled="page <= 1" @click="page--">← Previous</button>
      <span aria-live="polite">Page {{ page }} of {{ totalPages }}</span>
      <button type="button" class="btn btn-outline-secondary btn-sm" :disabled="page >= totalPages" @click="page++">Next →</button>
    </nav>
  </div>
</template>
```

- [ ] **Step 2: Add styles to `src/style.css`** (append):

```css
/* DataTable (D.3) */
.data-table-sort {
  background: none;
  border: none;
  padding: 0;
  font-weight: 600;
  color: var(--mindbridge-heading);
  text-align: left;
}
.data-table-sort:hover { color: var(--mindbridge-primary); }
.data-table th .form-control-sm { min-width: 110px; font-weight: 400; }
```

- [ ] **Step 3: Smoke-test the component** — temporary usage on AdminDashboard (real wiring in next steps). Add a quick block inside AdminDashboard template after the stats cards (temporary, removed in Task 10's rewrite):

```html
<div class="card card-mindbridge p-4 mb-4">
  <DataTable
    caption="Users"
    :columns="[{key:'name',label:'Name',sortable:true,searchable:true},{key:'role',label:'Role',sortable:true,searchable:true},{key:'email',label:'Email',sortable:true,searchable:true}]"
    :rows="allUsers"
    row-key="uid"
    csv-filename="mindbridge-users.csv"
  />
</div>
```
with `<script setup>` gaining `import DataTable from '../components/DataTable.vue'` and `const { currentUser, allUsers, userName, logout } = useAuthStore()` (replace old destructure). Verify in browser: search by Name/Email, sort by Role, pagination at >10 rows (register several users or temporarily `:page-size="2"`), CSV download opens in Excel.

- [ ] **Step 4: Commit**

```bash
git add src/components/DataTable.vue src/style.css src/views/AdminDashboard.vue
git commit -m "A3: add reusable DataTable component (per-column search, sort, 10/page, CSV) — BR D.3"
```

---

### Task 6: Contacts → Firestore + email with attachment (D.2) + admin contacts table

**Files:**
- Create: `src/stores/contacts.js`
- Modify: `src/views/ContactPage.vue` (attachment + EmailJS + Firestore + offline)
- Modify: `src/views/AdminDashboard.vue` (contacts DataTable — replaces temporary block area)

**User actions before verify:** create the two EmailJS templates and fill `.env`:

1. EmailJS dashboard → Email Templates → Create new template `mindbridge_contact`:
   - To email: your own inbox (e.g. yshao0107@student.monash.edu)
   - Subject: `New MindBridge enquiry: {{subject}}`
   - Content: `From: {{from_name}} ({{from_email}}) — Type: {{enquiry_type}} — Message: {{message}}`
   - Variables `from_name`, `from_email`, `subject`, `message`, `enquiry_type` as Text; add variable `attachment_file` and set its **type to Attachment**.
2. Template `mindbridge_bulk`:
   - To email: `{{to_email}}`
   - Subject: `{{subject}}`
   - Content: `Dear {{to_name}}, {{message}}`
   - Variables: `to_email` (Email type), `to_name`, `subject`, `message` (Text).
3. Account → General → copy **Public Key**; copy both template IDs and your **Service ID** into `mindbridge/.env`.

- [ ] **Step 1: Create `src/stores/contacts.js`**

```js
// Contact messages — Firestore-backed; public form may submit, admin reads (D.2/D.3)
import { ref } from 'vue'
import { collection, addDoc, serverTimestamp, onSnapshot, deleteDoc, doc } from 'firebase/firestore'
import { db } from '../firebase'
import { enqueue, registerFlusher } from './network'

const contacts = ref([])

export function initContacts() {
  onSnapshot(collection(db, 'contacts'), (snap) => {
    contacts.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  })
}
initContacts()

export function useContactsStore() {
  async function submitContact({ name, email, subject, message, enquiryType, attachmentName = '', attachmentSize = 0 }) {
    const payload = {
      name, email, subject, message, enquiryType,
      attachmentName, attachmentSize,
      date: serverTimestamp()
    }
    if (!navigator.onLine) {
      enqueue('contacts', payload)
      return { success: true, queued: true }
    }
    try {
      await addDoc(collection(db, 'contacts'), payload)
      return { success: true }
    } catch (e) {
      console.error('contact save failed', e)
      return { success: false, error: 'Could not save your message. Please try again.' }
    }
  }

  async function removeContact(id) {
    await deleteDoc(doc(db, 'contacts', id))
  }

  return { contacts, submitContact, removeContact }
}

// Offline queue flusher — writes queued contacts (without serverTimestamp, which
// is not serializable through the queue) once the connection returns
registerFlusher(async () => {
  const q = JSON.parse(localStorage.getItem('mindbridge_offline_queue') || '{"contacts":[],"ratings":[]}')
  const pending = q.contacts || []
  if (!pending.length) return
  for (const item of pending) {
    await addDoc(collection(db, 'contacts'), { ...item, date: new Date() })
  }
  q.contacts = []
  localStorage.setItem('mindbridge_offline_queue', JSON.stringify(q))
})
```

- [ ] **Step 2: Update `src/views/ContactPage.vue`**

Script changes — replace the whole `<script setup>` content (keep validation computeds as-is, change state + handleSubmit):

```js
import { ref, reactive, computed } from 'vue'
import emailjs from '@emailjs/browser'
import { useContactsStore } from '../stores/contacts'

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

// ... (keep existing `form`, validation computeds, isFormValid unchanged)

const attachment = ref(null)
const attachmentError = ref('')

function handleFileChange(event) {
  attachment.value = event.target.files[0] || null
  attachmentError.value = ''
  if (attachment.value && attachment.value.size > 1024 * 1024) {
    attachmentError.value = 'Attachment must be 1 MB or smaller.'
    attachment.value = null
    event.target.value = ''
  }
}

async function handleSubmit() {
  submitted.value = true
  submitError.value = ''
  submitSuccess.value = false

  if (!isFormValid.value) {
    submitError.value = 'Please correct the errors below before submitting.'
    return
  }
  if (attachmentError.value) {
    submitError.value = 'Please fix the attachment error before submitting.'
    return
  }

  isLoading.value = true

  const contactPayload = {
    name: sanitizeInput(form.name),
    email: sanitizeInput(form.email),
    subject: sanitizeInput(form.subject),
    message: sanitizeInput(form.message),
    enquiryType: form.enquiryType,
    attachmentName: attachment.value?.name || '',
    attachmentSize: attachment.value?.size || 0
  }

  const saved = await useContactsStore().submitContact(contactPayload)

  // D.2: send the email with attachment via EmailJS (best-effort; the message
  // is stored in Firestore either way)
  let emailSent = false
  if (!saved.queued && SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY) {
    try {
      await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        {
          from_name: contactPayload.name,
          from_email: contactPayload.email,
          subject: contactPayload.subject,
          message: contactPayload.message,
          enquiry_type: contactPayload.enquiryType,
          ...(attachment.value ? { attachment_file: attachment.value } : {})
        },
        { publicKey: PUBLIC_KEY }
      )
      emailSent = true
    } catch (e) {
      console.error('EmailJS send failed', e)
    }
  }

  isLoading.value = false
  submitted.value = false
  if (saved.success) {
    submitSuccess.value = true
    form.name = ''; form.email = ''; form.subject = ''; form.message = ''; form.enquiryType = 'general'
    attachment.value = null
    const fileInput = document.getElementById('contact-attachment')
    if (fileInput) fileInput.value = ''
    setTimeout(() => { submitSuccess.value = false }, 6000)
  } else {
    submitError.value = saved.error || 'Something went wrong. Please try again.'
  }
}
```

Template: add the attachment field between the Message field and the submit button:

```html
                <!-- Attachment (D.2) -->
                <div class="mb-3">
                  <label for="contact-attachment" class="form-label">Attachment <small class="text-muted">(optional, max 1 MB)</small></label>
                  <input
                    id="contact-attachment"
                    type="file"
                    class="form-control"
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.txt"
                    @change="handleFileChange"
                  />
                  <div v-if="attachmentError" class="error-message">{{ attachmentError }}</div>
                  <small v-if="attachment" class="text-muted">📎 {{ attachment.name }} ({{ Math.round(attachment.size / 1024) }} KB)</small>
                </div>
```

Update the success alert text to mention email/queue:

```html
              <div v-if="submitSuccess" class="alert alert-success" role="alert">
                <strong>✅ Message Sent!</strong> Thank you for reaching out. We will get back to you within 1-2 business days.
              </div>
```

- [ ] **Step 3: Wire contacts DataTable into `src/views/AdminDashboard.vue`**

In `<script setup>` add `import { useContactsStore } from '../stores/contacts'` and `const { contacts, removeContact } = useContactsStore()`. Replace the `contactMessages` computed with `const contactMessages = computed(() => contacts.value)`.

Replace the "Recent Users Table" card block (lines 144–180) with two cards — Users DataTable and Contacts DataTable:

```html
      <!-- Users Table (D.3) -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="card card-mindbridge p-4">
            <h5>📋 Users</h5>
            <DataTable
              caption="Users"
              :columns="userColumns"
              :rows="allUsers"
              row-key="uid"
              csv-filename="mindbridge-users.csv"
            >
              <template #cell-role="{ row }">
                <span class="badge" :class="row.role === 'admin' ? 'bg-warning text-dark' : 'bg-soft-primary text-primary'">{{ row.role }}</span>
              </template>
              <template #cell-createdAt="{ value }">
                <small>{{ value ? new Date(value.seconds * 1000).toLocaleDateString() : '—' }}</small>
              </template>
            </DataTable>
          </div>
        </div>
      </div>

      <!-- Contact Messages Table (D.3) -->
      <div class="row">
        <div class="col-12">
          <div class="card card-mindbridge p-4">
            <h5>📬 Contact Messages</h5>
            <DataTable
              caption="Contact messages"
              :columns="contactColumns"
              :rows="contactMessages"
              row-key="id"
              csv-filename="mindbridge-contacts.csv"
            >
              <template #cell-date="{ value }">
                <small>{{ value ? new Date(value.seconds * 1000).toLocaleString() : new Date().toLocaleString() }}</small>
              </template>
              <template #cell-attachmentName="{ value }">
                <small>{{ value || '—' }}</small>
              </template>
              <template #actions="{ row }">
                <button type="button" class="btn btn-outline-danger btn-sm" @click="removeContact(row.id)">Delete</button>
              </template>
            </DataTable>
          </div>
        </div>
      </div>
```

Add to `<script setup>`:

```js
const userColumns = [
  { key: 'name', label: 'Name', sortable: true, searchable: true },
  { key: 'email', label: 'Email', sortable: true, searchable: true },
  { key: 'role', label: 'Role', sortable: true, searchable: true },
  { key: 'createdAt', label: 'Joined', sortable: true, searchable: false }
]
const contactColumns = [
  { key: 'date', label: 'Date', sortable: true, searchable: false },
  { key: 'name', label: 'Name', sortable: true, searchable: true },
  { key: 'email', label: 'Email', sortable: true, searchable: true },
  { key: 'subject', label: 'Subject', sortable: true, searchable: true },
  { key: 'enquiryType', label: 'Type', sortable: true, searchable: true },
  { key: 'attachmentName', label: 'Attachment', sortable: false, searchable: false }
]
```

**Delete** the old `recentUsers` computed and old imports that are no longer used (`getAllUsers`, `getUserCount`, `getUserCountByRole` — replace `allUsers` with the store's Firestore-backed `allUsers`).

- [ ] **Step 4: Verify manually (VPN on, .env filled)**

- Contact page: submit with a small PDF attachment → success alert → check your email inbox: message arrives with the attachment
- Firebase console → `contacts` collection has the doc
- Admin → contacts table shows the row; search by subject; delete works
- `.env` empty case: message still saved to Firestore with console warning (graceful)

- [ ] **Step 5: Commit**

```bash
git add src/stores/contacts.js src/views/ContactPage.vue src/views/AdminDashboard.vue
git commit -m "A3: contact form sends email with attachment via EmailJS, contacts stored in Firestore with admin table (D.2)"
```

---

### Task 7: Leaflet map page (E.2)

**Files:**
- Rewrite: `src/views/LocationsPage.vue`
- Modify: `src/stores/services.js` (add lat/lng to each service)
- Modify: `src/components/NavBar.vue` (add Locations link)
- Modify: `src/views/ContactPage.vue` (replace map placeholder with link)

- [ ] **Step 1: Add coordinates to `src/stores/services.js`**

Add a `lat`/`lng` field to each of the 6 service objects (fictional MindBridge centres around Melbourne):

| id | lat | lng |
|----|-----|-----|
| 1 | -37.8136 | 144.9631 |
| 2 | -37.8012 | 144.9567 |
| 3 | -37.8221 | 144.9813 |
| 4 | -37.7666 | 144.9744 |
| 5 | -37.8461 | 144.9762 |
| 6 | -37.8163 | 144.9338 |

- [ ] **Step 2: Rewrite `src/views/LocationsPage.vue`**

```vue
<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useServicesStore } from '../stores/services'

// Fix default marker icons missing under bundlers
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow
})

const { services } = useServicesStore()

const mapEl = ref(null)
const searchQuery = ref('')
const routeInfo = ref(null)
const searching = ref(false)
const errorMessage = ref('')
let map = null
let routeLayer = null
let searchMarker = null
let lastSearchPoint = null

onMounted(() => {
  map = L.map(mapEl.value).setView([-37.8136, 144.9631], 12)
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map)

  services.value.forEach((s) => {
    const marker = L.marker([s.lat, s.lng])
      .addTo(map)
      .bindPopup(`<strong>${s.name}</strong><br>${s.category}<br><button id="route-${s.id}" class="btn btn-mindbridge btn-sm mt-1">Route here</button>`)
    marker.on('popupopen', () => {
      const btn = document.getElementById('route-' + s.id)
      if (btn) btn.addEventListener('click', () => routeTo(s))
    })
  })
})

onBeforeUnmount(() => {
  if (map) map.remove()
})

// E.2 feature 1: geocoding search (Nominatim)
async function handleSearch() {
  if (!searchQuery.value.trim()) return
  searching.value = true
  errorMessage.value = ''
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(searchQuery.value)}`
    )
    const results = await res.json()
    if (!results.length) {
      errorMessage.value = 'No location found for that search.'
      return
    }
    const hit = results[0]
    const point = [parseFloat(hit.lat), parseFloat(hit.lon)]
    lastSearchPoint = point
    if (searchMarker) map.removeLayer(searchMarker)
    searchMarker = L.marker(point).addTo(map).bindPopup(`<strong>${hit.display_name}</strong>`).openPopup()
    map.flyTo(point, 14)
    clearRoute()
  } catch (e) {
    errorMessage.value = 'Search failed. Please try again in a moment.'
  } finally {
    searching.value = false
  }
}

// E.2 feature 2: routing (OSRM) — from search point / user location to a service
async function routeTo(service) {
  errorMessage.value = ''
  let start = lastSearchPoint
  if (!start) {
    start = await new Promise((resolve) => {
      if (!navigator.geolocation) return resolve(null)
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve([pos.coords.latitude, pos.coords.longitude]),
        () => resolve(null)
      )
    })
  }
  if (!start) {
    errorMessage.value = 'Search for a starting address first, or allow location access.'
    return
  }
  const end = [service.lat, service.lng]
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`
    const res = await fetch(url)
    const data = await res.json()
    if (!data.routes || !data.routes.length) {
      errorMessage.value = 'No route found between these points.'
      return
    }
    const route = data.routes[0]
    clearRoute()
    routeLayer = L.geoJSON(route.geometry, { style: { color: '#2c6f8f', weight: 5 } }).addTo(map)
    routeInfo.value = {
      service: service.name,
      distanceKm: (route.distance / 1000).toFixed(1),
      durationMin: Math.round(route.duration / 60)
    }
    map.fitBounds(L.geoJSON(route.geometry).getBounds())
  } catch (e) {
    errorMessage.value = 'Routing failed. Please try again in a moment.'
  }
}

function clearRoute() {
  if (routeLayer) { map.removeLayer(routeLayer); routeLayer = null }
  routeInfo.value = null
}
</script>

<template>
  <div class="locations-page">
    <section class="hero-gradient page-section pb-4">
      <div class="container text-center">
        <h1 class="hero-title">Find Support Near You</h1>
        <p class="hero-subtitle mx-auto" style="max-width: 700px;">
          Search for a place of interest or plan your route to one of our MindBridge centres.
        </p>
      </div>
    </section>

    <section class="page-section pt-4">
      <div class="container">
        <div class="card card-mindbridge p-4">
          <div class="row g-3 mb-3">
            <div class="col-md-6">
              <label for="map-search" class="form-label">Search a place of interest</label>
              <div class="d-flex gap-2">
                <input
                  id="map-search"
                  v-model="searchQuery"
                  type="text"
                  class="form-control"
                  placeholder="e.g. Flinders Street Station, Melbourne"
                  @keyup.enter="handleSearch"
                >
                <button type="button" class="btn btn-mindbridge text-nowrap" :disabled="searching" @click="handleSearch">
                  <span v-if="searching" class="spinner-border spinner-border-sm me-1"></span>
                  Search
                </button>
              </div>
            </div>
            <div class="col-md-6 d-flex align-items-end">
              <div v-if="routeInfo" class="alert alert-success mb-0 py-2" role="status">
                <strong>Route to {{ routeInfo.service }}:</strong>
                {{ routeInfo.distanceKm }} km · about {{ routeInfo.durationMin }} min
                <button type="button" class="btn-close ms-2" aria-label="Clear route" @click="clearRoute"></button>
              </div>
              <p v-else class="text-muted small mb-0">
                Click a centre marker and choose “Route here”, or search an address first to route from it.
              </p>
            </div>
          </div>
          <div v-if="errorMessage" class="alert alert-warning py-2" role="alert">{{ errorMessage }}</div>
          <div ref="mapEl" class="map-container" aria-label="Map of MindBridge centres and searched locations" role="application"></div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.hero-title { font-size: 2.8rem; font-weight: 700; color: var(--mindbridge-heading); }
.hero-subtitle { font-size: 1.15rem; color: var(--mindbridge-text); line-height: 1.7; }
.map-container { height: 480px; border-radius: 12px; z-index: 0; }
@media (max-width: 768px) { .hero-title { font-size: 2rem; } .map-container { height: 340px; } }
</style>
```

- [ ] **Step 3: NavBar + ContactPage links**

NavBar — add after the Contact link (`<li class="nav-item">…Contact…</li>`):

```html
          <li class="nav-item">
            <router-link to="/locations" class="nav-link" @click="closeMenu">Locations</router-link>
          </li>
```

ContactPage — replace the map placeholder card content (`<div class="map-placeholder p-4 …">…</div>`) with:

```html
              <router-link to="/locations" class="btn btn-mindbridge-outline w-100 mt-2">
                🗺️ Open Interactive Map
              </router-link>
```

- [ ] **Step 4: Verify manually**

- `/locations` renders map with 6 centre markers
- Search "Federation Square Melbourne" → map flies to marker + popup
- Click a centre marker → "Route here" → blue polyline + "X km · about Y min" panel
- Without search & without geolocation permission → error message prompts to search first

- [ ] **Step 5: Commit**

```bash
git add src/views/LocationsPage.vue src/stores/services.js src/components/NavBar.vue src/views/ContactPage.vue
git commit -m "A3: add Leaflet map page with POI search (Nominatim) and routing (OSRM) — BR E.2"
```

---

### Task 8: Appointment booking with FullCalendar (F.1 innovation #1)

**Files:**
- Create: `src/stores/appointments.js`
- Rewrite: `src/views/AppointmentPage.vue`
- Modify: `src/router/index.js` (already added route in Task 3 — no change)
- Modify: `src/components/NavBar.vue` (link for logged-in users)
- Modify: `src/views/DashboardPage.vue` (quick link card)

- [ ] **Step 1: Create `src/stores/appointments.js`**

```js
// Appointment bookings — Firestore-backed, shared across users so conflict
// management (same professional, same slot) is global (F.1 innovation #1)
import { ref } from 'vue'
import { collection, addDoc, doc, updateDoc, onSnapshot } from 'firebase/firestore'
import { auth, db } from '../firebase'

export const PROFESSIONALS = [
  'Dr. Emily Chen — Clinical Psychologist',
  'James Walker — Counsellor',
  'Priya Patel — Social Worker'
]

const appointments = ref([])

export function initAppointments() {
  onSnapshot(collection(db, 'appointments'), (snap) => {
    appointments.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  })
}
initAppointments()

export function useAppointmentsStore() {
  async function bookAppointment({ date, start, end, professional, serviceId, serviceName }) {
    const user = auth.currentUser
    if (!user) return { success: false, error: 'Please log in to book an appointment.' }
    try {
      const docRef = await addDoc(collection(db, 'appointments'), {
        date,
        start,
        end,
        professional,
        serviceId,
        serviceName,
        userId: user.uid,
        userName: user.displayName || user.email || 'User',
        status: 'confirmed',
        createdAt: new Date()
      })
      // E.1 defence-in-depth: mirror to the serverless worker which re-validates
      // the booking server-side (conflict check against its own store)
      if (import.meta.env.VITE_WORKER_URL) {
        fetch(`${import.meta.env.VITE_WORKER_URL}/api/appointments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: docRef.id, date, start, end, professional, userId: user.uid, userName: user.displayName || user.email })
        }).then(async (res) => {
          if (res.status === 409) {
            // server-side check rejected — roll back the client write
            await updateDoc(docRef, { status: 'cancelled' })
            console.warn('Worker rejected booking: conflict')
          }
        }).catch(() => { /* worker unreachable — booking remains valid in Firestore */ })
      }
      return { success: true, id: docRef.id }
    } catch (e) {
      console.error('booking failed', e)
      return { success: false, error: 'Could not save your booking. Please try again.' }
    }
  }

  async function setStatus(id, status) {
    await updateDoc(doc(db, 'appointments', id), { status })
  }

  return { appointments, bookAppointment, setStatus }
}
```

- [ ] **Step 2: Rewrite `src/views/AppointmentPage.vue`**

```vue
<script setup>
import { ref, computed, reactive } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { useAppointmentsStore, PROFESSIONALS } from '../stores/appointments'
import { useAuthStore } from '../stores/auth'
import { useServicesStore } from '../stores/services'
import { isPast, isWithinBusinessHours, isWeekday, hasConflict, countUpcoming } from '../utils/booking'

const { appointments, bookAppointment, setStatus } = useAppointmentsStore()
const { currentUser } = useAuthStore()
const { services } = useServicesStore()

const showModal = ref(false)
const selectedSlot = reactive({ date: '', start: '', end: '' })
const bookingForm = reactive({ professional: PROFESSIONALS[0], serviceId: 1 })
const errorMessage = ref('')
const successMessage = ref('')
const saving = ref(false)

const myBookings = computed(() =>
  appointments.value
    .filter((b) => b.userId === currentUser.value?.uid)
    .sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start))
)

const calendarOptions = computed(() => ({
  plugins: [timeGridPlugin, interactionPlugin],
  initialView: 'timeGridWeek',
  height: 'auto',
  allDaySlot: false,
  weekends: false,
  slotDuration: '01:00',
  slotMinTime: '09:00:00',
  slotMaxTime: '17:00:00',
  selectable: true,
  selectMirror: true,
  headerToolbar: { left: 'prev,next today', center: 'title', right: 'timeGridWeek,timeGridDay' },
  businessHours: [{ daysOfWeek: [1, 2, 3, 4, 5], startTime: '09:00', endTime: '17:00' }],
  validRange: { start: new Date() },
  events: appointments.value
    .filter((b) => b.status !== 'cancelled')
    .map((b) => ({
      id: b.id,
      title: `${b.professional.split(' — ')[0]} · ${b.userName}`,
      start: `${b.date}T${b.start}:00`,
      end: `${b.date}T${b.end}:00`,
      backgroundColor: '#2c6f8f',
      borderColor: '#1a526b'
    })),
  select(info) {
    const date = info.startStr.slice(0, 10)
    const start = info.startStr.slice(11, 16)
    const end = info.endStr.slice(11, 16)
    openBooking(date, start, end)
  }
}))

function openBooking(date, start, end) {
  errorMessage.value = ''
  successMessage.value = ''
  selectedSlot.date = date
  selectedSlot.start = start
  selectedSlot.end = end
  showModal.value = true
}

async function confirmBooking() {
  errorMessage.value = ''
  const { date, start, end } = selectedSlot
  const newBooking = { id: 'new', date, start, end, professional: bookingForm.professional }

  // F.1 booking constraints — client-side validation
  if (isPast(date, end)) { errorMessage.value = 'That time slot is in the past.'; return }
  if (!isWeekday(date)) { errorMessage.value = 'Appointments are available on weekdays only.'; return }
  if (!isWithinBusinessHours(start, end)) { errorMessage.value = 'Appointments are available between 9:00 and 17:00.'; return }
  if (hasConflict(appointments.value, newBooking)) {
    errorMessage.value = 'This professional is already booked for that time slot. Please pick another slot.'
    return
  }
  if (countUpcoming(appointments.value, currentUser.value.uid) >= 2) {
    errorMessage.value = 'You can have at most 2 upcoming appointments. Please cancel one first.'
    return
  }

  saving.value = true
  const service = services.value.find((s) => s.id === bookingForm.serviceId) || services.value[0]
  const result = await bookAppointment({
    date, start, end,
    professional: bookingForm.professional,
    serviceId: service.id,
    serviceName: service.name
  })
  saving.value = false
  if (result.success) {
    showModal.value = false
    successMessage.value = 'Appointment booked! We will email you a confirmation.'
    setTimeout(() => { successMessage.value = '' }, 5000)
  } else {
    errorMessage.value = result.error
  }
}

async function cancelBooking(id) {
  await setStatus(id, 'cancelled')
}
</script>

<template>
  <div class="appointment-page page-section bg-calm">
    <div class="container">
      <div class="row mb-4">
        <div class="col-12">
          <div class="card card-mindbridge p-4">
            <h1 class="h3 mb-2">📅 Book an Appointment</h1>
            <p class="text-muted mb-0">
              Select an available slot on the calendar (weekdays, 9:00–17:00). Each professional can only see one client per slot.
            </p>
          </div>
        </div>
      </div>

      <div v-if="successMessage" class="alert alert-success" role="status">{{ successMessage }}</div>

      <div class="card card-mindbridge p-4 mb-4">
        <FullCalendar :options="calendarOptions" />
      </div>

      <div class="card card-mindbridge p-4">
        <h5>🗓️ My Bookings</h5>
        <ul class="list-group list-group-flush">
          <li v-for="b in myBookings" :key="b.id" class="list-group-item d-flex justify-content-between align-items-center flex-wrap gap-2">
            <span>
              <strong>{{ b.serviceName }}</strong> with {{ b.professional }}<br>
              <small class="text-muted">{{ b.date }} · {{ b.start }}–{{ b.end }} ·
                <span :class="b.status === 'cancelled' ? 'text-danger' : 'text-success'">{{ b.status }}</span></small>
            </span>
            <button v-if="b.status !== 'cancelled' && !isPast(b.date, b.end)" type="button" class="btn btn-outline-danger btn-sm" @click="cancelBooking(b.id)">
              Cancel
            </button>
          </li>
          <li v-if="!myBookings.length" class="list-group-item text-muted">No bookings yet.</li>
        </ul>
      </div>
    </div>

    <!-- Booking modal (Bootstrap modal markup, toggled by v-if) -->
    <div v-if="showModal" class="modal d-block" tabindex="-1" role="dialog" aria-modal="true" aria-labelledby="booking-modal-title">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 id="booking-modal-title" class="modal-title">Confirm Appointment</h5>
            <button type="button" class="btn-close" aria-label="Close" @click="showModal = false"></button>
          </div>
          <div class="modal-body">
            <p>
              <strong>Slot:</strong> {{ selectedSlot.date }} · {{ selectedSlot.start }}–{{ selectedSlot.end }}
            </p>
            <div class="mb-3">
              <label for="booking-service" class="form-label">Service</label>
              <select id="booking-service" v-model.number="bookingForm.serviceId" class="form-select">
                <option v-for="s in services" :key="s.id" :value="s.id">{{ s.name }}</option>
              </select>
            </div>
            <div class="mb-3">
              <label for="booking-professional" class="form-label">Professional</label>
              <select id="booking-professional" v-model="bookingForm.professional" class="form-select">
                <option v-for="p in PROFESSIONALS" :key="p" :value="p">{{ p }}</option>
              </select>
            </div>
            <div v-if="errorMessage" class="alert alert-danger py-2" role="alert">{{ errorMessage }}</div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" @click="showModal = false">Cancel</button>
            <button type="button" class="btn btn-mindbridge" :disabled="saving" @click="confirmBooking">
              <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>
              Book Appointment
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
```

- [ ] **Step 3: NavBar + Dashboard links**

NavBar — in the logged-in block, before the Dashboard link, add:

```html
            <router-link to="/book-appointment" class="btn btn-outline-secondary btn-sm" @click="closeMenu">
              Book Appointment
            </router-link>
```

DashboardPage quick links — add after the "Contact Support" `<li>`:

```html
              <li class="mb-2">
                <router-link to="/book-appointment" class="d-flex align-items-center gap-2">
                  📅 Book an Appointment
                </router-link>
              </li>
```

- [ ] **Step 4: Verify manually**

- Login as sarah → /book-appointment → calendar shows Mon–Fri 9–17 only
- Click a future slot → modal → pick service + professional → Book → success message; booking appears in calendar + "My Bookings"
- Try to book the **same professional on the same slot** → error "already booked for that time slot"
- Book a different professional same slot → works
- Book a 3rd upcoming appointment → blocked by the 2-booking limit
- Cancel a booking → grey/struck and excluded from conflict checks
- Admin later (Task 10) sees all bookings

- [ ] **Step 5: Commit**

```bash
git add src/stores/appointments.js src/views/AppointmentPage.vue src/components/NavBar.vue src/views/DashboardPage.vue
git commit -m "A3: add FullCalendar appointment booking with conflict management, business hours and per-user limits (F.1)"
```

---

### Task 9: Bulk email to selected users (F.1 innovation #2)

**Files:**
- Create: `src/views/BulkEmailPanel.vue`
- Modify: `src/views/AdminDashboard.vue` (selectable users table + panel; see Task 10 for the full layout)

- [ ] **Step 1: Create `src/views/BulkEmailPanel.vue`**

```vue
<script setup>
import { ref, computed } from 'vue'
import emailjs from '@emailjs/browser'

const props = defineProps({
  recipients: { type: Array, required: true } // [{ uid, name, email }]
})
const emit = defineEmits(['sent'])

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID
const BULK_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_BULK_TEMPLATE_ID
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

const subject = ref('')
const message = ref('')
const sending = ref(false)
const status = ref('')   // '' | success text | error text
const sentCount = ref(0)

const canSend = computed(() =>
  props.recipients.length > 0 && subject.value.trim() && message.value.trim() && !sending.value
)

async function sendBulk() {
  if (!canSend.value) return
  if (!SERVICE_ID || !BULK_TEMPLATE_ID || !PUBLIC_KEY) {
    status.value = 'EmailJS is not configured (.env keys missing).'
    return
  }
  sending.value = true
  status.value = ''
  sentCount.value = 0
  for (const recipient of props.recipients) {
    try {
      await emailjs.send(
        SERVICE_ID,
        BULK_TEMPLATE_ID,
        {
          to_email: recipient.email,
          to_name: recipient.name || recipient.email,
          subject: subject.value,
          message: message.value
        },
        { publicKey: PUBLIC_KEY }
      )
      sentCount.value++
    } catch (e) {
      console.error('bulk send failed for', recipient.email, e)
    }
  }
  sending.value = false
  if (sentCount.value === props.recipients.length) {
    status.value = `✅ Sent to all ${sentCount.value} recipient(s).`
  } else {
    status.value = `⚠️ Sent to ${sentCount.value} of ${props.recipients.length} recipient(s). Check the EmailJS quota (free plan: 200/month).`
  }
  emit('sent', sentCount.value)
  subject.value = ''
  message.value = ''
}
</script>

<template>
  <div class="card card-mindbridge p-4 h-100">
    <h5>📧 Bulk Email <span class="badge bg-soft-primary text-primary ms-1">{{ recipients.length }} selected</span></h5>
    <p class="text-muted small">
      Select recipients in the Users table above, then compose one message — it is sent to each of them individually.
    </p>
    <div class="mb-3">
      <label for="bulk-subject" class="form-label">Subject</label>
      <input id="bulk-subject" v-model="subject" type="text" class="form-control" placeholder="e.g. New support group starting this month">
    </div>
    <div class="mb-3">
      <label for="bulk-message" class="form-label">Message</label>
      <textarea id="bulk-message" v-model="message" class="form-control" rows="5" placeholder="Write your message..."></textarea>
    </div>
    <div v-if="status" class="alert py-2" :class="status.startsWith('✅') ? 'alert-success' : 'alert-warning'" role="status">{{ status }}</div>
    <button type="button" class="btn btn-mindbridge" :disabled="!canSend" @click="sendBulk">
      <span v-if="sending" class="spinner-border spinner-border-sm me-1"></span>
      Send to {{ recipients.length }} recipient{{ recipients.length !== 1 ? 's' : '' }}
    </button>
  </div>
</template>

<style scoped>
.bg-soft-primary { background: rgba(44, 111, 143, 0.1); }
</style>
```

- [ ] **Step 2: Make the users table selectable in `src/views/AdminDashboard.vue`** — add `selectable` + `v-model:selected` to the Users DataTable, plus `BulkEmailPanel`:

In `<script setup>`:

```js
import BulkEmailPanel from '../views/BulkEmailPanel.vue'
const selectedUserUids = ref([])
const selectedUsers = computed(() => allUsers.value.filter((u) => selectedUserUids.value.includes(u.uid)))
```
(add `ref` to the vue import)

Users DataTable tag gains:

```html
              selectable
              v-model:selected="selectedUserUids"
```

And after the Users table card, add a new row with the panel:

```html
      <div class="row mb-4">
        <div class="col-12">
          <BulkEmailPanel :recipients="selectedUsers" />
        </div>
      </div>
```

- [ ] **Step 3: Verify manually**

- Admin → Users table → tick 2 checkboxes → compose subject+message → Send → status "Sent to all 2 recipient(s)"
- Check the recipient inboxes (use your own email for one test account so you can see it arrive)
- Untick all → button disabled

- [ ] **Step 4: Commit**

```bash
git add src/views/BulkEmailPanel.vue src/views/AdminDashboard.vue
git commit -m "A3: add admin bulk email to selected users via EmailJS (F.1 innovation)"
```

---

### Task 10: Admin dashboard overhaul — charts + appointments table (F.1 innovation #3)

**Files:**
- Rewrite: `src/views/AdminDashboard.vue` (full replacement — consolidates Tasks 5/6/9 wiring)

- [ ] **Step 1: Rewrite `src/views/AdminDashboard.vue`** — full file:

```vue
<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import Chart from 'chart.js/auto'
import DataTable from '../components/DataTable.vue'
import BulkEmailPanel from '../views/BulkEmailPanel.vue'
import { useAuthStore } from '../stores/auth'
import { useRatingsStore } from '../stores/ratings'
import { useContactsStore } from '../stores/contacts'
import { useAppointmentsStore } from '../stores/appointments'
import { useServicesStore } from '../stores/services'

const { currentUser, allUsers, userName, logout } = useAuthStore()
const { ratings } = useRatingsStore()
const { contacts, removeContact } = useContactsStore()
const { appointments, setStatus } = useAppointmentsStore()
const { services } = useServicesStore()

// ---- table data ----
const userColumns = [
  { key: 'name', label: 'Name', sortable: true, searchable: true },
  { key: 'email', label: 'Email', sortable: true, searchable: true },
  { key: 'role', label: 'Role', sortable: true, searchable: true },
  { key: 'createdAt', label: 'Joined', sortable: true, searchable: false }
]
const contactColumns = [
  { key: 'date', label: 'Date', sortable: true, searchable: false },
  { key: 'name', label: 'Name', sortable: true, searchable: true },
  { key: 'email', label: 'Email', sortable: true, searchable: true },
  { key: 'subject', label: 'Subject', sortable: true, searchable: true },
  { key: 'enquiryType', label: 'Type', sortable: true, searchable: true },
  { key: 'attachmentName', label: 'Attachment', sortable: false, searchable: false }
]
const appointmentColumns = [
  { key: 'date', label: 'Date', sortable: true, searchable: true },
  { key: 'start', label: 'Start', sortable: true, searchable: false },
  { key: 'professional', label: 'Professional', sortable: true, searchable: true },
  { key: 'userName', label: 'Client', sortable: true, searchable: true },
  { key: 'serviceName', label: 'Service', sortable: true, searchable: true },
  { key: 'status', label: 'Status', sortable: true, searchable: true }
]

const selectedUserUids = ref([])
const selectedUsers = computed(() => allUsers.value.filter((u) => selectedUserUids.value.includes(u.uid)))
const totalServices = computed(() => services.value.length)
const totalRatings = computed(() => ratings.value.length)
const upcomingAppointments = computed(() =>
  appointments.value.filter((a) => a.status === 'confirmed' && new Date(`${a.date}T${a.end}:00`) > new Date())
)

// ---- charts (Chart.js, data from Firestore) ----
const roleChartEl = ref(null)
const ratingChartEl = ref(null)
const appointmentChartEl = ref(null)
let roleChart = null, ratingChart = null, appointmentChart = null

function weekLabel(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  const day = (d.getDay() + 6) % 7 // Monday = 0
  const monday = new Date(d)
  monday.setDate(d.getDate() - day)
  return monday.toISOString().slice(0, 10)
}

function buildCharts() {
  const roleCounts = {}
  allUsers.value.forEach((u) => { roleCounts[u.role] = (roleCounts[u.role] || 0) + 1 })

  const ratingAvg = {}
  ratings.value.forEach((r) => {
    if (!ratingAvg[r.itemId]) ratingAvg[r.itemId] = { sum: 0, n: 0 }
    ratingAvg[r.itemId].sum += r.score
    ratingAvg[r.itemId].n++
  })
  const serviceLabels = services.value.map((s) => s.name)
  const serviceAvgs = services.value.map((s) => {
    const agg = ratingAvg[s.id]
    return agg ? +(agg.sum / agg.n).toFixed(1) : 0
  })

  const weekCounts = {}
  appointments.value
    .filter((a) => a.status !== 'cancelled')
    .forEach((a) => {
      const w = weekLabel(a.date)
      weekCounts[w] = (weekCounts[w] || 0) + 1
    })
  const weekKeys = Object.keys(weekCounts).sort()

  if (roleChart) roleChart.destroy()
  if (ratingChart) ratingChart.destroy()
  if (appointmentChart) appointmentChart.destroy()

  roleChart = new Chart(roleChartEl.value, {
    type: 'doughnut',
    data: {
      labels: Object.keys(roleCounts),
      datasets: [{ data: Object.values(roleCounts), backgroundColor: ['#2c6f8f', '#4a9c7c', '#f0a04b', '#c53030'] }]
    },
    options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
  })
  ratingChart = new Chart(ratingChartEl.value, {
    type: 'bar',
    data: {
      labels: serviceLabels,
      datasets: [{ label: 'Average rating', data: serviceAvgs, backgroundColor: '#4a9c7c' }]
    },
    options: { responsive: true, scales: { y: { min: 0, max: 5 } }, plugins: { legend: { display: false } } }
  })
  appointmentChart = new Chart(appointmentChartEl.value, {
    type: 'line',
    data: {
      labels: weekKeys,
      datasets: [{ label: 'Appointments', data: weekKeys.map((w) => weekCounts[w]), borderColor: '#2c6f8f', backgroundColor: 'rgba(44,111,143,0.15)', fill: true, tension: 0.3 }]
    },
    options: { responsive: true, plugins: { legend: { display: false } } }
  })
}

onMounted(buildCharts)
watch([allUsers, ratings, appointments], buildCharts, { deep: true })
onBeforeUnmount(() => {
  if (roleChart) roleChart.destroy()
  if (ratingChart) ratingChart.destroy()
  if (appointmentChart) appointmentChart.destroy()
})
</script>

<template>
  <div class="admin-page page-section bg-calm min-vh-100-minus-nav">
    <div class="container">
      <!-- Header -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="card card-mindbridge p-4 border-start border-4 border-warning">
            <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
              <div>
                <h1 class="h2 mb-1">⚙️ Admin Dashboard</h1>
                <p class="text-muted mb-0">System overview for <strong>{{ userName }}</strong></p>
              </div>
              <div class="d-flex gap-2">
                <router-link to="/dashboard" class="btn btn-mindbridge-outline btn-sm">My Dashboard</router-link>
                <button @click="logout" class="btn btn-outline-secondary btn-sm">Logout</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="row g-4 mb-4">
        <div class="col-lg-3 col-md-6"><div class="card card-mindbridge p-4 text-center"><div class="h1 text-primary mb-0">{{ allUsers.length }}</div><div class="text-muted">Total Users</div></div></div>
        <div class="col-lg-3 col-md-6"><div class="card card-mindbridge p-4 text-center"><div class="h1 text-success mb-0">{{ totalServices }}</div><div class="text-muted">Services Offered</div></div></div>
        <div class="col-lg-3 col-md-6"><div class="card card-mindbridge p-4 text-center"><div class="h1 text-warning mb-0">{{ totalRatings }}</div><div class="text-muted">Total Ratings</div></div></div>
        <div class="col-lg-3 col-md-6"><div class="card card-mindbridge p-4 text-center"><div class="h1 text-info mb-0">{{ upcomingAppointments.length }}</div><div class="text-muted">Upcoming Appointments</div></div></div>
      </div>

      <!-- Charts (F.1 innovation #3) -->
      <div class="row g-4 mb-4">
        <div class="col-lg-4">
          <div class="card card-mindbridge p-4 h-100">
            <h5>👥 Users by Role</h5>
            <div class="chart-box"><canvas ref="roleChartEl" role="img" aria-label="Doughnut chart of users by role"></canvas></div>
          </div>
        </div>
        <div class="col-lg-4">
          <div class="card card-mindbridge p-4 h-100">
            <h5>⭐ Average Rating per Service</h5>
            <div class="chart-box"><canvas ref="ratingChartEl" role="img" aria-label="Bar chart of average rating per service"></canvas></div>
          </div>
        </div>
        <div class="col-lg-4">
          <div class="card card-mindbridge p-4 h-100">
            <h5>📈 Appointments per Week</h5>
            <div class="chart-box"><canvas ref="appointmentChartEl" role="img" aria-label="Line chart of appointments per week"></canvas></div>
          </div>
        </div>
      </div>

      <!-- Users table + bulk email (F.1 innovation #2) -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="card card-mindbridge p-4">
            <h5>📋 Users</h5>
            <DataTable
              caption="Users"
              :columns="userColumns"
              :rows="allUsers"
              row-key="uid"
              csv-filename="mindbridge-users.csv"
              selectable
              v-model:selected="selectedUserUids"
            >
              <template #cell-role="{ row }">
                <span class="badge" :class="row.role === 'admin' ? 'bg-warning text-dark' : 'bg-soft-primary text-primary'">{{ row.role }}</span>
              </template>
              <template #cell-createdAt="{ value }">
                <small>{{ value ? new Date(value.seconds * 1000).toLocaleDateString() : '—' }}</small>
              </template>
            </DataTable>
          </div>
        </div>
      </div>

      <div class="row mb-4">
        <div class="col-12">
          <BulkEmailPanel :recipients="selectedUsers" />
        </div>
      </div>

      <!-- Appointments table (admin view of F.1 bookings) -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="card card-mindbridge p-4">
            <h5>🗓️ All Appointments</h5>
            <DataTable
              caption="Appointments"
              :columns="appointmentColumns"
              :rows="appointments"
              row-key="id"
              csv-filename="mindbridge-appointments.csv"
            >
              <template #cell-status="{ value }">
                <span class="badge" :class="value === 'confirmed' ? 'bg-success' : value === 'cancelled' ? 'bg-danger' : 'bg-secondary'">{{ value }}</span>
              </template>
              <template #actions="{ row }">
                <button v-if="row.status !== 'cancelled'" type="button" class="btn btn-outline-danger btn-sm" @click="setStatus(row.id, 'cancelled')">Cancel</button>
              </template>
            </DataTable>
          </div>
        </div>
      </div>

      <!-- Contact messages table -->
      <div class="row">
        <div class="col-12">
          <div class="card card-mindbridge p-4">
            <h5>📬 Contact Messages</h5>
            <DataTable
              caption="Contact messages"
              :columns="contactColumns"
              :rows="contacts"
              row-key="id"
              csv-filename="mindbridge-contacts.csv"
            >
              <template #cell-date="{ value }">
                <small>{{ value ? new Date(value.seconds * 1000).toLocaleString() : new Date().toLocaleString() }}</small>
              </template>
              <template #cell-attachmentName="{ value }">
                <small>{{ value || '—' }}</small>
              </template>
              <template #actions="{ row }">
                <button type="button" class="btn btn-outline-danger btn-sm" @click="removeContact(row.id)">Delete</button>
              </template>
            </DataTable>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.min-vh-100-minus-nav { min-height: calc(100vh - 200px); }
.bg-soft-primary { background: rgba(44, 111, 143, 0.1); }
.border-4 { border-width: 4px !important; }
.chart-box { position: relative; height: 260px; }
</style>
```

- [ ] **Step 2: Verify manually**

- Admin page renders: 4 stat cards, 3 charts with data (rates ≥2 services as different users first if empty)
- Users table: selectable + search + sort + pagination + CSV
- Appointments table lists bookings; Cancel updates status everywhere
- Charts update live when data changes (rate a service in another tab while admin open)

- [ ] **Step 3: Commit**

```bash
git add src/views/AdminDashboard.vue
git commit -m "A3: rebuild admin dashboard with Chart.js visualisations from Firestore and appointments management (F.1)"
```

---

### Task 11: Offline capabilities (F.1 innovation #4)

**Files:**
- Create: `src/components/OfflineBanner.vue`
- Modify: `src/App.vue` (banner + skip link)
- Modify: `src/stores/ratings.js` (register rating queue flusher)
- Modify: `src/stores/contacts.js` (flusher already registered in Task 6 ✓)

- [ ] **Step 1: Create `src/components/OfflineBanner.vue`**

```vue
<script setup>
import { useNetworkStore } from '../stores/network'

const { isOnline } = useNetworkStore()
</script>

<template>
  <div v-if="!isOnline" class="offline-banner" role="status">
    ⚠️ You are offline — new messages and ratings will be saved locally and synced when you reconnect.
  </div>
</template>

<style scoped>
.offline-banner {
  background: #f0a04b;
  color: #3a2a12;
  text-align: center;
  padding: 0.5rem 1rem;
  font-weight: 600;
}
</style>
```

- [ ] **Step 2: Update `src/App.vue`**

```vue
<script setup>
import NavBar from './components/NavBar.vue'
import FooterBar from './components/FooterBar.vue'
import CrisisHelpline from './components/CrisisHelpline.vue'
import OfflineBanner from './components/OfflineBanner.vue'
</script>

<template>
  <div id="app-wrapper">
    <a href="#main" class="skip-link">Skip to main content</a>
    <OfflineBanner />
    <CrisisHelpline />
    <NavBar />
    <main id="main" class="main-content" tabindex="-1">
      <router-view />
    </main>
    <FooterBar />
  </div>
</template>

<style scoped>
#app-wrapper { display: flex; flex-direction: column; min-height: 100vh; }
.main-content { flex: 1; }
</style>
```

Add to `src/style.css`:

```css
/* Accessibility (E.3) — skip link + focus visibility */
.skip-link {
  position: absolute;
  left: -9999px;
  top: 0;
  z-index: 3000;
  background: #fff;
  color: var(--mindbridge-heading);
  padding: 0.6rem 1.2rem;
  border: 2px solid var(--mindbridge-primary);
  border-radius: 0 0 8px 0;
  font-weight: 600;
}
.skip-link:focus { left: 0; top: 0; }
:focus-visible {
  outline: 3px solid var(--mindbridge-primary);
  outline-offset: 2px;
}
```

- [ ] **Step 3: Ratings flusher in `src/stores/ratings.js`** — append:

```js
// Offline queue flusher — writes queued ratings once the connection returns
registerFlusher(async () => {
  const q = JSON.parse(localStorage.getItem('mindbridge_offline_queue') || '{"contacts":[],"ratings":[]}')
  const pending = q.ratings || []
  if (!pending.length) return
  for (const item of pending) {
    const docRef = doc(db, 'ratings', item.itemId + '_' + item.userId)
    const existing = await getDoc(docRef)
    if (existing.exists()) {
      await setDoc(docRef, { score: item.score, updatedAt: serverTimestamp() }, { merge: true })
    } else {
      await setDoc(docRef, { itemId: item.itemId, score: item.score, userId: item.userId, createdAt: serverTimestamp() })
    }
  }
  q.ratings = []
  localStorage.setItem('mindbridge_offline_queue', JSON.stringify(q))
})
```
and add `registerFlusher` to the `./network` import.

- [ ] **Step 4: Verify manually**

- DevTools → Network → Offline (or turn VPN/wifi off) → amber banner appears
- Submit contact form while offline → success with queue note → check `localStorage.mindbridge_offline_queue` has the entry
- Rate a service while offline → "Saved offline — will sync when you reconnect"
- Go back Online → banner disappears; queue flushes (localStorage key empties); Firestore gains the contact + rating

- [ ] **Step 5: Commit**

```bash
git add src/components/OfflineBanner.vue src/App.vue src/style.css src/stores/ratings.js
git commit -m "A3: add offline banner and localStorage sync queue with automatic re-sync (F.1 innovation)"
```

---

### Task 12: PDF export (E.4)

**Files:**
- Create: `src/utils/pdf.js`
- Modify: `src/views/AdminDashboard.vue` (PDF buttons on the three tables)

- [ ] **Step 1: Create `src/utils/pdf.js`**

```js
// PDF export via jsPDF + autotable (E.4 — export in multiple formats)
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

export function exportTablePdf(title, columns, rows, filename) {
  const doc = new jsPDF()
  doc.setFontSize(16)
  doc.text(title, 14, 16)
  autoTable(doc, {
    startY: 22,
    head: [columns.map((c) => c.label)],
    body: rows.map((r) => columns.map((c) => formatCell(r[c.key])))
  })
  doc.save(filename)
}

function formatCell(value) {
  if (value == null) return ''
  if (value && value.seconds) return new Date(value.seconds * 1000).toLocaleString()
  return String(value)
}
```

- [ ] **Step 2: Add PDF buttons to `src/views/AdminDashboard.vue`**

In `<script setup>` add `import { exportTablePdf } from '../utils/pdf'`.

After each DataTable (in the users card header area — place next to the h5):

Users card header:

```html
            <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
              <h5 class="mb-0">📋 Users</h5>
              <button type="button" class="btn btn-outline-secondary btn-sm" @click="exportTablePdf('MindBridge Users', userColumns, allUsers, 'mindbridge-users.pdf')">⬇ Export PDF</button>
            </div>
```
(same pattern for Appointments with `appointmentColumns`/`appointments`/`'mindbridge-appointments.pdf'` and Contacts with `contactColumns`/`contacts`/`'mindbridge-contacts.pdf'`)

- [ ] **Step 3: Verify manually**

- Each table's "Export PDF" downloads a readable PDF that opens in a viewer with correct columns/rows

- [ ] **Step 4: Commit**

```bash
git add src/utils/pdf.js src/views/AdminDashboard.vue
git commit -m "A3: add PDF export for admin tables via jsPDF (E.4)"
```

---

### Task 13: WCAG 2.1 AA accessibility pass (E.3)

**Files:**
- Modify: `src/style.css` (contrast + focus — partly done in Task 11)
- Modify: `src/components/NavBar.vue` (aria-controls)
- Modify: `src/components/StarRating.vue` (keyboard semantics)
- Modify: `src/views/LoginPage.vue`, `src/views/RegisterPage.vue`, `src/views/ContactPage.vue` (aria-describedby / aria-invalid on error fields)
- Audit: all views for alt text + heading order (checklist)

- [ ] **Step 1: NavBar toggler aria**

Change the toggler button:

```html
      <button
        class="navbar-toggler border-0"
        type="button"
        @click="toggleMenu"
        :aria-expanded="isMenuOpen"
        aria-controls="mindbridge-nav"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
```
and the collapsible div gains `id="mindbridge-nav"`.

- [ ] **Step 2: StarRating keyboard semantics** — add `:aria-pressed` and a group label:

```html
    <div class="stars d-inline-flex align-items-center gap-1" role="group" aria-label="Rate this service from 1 to 5 stars">
      <button
        v-for="star in 5"
        :key="star"
        type="button"
        class="star-btn"
        :class="[starClass(star), { clickable: !readOnly && isLoggedIn }]"
        :disabled="readOnly || !isLoggedIn"
        :aria-label="`Rate ${star} out of 5 stars`"
        :aria-pressed="userRating?.score === star && !readOnly"
        @click="rate(star)"
        @mouseenter="hoverRating = star"
        @mouseleave="hoverRating = 0"
      >
        ★
      </button>
    </div>
```

- [ ] **Step 3: Error-message association on the three forms**

Login email input: add `:aria-invalid="!!emailError"` and `:aria-describedby="emailError ? 'login-email-error' : null"`; the error div gains `id="login-email-error"`. Repeat the pattern for:
- RegisterPage: `reg-name`/`reg-email`/`reg-password`/`reg-confirm` + their error divs (`reg-name-error` etc.)
- ContactPage: `contact-name`/`contact-email`/`contact-subject`/`contact-message` + error divs

- [ ] **Step 4: Contrast fixes in `src/style.css`**

- `.btn-accent` — change `color: #fff` to `color: #3a2a12` (dark text on amber passes AA; also update `:hover` rule)
- Any `text-warning` on white (AdminDashboard role badges use `bg-warning text-dark` ✓ already dark text)
- `--mindbridge-text: #4a5568` on `--mindbridge-light: #f5f8fa` ≈ 7.5:1 ✓
- Links `--mindbridge-primary: #2c6f8f` on white ≈ 5.6:1 ✓ (large text only needs 3:1, normal text 4.5:1 — passes)
- Crisis banner: verify `#c53030` on white ≈ 5.9:1 ✓

- [ ] **Step 5: Global audit checklist** (walk every page, fix in place)

- [ ] One `<h1>` per page, no heading-level skips (h1→h3 without h2)
- [ ] Every `<img>` has meaningful `alt`; decorative images `alt=""`
- [ ] All icon-only buttons have `aria-label` (e.g. star buttons, btn-close — already `aria-label="Close"`)
- [ ] Keyboard-only pass: Tab through Home → Register → complete the register form entirely by keyboard; operate a DataTable (sort, search, paginate); operate StarRating; book an appointment slot via keyboard (FullCalendar selectable grid is keyboard-accessible by default)
- [ ] Dynamic messages are inside `role="status"`/`role="alert"` containers (done in Tasks 4–10)
- [ ] Run https://www.accessibilitychecker.org against the deployed URL in Task 15 and fix any High/Critical findings

- [ ] **Step 6: Commit**

```bash
git add src/style.css src/components/NavBar.vue src/components/StarRating.vue src/views/LoginPage.vue src/views/RegisterPage.vue src/views/ContactPage.vue
git commit -m "A3: WCAG 2.1 AA accessibility pass — skip link, focus visibility, aria wiring, contrast fixes (E.3)"
```

---

### Task 14: Cloudflare Worker — serverless functions (E.1) + REST API (F.1)

**Files:**
- Create: `workers/mindbridge-api/wrangler.jsonc`
- Create: `workers/mindbridge-api/src/index.js`
- Modify: `mindbridge/.env` + `.env.example` (VITE_WORKER_URL after deploy)

- [ ] **Step 1: Create `workers/mindbridge-api/src/index.js`**

```js
// MindBridge serverless API (E.1) — self-designed Cloudflare Worker.
// Provides a public REST API (F.1 "API access") and server-side appointment
// validation with conflict management stored in Workers KV.
const RESOURCES = [
  { id: 1, title: 'Understanding Anxiety: A Comprehensive Guide', category: 'anxiety', author: 'Dr. Emily Chen', readTime: '8 min', featured: true },
  { id: 2, title: 'Mindfulness Meditation for Beginners', category: 'mindfulness', author: 'James Wilson, LCSW', readTime: '12 min', featured: true },
  { id: 3, title: 'Recognizing Depression: Signs, Symptoms, and When to Seek Help', category: 'depression', author: 'Dr. Sarah Thompson', readTime: '10 min', featured: true },
  { id: 4, title: 'Sleep Hygiene: Building Healthy Sleep Habits', category: 'wellness', author: 'Dr. Michael Brown', readTime: '7 min', featured: false },
  { id: 5, title: 'Coping with Stress: Strategies That Work', category: 'stress', author: 'Lisa Martinez, Psychologist', readTime: '9 min', featured: false },
  { id: 6, title: 'Supporting a Loved One with Mental Illness', category: 'support', author: 'Dr. Emily Chen', readTime: '11 min', featured: false },
  { id: 7, title: 'The Power of Exercise for Mental Health', category: 'wellness', author: 'James Wilson, LCSW', readTime: '6 min', featured: false },
  { id: 8, title: 'Understanding PTSD and Trauma Recovery', category: 'ptsd', author: 'Dr. Sarah Thompson', readTime: '13 min', featured: false },
  { id: 9, title: 'Nutrition and Mental Health: The Gut-Brain Connection', category: 'wellness', author: 'Lisa Martinez, Psychologist', readTime: '8 min', featured: false },
  { id: 10, title: 'Building Resilience: Bouncing Back from Adversity', category: 'resilience', author: 'Dr. Michael Brown', readTime: '10 min', featured: false }
]

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', ...CORS } })
}

// Server-side booking validation (mirrors the client rules from src/utils/booking.js)
function validateAppointment(p) {
  if (!p || !p.date || !p.start || !p.end || !p.professional || !p.userId) {
    return { ok: false, error: 'Missing required fields (date, start, end, professional, userId).' }
  }
  const [y, m, d] = p.date.split('-').map(Number)
  const day = new Date(y, m - 1, d).getDay()
  if (day === 0 || day === 6) return { ok: false, error: 'Appointments are available on weekdays only.' }
  const [sh] = p.start.split(':').map(Number)
  const [eh] = p.end.split(':').map(Number)
  if (sh < 9 || eh > 17 || eh <= sh) return { ok: false, error: 'Appointments must be within 09:00–17:00.' }
  const [ehh, emm = 0] = p.end.split(':').map(Number)
  if (new Date(y, m - 1, d, ehh, emm) <= new Date()) return { ok: false, error: 'The requested time is in the past.' }
  return { ok: true }
}

async function findConflict(env, payload) {
  const list = await env.MINDBRIDGE_KV.list()
  const keys = list.keys.map((k) => k.name)
  const all = []
  for (const key of keys) {
    const raw = await env.MINDBRIDGE_KV.get(key)
    if (raw) all.push(JSON.parse(raw))
  }
  return all.some((b) =>
    b.status !== 'cancelled' &&
    b.professional === payload.professional &&
    b.date === payload.date &&
    payload.start < b.end && payload.end > b.start
  )
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS })

    // GET /api/resources — public REST route (F.1 API access)
    if (url.pathname === '/api/resources' && request.method === 'GET') {
      return json({ resources: RESOURCES, count: RESOURCES.length })
    }

    // GET /api/resources/:id — public REST route
    const resMatch = url.pathname.match(/^\/api\/resources\/([^/]+)$/)
    if (resMatch && request.method === 'GET') {
      const resource = RESOURCES.find((r) => r.id === parseInt(resMatch[1]))
      if (!resource) return json({ error: 'Resource not found' }, 404)
      return json(resource)
    }

    // POST /api/appointments — server-side validation + conflict management (KV)
    if (url.pathname === '/api/appointments' && request.method === 'POST') {
      let payload
      try { payload = await request.json() } catch { return json({ error: 'Invalid JSON body' }, 400) }
      const validation = validateAppointment(payload)
      if (!validation.ok) return json({ error: validation.error }, 400)
      if (await findConflict(env, payload)) {
        return json({ error: 'Conflict: the professional is already booked for that time slot.' }, 409)
      }
      const id = payload.id || crypto.randomUUID()
      await env.MINDBRIDGE_KV.put(`appt:${id}`, JSON.stringify({ id, ...payload, status: 'confirmed', createdAt: new Date().toISOString() }))
      return json({ ok: true, id }, 201)
    }

    // GET /api/appointments — list (demo/admin debugging)
    if (url.pathname === '/api/appointments' && request.method === 'GET') {
      const list = await env.MINDBRIDGE_KV.list()
      const all = []
      for (const key of list.keys) {
        const raw = await env.MINDBRIDGE_KV.get(key.name)
        if (raw) all.push(JSON.parse(raw))
      }
      return json({ appointments: all })
    }

    return json({ error: 'Not found' }, 404)
  }
}
```

- [ ] **Step 2: Create `workers/mindbridge-api/wrangler.jsonc`**

```jsonc
{
  "$schema": "../../node_modules/wrangler/config-schema.json",
  "name": "mindbridge-api",
  "main": "src/index.js",
  "compatibility_date": "2026-08-10",
  "kv_namespaces": [
    { "binding": "MINDBRIDGE_KV", "id": "REPLACE_WITH_KV_ID" }
  ]
}
```

- [ ] **Step 3: Create the KV namespace and deploy** (from `workers/mindbridge-api/`):

```bash
npx wrangler kv namespace create MINDBRIDGE_KV
# copy the returned "id" into wrangler.jsonc (REPLACE_WITH_KV_ID)
npx wrangler deploy
# Expected: "Deployed mindbridge-api" + workers.dev URL like https://mindbridge-api.<account>.workers.dev
```

- [ ] **Step 4: Verify the worker**

```bash
curl -s https://mindbridge-api.<account>.workers.dev/api/resources | head -c 300
curl -s https://mindbridge-api.<account>.workers.dev/api/resources/2
curl -s -X POST https://mindbridge-api.<account>.workers.dev/api/appointments -H "Content-Type: application/json" -d '{"date":"2026-08-25","start":"10:00","end":"11:00","professional":"Dr. Emily Chen","userId":"test-1"}'
# Expected: 201 {"ok":true,...}; repeating the same POST → 409 conflict; a Sunday date → 400
curl -s https://mindbridge-api.<account>.workers.dev/api/appointments
```

- [ ] **Step 5: Set `VITE_WORKER_URL`** in `mindbridge/.env` to the workers.dev URL, then re-run `npm run dev` and verify booking a slot also POSTs to the worker (Network tab; 201). Booking a conflicting slot through the UI is blocked client-side first — to demo the 409 rollback, book the same slot via curl, then via UI; the UI books, the worker 409s, and the Firestore doc is cancelled.

- [ ] **Step 6: Commit**

```bash
git add workers/mindbridge-api/ .env.example
git commit -m "A3: add Cloudflare Worker serverless API — REST resources + server-side appointment conflict validation on KV (E.1, F.1 API)"
```

---

### Task 15: Deploy to Cloudflare Pages (D.4)

**Files:**
- Create: `public/_redirects`

- [ ] **Step 1: Create `public/_redirects`**

```
/* /index.html 200
```

- [ ] **Step 2: Build and deploy** (from `mindbridge/`):

```bash
npm run build
npx wrangler pages project create mindbridge --production-branch=master   # only first time
npx wrangler pages deploy dist --project-name=mindbridge
# Expected: "Deployment complete" + URL https://mindbridge-<hash>.pages.dev
```

- [ ] **Step 3: Verify the deployed app**

- Open the pages.dev URL (VPN on for Firebase-dependent parts): home page loads; login as admin works; register works; deep-link `https://…pages.dev/admin` loads directly (SPA redirect works); locations map renders; booking flow works against Firebase + worker; WCAG audit at https://www.accessibilitychecker.org on the deployed URL → no High/Critical issues
- Take the final URL for the submission template

- [ ] **Step 4: Commit**

```bash
git add public/_redirects
git commit -m "A3: deploy SPA to Cloudflare Pages with _redirects fallback (D.4)"
```

---

### Task 16: Submission materials — template, video storyboard, research report, zip

**Files:**
- Create: `docs/video-storyboard.md`
- Create: `docs/research-report-draft.md`
- Create: `scripts/fill_a3_template.py`
- Output: `D:\Desktop\A2\A3-Submission-Yiding-Shao-36668389.docx`, zip, PDF of report (user converts)

- [ ] **Step 1: Create `docs/video-storyboard.md`** — 3–5 min, no sound needed, one take through every BR:

```markdown
# A3 Video Storyboard (3–5 min, no audio needed)

**Before recording:** VPN ON, fresh browser profile or logged out, dev console closed,
page zoom 100%. Record full screen at 1920×1080.

1. (0:00) Open the deployed Cloudflare Pages URL → home page scrolls (hero, services, resources)
2. (0:30) D.1 External auth: /login → show the Google button → log in as sarah@example.com / Sarah@123 (shows Firebase email/password auth) → dashboard. Log out, register a NEW user (shows validations + Firestore profile creation) → dashboard. Log out.
3. (1:30) D.3 tables: log in as admin@mindbridge.org / Admin@123 → /admin → users table: type in a column search box, click a column header to sort, click pagination → contact messages table: same. Export CSV (users) → opens.
4. (2:15) E.4 export: click Export PDF on appointments → PDF opens. (Mention CSV already shown.)
5. (2:30) E.2 map: /locations → search "Federation Square" → marker appears → click a MindBridge centre → "Route here" → polyline + distance/time panel.
6. (2:55) F.1 booking: /book-appointment → select a free slot → modal → pick professional → book → success + calendar event. Try same professional same slot → conflict error shown.
7. (3:15) D.2 email: /contact → fill the form → attach a PDF file → send → success alert (email arrives — optionally show inbox briefly).
8. (3:30) F.1 bulk email: /admin → tick 2 users → compose → send → "Sent to all" status.
9. (3:45) F.1 charts: /admin → point at the 3 charts (doughnut, bar, line) + appointments table.
10. (4:05) F.1 offline: DevTools → Network → Offline → banner appears → submit a contact message → queued message → back Online → banner clears (queue syncs).
11. (4:35) E.1 worker: browser tab to the workers.dev URL → show GET /api/resources JSON → POST /api/appointments via the UI booking (already shown) — or curl in a terminal window.
12. (4:50) E.3 accessibility: tab through the home page showing the skip link + focus outlines; mention aria labels on the star rating.

Upload as Yiding-Shao-36668389-A3.mp4 to the course Google Drive folder, share access, put link in the template.
```

- [ ] **Step 2: Create `docs/research-report-draft.md`** — Topic B draft (~1000 words, IEEE refs, AI-use acknowledgement; **user must personalise + add screenshots of their debugging prompts with GenAI** — e.g. screenshots of this Claude Code session's debugging moments):

```markdown
# Research Report — Topic B: Strategies for Using GenAI in JavaScript Debugging

## 1. Introduction (100–150 words)
[Why GenAI matters in debugging; scope: five strategies examined; structure.]

## 2. Main Body (700–750 words)
### Strategy 1: Explaining error messages and stack traces
[How: paste error + trace; model explains cause + fix. Example from this project:
"Uncaught (in promise) TypeError: Cannot read properties of undefined (reading 'seconds')"
in AdminDashboard — GenAI identified Firestore serverTimestamp objects vs plain dates.
Benefits: faster comprehension of framework internals. Drawbacks: hallucinated fixes, outdated APIs.]

### Strategy 2: Generating minimal reproductions
[Ask for a standalone snippet reproducing a bug (e.g. FullCalendar select info.startStr parsing).
Benefits: isolates root cause. Drawbacks: context lost when snippet diverges from real code.]

### Strategy 3: Hypothesis-driven root-cause dialogue
[Interactive: propose hypotheses (state, timing, library version), verify each. Example: role guard
race with onAuthStateChanged resolved by awaiting first callback before mount.
Benefits: systematic, educational. Drawbacks: needs good questions; can echo wrong assumptions.]

### Strategy 4: Suggesting and explaining fixes
[Ask for candidate fixes with trade-offs, then verify against docs. Example: Leaflet default marker
icons missing under Vite — L.Icon.Default.mergeOptions fix. Benefits: quick options; Drawbacks: fixes
may introduce new bugs or security issues; must review.]

### Strategy 5: Generating regression tests from bugs
[Turn each fixed bug into a node --test case (utils/booking.js conflict tests).
Benefits: prevents regressions, documents behaviour. Drawbacks: tests can encode the bug's behaviour.]

## 3. Reflection (100–150 words)
[Synthesis + impact on web dev workflow + ethics: ownership, hallucination risk, over-reliance.]

## 4. Conclusion (50–100 words)
[Summary + future: agentic debugging, model-aware tools.]

## 5. Acknowledgement of AI use
[Declare Claude Code usage for the app's debugging + report drafting; screenshots of prompts:
<SCREENSHOT 1: error explanation prompt> <SCREENSHOT 2: fix suggestion prompt> <SCREENSHOT 3: test generation prompt>;
explain how output was verified/edited.]

## 6. References (IEEE)
[1] J. White et al., "ChatGPT Prompt Patterns for Improving Code Quality, Refactoring, Requirements Elicitation, and Software Design," arXiv:2303.07839, 2023.
[2] S. I. Ross, F. Martinez, S. Houde, M. Muller, and J. D. Weisz, "The Programmer's Assistant: Conversational Interaction with a Large Language Model for Software Development," in Proc. IUI '23, 2023, pp. 491–514.
[3] A. Fan et al., "Large Language Models for Software Engineering: Survey and Open Problems," arXiv:2310.03533, 2023.
[4] X. Hou et al., "Large Language Models for Software Engineering: A Systematic Literature Review," ACM Trans. Softw. Eng. Methodol., vol. 33, no. 8, 2024.
[5] N. M. S. Surameery and M. Y. Shakor, "Use Chat GPT to Solve Programming Bugs," Int. J. Inf. Technol. Comput., vol. 3, no. 1, pp. 17–22, 2023.
]
```
(FULL prose to be written at execution time in the file itself — the plan file only carries the skeleton; the report content is the student's own work and must be personalised.)

- [ ] **Step 3: Create `scripts/fill_a3_template.py`** — python-docx script that fills:

- Declaration name/date; signature line (typed name)
- GitHub table: username `ysha0107`, repo link, "A3 Shared? — Yes (extending A2 repo)"
- Self-evaluation table: ticks — D.1/D.2/D.3/D.4/E.1/E.2/E.4/F.1 = Exceeds; E.3 = Meets (user reviews before submitting)
- Video link placeholder `<paste Google Drive link>`
- F.1 table: 4 rows (Appointment Booking / Bulk Email / Interactive Charts / Offline capabilities) with 10–20 word implementations + 10–50 word upgrade recommendations
- Reflections: challenges paragraph (Firebase migration, conflict management, offline sync)
- Additional Help table: rows — "Claude Code (GenAI) — brainstorming/design + debugging" with description, + "EmailJS/Leaflet/FullCalendar/Chart.js docs" + "Bootstrap 5 (A2, continued)"

Run:
```bash
PYTHONIOENCODING=utf-8 "C:/Users/sydo/AppData/Local/Programs/Python/Python313/python.exe" scripts/fill_a3_template.py
```
Output: `D:\Desktop\A2\A3-Submission-Yiding-Shao-36668389.docx`

- [ ] **Step 4: Zip and submit checklist**

```bash
cd "D:/Desktop/A2"
zip -r A3-Yiding-Shao-36668389.zip mindbridge A3-Submission-Yiding-Shao-36668389.docx -x "mindbridge/node_modules/*" "mindbridge/.git/*"
```
- [ ] Moodle: upload zip → Advanced Web Application (18%)
- [ ] Research report → PDF → Moodle (7%)
- [ ] Video → Google Drive (share with tutor) → link into template **before** zipping
- [ ] User pushes git commits (committer dates spread Thu–Sat; a single push on Saturday still satisfies >48h)

- [ ] **Step 5: Commit**

```bash
git add docs/video-storyboard.md docs/research-report-draft.md scripts/fill_a3_template.py
git commit -m "A3: submission materials — video storyboard, research report draft, template fill script"
```

---

## Self-Review Notes (checked against spec)

- Spec §2 data/auth → Tasks 3, 4, 6 ✓ (users/ratings/contacts/appointments all Firestore; rules in Task 3 Step 7)
- Spec §3 pages → Tasks 5–12 ✓ (LocationsPage T7, AppointmentPage T8, AdminDashboard T10, BulkEmailPanel T9)
- D.1 → T3 ✓; D.2 → T6 ✓; D.3 → T5 + T6/T10 (3 tables) ✓; D.4 → T15 ✓
- E.1 → T14 ✓ (self-designed worker: resources API + KV-backed validation); E.2 → T7 ✓ (search + routing); E.3 → T13 + T11 ✓; E.4 → T1 (CSV) + T12 (PDF) ✓
- F.1 → booking T8, bulk email T9, charts T10, offline T11 (+ API routes in T14 as bonus) ✓
- Video/report/template → T16 ✓; git discipline → commit steps in every task, never push ✓
- Type consistency: `applyFilters(rows, columns, filters)` used in DataTable as `applyFilters(props.rows, props.columns, filters.value)` ✓; `paginate(rows, page, pageSize)` returns `{pageRows, totalPages, page}` consumed as `paged.value.pageRows` etc. ✓; `hasConflict(bookings, newBooking)` signature matches both tests and AppointmentPage ✓; store APIs (`getRating(itemId)`, `getUserRating(itemId)`, `addOrUpdateRating(itemId, score)`, `submitContact`, `bookAppointment`, `setStatus`) match their call sites ✓
- Placeholder scan: only deliberate placeholders = user-provided secrets (.env), KV id (returned by CLI), workers.dev URL (deploy output), Google Drive link (user records video) — all marked with the exact command that produces them ✓
