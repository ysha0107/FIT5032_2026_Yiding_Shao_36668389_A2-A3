<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'

const { currentUser, isLoggedIn, userName, logout } = useAuthStore()
const isMenuOpen = ref(false)

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value
}

function closeMenu() {
  isMenuOpen.value = false
}

function handleLogout() {
  logout()
  closeMenu()
}
</script>

<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top">
    <div class="container">
      <router-link to="/" class="navbar-brand d-flex align-items-center" @click="closeMenu">
        <span class="brand-icon">🧠</span>
        <span class="brand-text">MindBridge</span>
      </router-link>

      <button
        class="navbar-toggler border-0"
        type="button"
        @click="toggleMenu"
        :aria-expanded="isMenuOpen"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" :class="{ show: isMenuOpen }">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <router-link to="/" class="nav-link" @click="closeMenu">Home</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/about" class="nav-link" @click="closeMenu">About Us</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/resources" class="nav-link" @click="closeMenu">Resources</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/services" class="nav-link" @click="closeMenu">Services</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/get-involved" class="nav-link" @click="closeMenu">Get Involved</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/contact" class="nav-link" @click="closeMenu">Contact</router-link>
          </li>
        </ul>

        <div class="d-flex align-items-center gap-2">
          <template v-if="isLoggedIn">
            <router-link to="/dashboard" class="btn btn-mindbridge-outline btn-sm" @click="closeMenu">
              Dashboard
            </router-link>
            <span class="text-muted d-none d-lg-inline">|</span>
            <button class="btn btn-outline-secondary btn-sm" @click="handleLogout">
              Logout ({{ userName }})
            </button>
          </template>
          <template v-else>
            <router-link to="/login" class="btn btn-mindbridge-outline btn-sm" @click="closeMenu">
              Login
            </router-link>
            <router-link to="/register" class="btn btn-mindbridge btn-sm" @click="closeMenu">
              Register
            </router-link>
          </template>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.brand-icon {
  font-size: 1.6rem;
  margin-right: 8px;
}
.brand-text {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--mindbridge-heading);
}
.navbar {
  border-bottom: 3px solid var(--mindbridge-primary);
}
.nav-link {
  color: var(--mindbridge-text) !important;
  font-weight: 500;
  padding: 0.5rem 1rem !important;
  transition: color 0.2s;
}
.nav-link:hover,
.nav-link.router-link-exact-active {
  color: var(--mindbridge-primary) !important;
}
@media (max-width: 991px) {
  .navbar-collapse {
    padding: 1rem 0;
  }
  .d-flex.align-items-center {
    flex-direction: column;
    align-items: stretch !important;
    gap: 0.5rem;
  }
}
</style>
