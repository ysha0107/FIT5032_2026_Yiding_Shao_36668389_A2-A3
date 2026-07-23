import { ref, computed } from 'vue'

// Auth store using localStorage for persistence
const STORAGE_KEY = 'mindbridge_users'
const CURRENT_USER_KEY = 'mindbridge_current_user'

// Reactive state
const currentUser = ref(JSON.parse(localStorage.getItem(CURRENT_USER_KEY) || 'null'))
const users = ref(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'))

// Ensure there's at least one admin user for testing
function ensureDefaultUsers() {
  if (users.value.length === 0) {
    const defaultUsers = [
      {
        id: 1,
        name: 'Admin User',
        email: 'admin@mindbridge.org',
        password: hashPasswordSync('Admin@123'),
        role: 'admin',
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        name: 'Sarah Client',
        email: 'sarah@example.com',
        password: hashPasswordSync('Sarah@123'),
        role: 'client',
        createdAt: new Date().toISOString()
      }
    ]
    users.value = defaultUsers
    saveUsers()
  }
}

// Simple password hashing using SubtleCrypto-compatible approach
// In browser, we use a simple hash for localStorage (not for production!)
function hashPasswordSync(password) {
  // For the purpose of this assignment, use a simple but effective approach
  // This avoids storing plain-text passwords in localStorage
  let hash = 0
  const salt = 'mindbridge_salt_2024'
  const combined = password + salt
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0
  }
  return 'mb_' + Math.abs(hash).toString(36) + '_' + btoa(password).substring(0, 8)
}

function verifyPassword(password, hash) {
  return hashPasswordSync(password) === hash
}

function saveUsers() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users.value))
}

function saveCurrentUser() {
  if (currentUser.value) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser.value))
  } else {
    localStorage.removeItem(CURRENT_USER_KEY)
  }
}

// Initialize
ensureDefaultUsers()

// Composable
export function useAuthStore() {
  const isLoggedIn = computed(() => currentUser.value !== null)
  const userRole = computed(() => currentUser.value?.role || null)
  const userName = computed(() => currentUser.value?.name || null)

  function register(name, email, password, role = 'client') {
    // Check if email already exists
    if (users.value.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, error: 'An account with this email already exists.' }
    }

    const newUser = {
      id: users.value.length > 0 ? Math.max(...users.value.map(u => u.id)) + 1 : 1,
      name: sanitizeInput(name),
      email: sanitizeInput(email.toLowerCase().trim()),
      password: hashPasswordSync(password),
      role: role,
      createdAt: new Date().toISOString()
    }

    users.value.push(newUser)
    saveUsers()
    return { success: true }
  }

  function login(email, password) {
    const user = users.value.find(u => u.email.toLowerCase() === email.toLowerCase().trim())
    if (!user) {
      return { success: false, error: 'No account found with this email address.' }
    }
    if (!verifyPassword(password, user.password)) {
      return { success: false, error: 'Incorrect password. Please try again.' }
    }

    // Store user info WITHOUT password
    const { password: _, ...safeUser } = user
    currentUser.value = safeUser
    saveCurrentUser()
    return { success: true }
  }

  function logout() {
    currentUser.value = null
    saveCurrentUser()
  }

  function getAllUsers() {
    return users.value.map(({ password: _, ...rest }) => rest)
  }

  function getUserCount() {
    return users.value.length
  }

  function getUserCountByRole() {
    const counts = {}
    users.value.forEach(u => {
      counts[u.role] = (counts[u.role] || 0) + 1
    })
    return counts
  }

  // XSS prevention: strip HTML tags from input
  function sanitizeInput(input) {
    if (!input) return ''
    return input.replace(/<[^>]*>/g, '').trim()
  }

  return {
    currentUser,
    isLoggedIn,
    userRole,
    userName,
    register,
    login,
    logout,
    getAllUsers,
    getUserCount,
    getUserCountByRole
  }
}
