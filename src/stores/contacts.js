// Contact messages — Firestore-backed; public form may submit, admin reads (D.2/D.3)
import { ref } from 'vue'
import { collection, addDoc, serverTimestamp, onSnapshot, deleteDoc, doc } from 'firebase/firestore'
import { db } from '../firebase'
import { enqueue, registerFlusher } from './network'

const contacts = ref([])

// Lazy init: contacts are admin-readable only, so subscribe on first use
// (the AdminDashboard) rather than at module load on every page.
let unsubscribed = null
export function initContacts() {
  if (unsubscribed) return
  unsubscribed = onSnapshot(collection(db, 'contacts'), (snap) => {
    contacts.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  }, () => {})
}

export function useContactsStore() {
  initContacts()
  async function submitContact({ name, email, subject, message, enquiryType, attachmentName = '', attachmentSize = 0 }) {
    const payload = {
      name, email, subject, message, enquiryType,
      attachmentName, attachmentSize,
      date: serverTimestamp()
    }
    if (!navigator.onLine) {
      enqueue('contacts', { ...payload, date: null })
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
