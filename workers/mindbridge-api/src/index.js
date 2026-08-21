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

// All bookings live in ONE KV key (JSON array). KV `list()` is eventually
// consistent (up to 60s), which would break conflict detection for rapid
// back-to-back bookings — a single-key read after write is consistent.
async function getAllAppointments(env) {
  const raw = await env.MINDBRIDGE_KV.get('appointments')
  return raw ? JSON.parse(raw) : []
}

function findConflict(all, payload) {
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
      const all = await getAllAppointments(env)
      if (findConflict(all, payload)) {
        return json({ error: 'Conflict: the professional is already booked for that time slot.' }, 409)
      }
      const id = payload.id || crypto.randomUUID()
      const booking = { id, ...payload, status: 'confirmed', createdAt: new Date().toISOString() }
      all.push(booking)
      // Read-modify-write on one key; fine at assignment scale (race notes in README)
      await env.MINDBRIDGE_KV.put('appointments', JSON.stringify(all))
      return json({ ok: true, id }, 201)
    }

    // GET /api/appointments — list (demo/admin debugging)
    if (url.pathname === '/api/appointments' && request.method === 'GET') {
      return json({ appointments: await getAllAppointments(env) })
    }

    // POST /api/email — server-side email with attachment via Resend (D.2).
    // The API key lives in a Worker secret; only the charity inbox may receive,
    // which prevents open-relay abuse of the free quota.
    if (url.pathname === '/api/email' && request.method === 'POST') {
      let p
      try { p = await request.json() } catch { return json({ error: 'Invalid JSON body' }, 400) }
      if (!p.to || !p.subject || !p.text) return json({ error: 'Missing required fields (to, subject, text).' }, 400)
      if (p.to !== env.ADMIN_EMAIL) return json({ error: 'Recipient not allowed.' }, 403)
      if (!env.RESEND_API_KEY) return json({ error: 'Email service not configured.' }, 503)

      const payload = {
        from: 'MindBridge Health Foundation <onboarding@resend.dev>',
        to: [p.to],
        subject: `[MindBridge] ${p.subject}`.slice(0, 120),
        text: p.text.slice(0, 10000),
        ...(p.fromEmail ? { reply_to: p.fromEmail } : {})
      }
      if (p.attachment && p.attachment.contentBase64) {
        payload.attachments = [{
          filename: String(p.attachment.filename || 'attachment.txt').slice(0, 200),
          content: p.attachment.contentBase64
        }]
      }
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) return json({ ok: true, id: data.id }, 200)
      return json({ error: data.message || 'Email send failed' }, 502)
    }

    return json({ error: 'Not found' }, 404)
  }
}
