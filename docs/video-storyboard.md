# A3 Video Storyboard (3–5 min, no audio needed)

**Before recording:** VPN ON, browser logged out of the app, DevTools console CLOSED (open only for the offline step), zoom 100%, record full screen 1920×1080. Deployed URL: `<pages.dev URL from Task 15>`.

| # | Time | BR | Action on screen |
|---|------|-----|------------------|
| 1 | 0:00 | — | Open the deployed URL → scroll home page (hero, stats, services, resources, footer) |
| 2 | 0:30 | D.1 | `/login` → show the **Google button** → log in as `sarah@example.com` / `Sarah@123` → dashboard with role badge. Log out. `/register` → fill the form (shows live validation) → create a new account → lands on dashboard (Firestore profile). Log out. |
| 3 | 1:30 | D.3 | Log in as `admin@mindbridge.org` / `Admin@123` → `/admin` → **Users table**: type in a column search box → click a column header to sort → click pagination → same demo on **Contact Messages** table → **Export CSV** (file downloads). |
| 4 | 2:15 | E.4 | Click **Export PDF** on the Appointments table → PDF opens. |
| 5 | 2:30 | E.2 | `/locations` → search "Federation Square" → marker flies in → click a MindBridge centre marker → **Route here** → blue polyline + distance/time panel. |
| 6 | 2:55 | F.1#1 | `/book-appointment` → select a future slot → modal → pick a professional → Book → success + event on calendar. **Try the same professional + same slot again → conflict error.** |
| 7 | 3:15 | D.2 | `/contact` → fill the form → **attach a PDF file** → Send → success alert. (Optionally open your inbox to show the email arrived with the attachment.) |
| 8 | 3:30 | F.1#2 | `/admin` → **tick 2 users** in the users table → compose subject + message → Send → "Sent to all 2 recipient(s)". |
| 9 | 3:45 | F.1#3 | `/admin` → point at the 3 charts (users by role doughnut, average rating bar, appointments per week line) + stat cards. |
| 10 | 4:05 | F.1#4 | Open DevTools → Network → **Offline** → amber banner appears → submit a contact message → "queued" note → back **Online** → banner clears and the message syncs to Firestore (show it in the admin contacts table). |
| 11 | 4:35 | E.1 | Browser tab to the workers.dev URL → show `GET /api/resources` JSON → a terminal `curl -X POST /api/appointments` returning 201, then the same POST returning **409 conflict** |
| 12 | 4:50 | E.3 | Tab through the home page: **skip link** appears → focus outlines visible → star rating keyboard-operable |

**Upload:** `Yiding-Shao-36668389-A3.mp4` → course Google Drive folder (share with tutor / anyone with Monash account) → paste link into the submission template.
