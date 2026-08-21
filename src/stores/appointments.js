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

// Lazy init: only authenticated pages (booking, admin) read appointments.
let unsubscribed = null
export function initAppointments() {
  if (unsubscribed) return
  unsubscribed = onSnapshot(collection(db, 'appointments'), (snap) => {
    appointments.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  }, () => {})
}

export function useAppointmentsStore() {
  initAppointments()
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
