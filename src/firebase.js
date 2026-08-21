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
