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
const allUsers = ref([])               // Firestore users collection (admin-only pages)
let authReadyResolve
// Resolved after the FIRST onAuthStateChanged callback (profile fetched).
// main.js awaits this before mounting so the router guard is synchronous.
export const authReady = new Promise((resolve) => { authReadyResolve = resolve })

let usersUnsub = null

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
      // Start the users snapshot only while signed in (rules require auth;
      // avoids permission errors on public pages for logged-out visitors)
      if (!usersUnsub) {
        usersUnsub = onSnapshot(collection(db, 'users'), (snap) => {
          allUsers.value = snap.docs.map((d) => ({ uid: d.id, ...d.data() }))
        }, () => {})
      }
    } catch (e) {
      // Firestore unreachable (e.g. VPN off) — clear session so UI shows login
      console.error('Profile load failed:', e)
      currentUser.value = null
    }
  } else {
    currentUser.value = null
    if (usersUnsub) { usersUnsub(); usersUnsub = null }
    allUsers.value = []
  }
  authReadyResolve()
})

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
