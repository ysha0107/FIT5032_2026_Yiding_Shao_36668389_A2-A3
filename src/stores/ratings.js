// Aggregated rating store — Firestore-backed (BR C.3, data source for F.1 charts)
import { ref } from 'vue'
import { collection, doc, getDoc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore'
import { auth, db } from '../firebase'
import { enqueue, registerFlusher } from './network'

const ratings = ref([]) // [{ id, itemId, userId, score, createdAt, updatedAt? }]

let unsubscribed = null
export function initRatings() {
  if (unsubscribed) return
  unsubscribed = onSnapshot(collection(db, 'ratings'), (snap) => {
    ratings.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  }, () => {})
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
