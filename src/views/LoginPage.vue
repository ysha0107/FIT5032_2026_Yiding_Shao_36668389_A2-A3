<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const route = useRoute()
const { login, loginWithGoogle } = useAuthStore()

const email = ref('')
const password = ref('')
const errorMessage = ref('')
const isLoading = ref(false)

// Validation
const emailError = computed(() => {
  if (!email.value) return ''
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.value) ? '' : 'Please enter a valid email address.'
})

const isFormValid = computed(() => {
  return email.value.trim() && password.value && !emailError.value
})

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
</script>

<template>
  <div class="page-section bg-calm min-vh-100-minus-nav">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-lg-5 col-md-7">
          <div class="card card-mindbridge p-4">
            <div class="text-center mb-4">
              <span style="font-size: 3rem;">🧠</span>
              <h2 class="mt-2">Welcome Back</h2>
              <p class="text-muted">Sign in to your MindBridge account</p>
            </div>

            <!-- Error Message -->
            <div v-if="errorMessage" class="alert alert-danger alert-dismissible fade show" role="alert">
              {{ errorMessage }}
              <button type="button" class="btn-close" @click="errorMessage = ''" aria-label="Close"></button>
            </div>

            <form @submit.prevent="handleLogin" novalidate>
              <div class="mb-3">
                <label for="login-email" class="form-label">Email address</label>
                <input
                  id="login-email"
                  v-model="email"
                  type="email"
                  class="form-control"
                  :class="{ 'input-error': emailError }"
                  placeholder="you@example.com"
                  autocomplete="email"
                  required
                
                  :aria-invalid="!!emailError"
                  :aria-describedby="emailError ? 'login-email-error' : null"
                />
                <div v-if="emailError" id="login-email-error" class="error-message">{{ emailError }}</div>
              </div>

              <div class="mb-3">
                <label for="login-password" class="form-label">Password</label>
                <input
                  id="login-password"
                  v-model="password"
                  type="password"
                  class="form-control"
                  placeholder="Enter your password"
                  autocomplete="current-password"
                  required
                />
              </div>

              <button
                type="submit"
                class="btn btn-mindbridge w-100 mt-2"
                :disabled="!isFormValid || isLoading"
              >
                <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                Sign In
              </button>

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
            </form>

            <div class="text-center mt-3">
              <p class="mb-0">
                Don't have an account?
                <router-link to="/register">Create one here</router-link>
              </p>
            </div>

            <!-- Demo credentials hint -->
            <div class="mt-3 p-3 rounded" style="background: #f0f8ff;">
              <small class="text-muted">
                <strong>Demo Accounts:</strong><br>
                Admin: admin@mindbridge.org / Admin@123<br>
                Client: sarah@example.com / Sarah@123
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.min-vh-100-minus-nav {
  min-height: calc(100vh - 200px);
  display: flex;
  align-items: center;
}
</style>
