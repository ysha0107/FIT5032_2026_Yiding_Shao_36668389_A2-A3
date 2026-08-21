<script setup>
import { ref, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const { register } = useAuthStore()

const form = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'client'
})

const errorMessage = ref('')
const successMessage = ref('')
const isLoading = ref(false)
const submitted = ref(false)

// Validation — Type 1: Email format
const emailError = computed(() => {
  if (!form.email && !submitted.value) return ''
  if (!form.email) return 'Email is required.'
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(form.email) ? '' : 'Please enter a valid email address.'
})

// Validation — Type 2: Password strength
const passwordError = computed(() => {
  if (!form.password && !submitted.value) return ''
  if (!form.password) return 'Password is required.'
  if (form.password.length < 8) return 'Password must be at least 8 characters long.'
  if (!/[A-Z]/.test(form.password)) return 'Password must contain at least one uppercase letter.'
  if (!/[0-9]/.test(form.password)) return 'Password must contain at least one number.'
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(form.password)) return 'Password must contain at least one special character.'
  return ''
})

const confirmError = computed(() => {
  if (!form.confirmPassword && !submitted.value) return ''
  if (!form.confirmPassword) return 'Please confirm your password.'
  if (form.password !== form.confirmPassword) return 'Passwords do not match.'
  return ''
})

const nameError = computed(() => {
  if (!form.name && !submitted.value) return ''
  if (!form.name.trim()) return 'Name is required.'
  if (form.name.trim().length < 2) return 'Name must be at least 2 characters.'
  return ''
})

const isFormValid = computed(() => {
  return form.name.trim().length >= 2 &&
         !emailError.value &&
         !passwordError.value &&
         !confirmError.value &&
         form.password === form.confirmPassword
})

async function handleRegister() {
  submitted.value = true
  errorMessage.value = ''
  successMessage.value = ''

  if (!isFormValid.value) {
    errorMessage.value = 'Please fix the errors below before submitting.'
    return
  }

  isLoading.value = true
  const result = await register(form.name, form.email, form.password, form.role)
  isLoading.value = false
  if (result.success) {
    successMessage.value = 'Account created successfully! Redirecting to your dashboard...'
    setTimeout(() => {
      router.push('/dashboard')
    }, 1500)
  } else {
    errorMessage.value = result.error
  }
}
</script>

<template>
  <div class="page-section bg-calm">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-lg-6 col-md-8">
          <div class="card card-mindbridge p-4">
            <div class="text-center mb-4">
              <span style="font-size: 3rem;">🧠</span>
              <h2 class="mt-2">Join MindBridge</h2>
              <p class="text-muted">Create your account and start your wellness journey</p>
            </div>

            <!-- Error Message -->
            <div v-if="errorMessage" class="alert alert-danger alert-dismissible fade show" role="alert">
              {{ errorMessage }}
              <button type="button" class="btn-close" @click="errorMessage = ''" aria-label="Close"></button>
            </div>

            <!-- Success Message -->
            <div v-if="successMessage" class="alert alert-success" role="alert">
              {{ successMessage }}
            </div>

            <form @submit.prevent="handleRegister" novalidate>
              <!-- Name -->
              <div class="mb-3">
                <label for="reg-name" class="form-label">Full Name</label>
                <input
                  id="reg-name"
                  v-model="form.name"
                  type="text"
                  class="form-control"
                  :class="{ 'input-error': nameError, 'input-valid': form.name && !nameError }"
                  placeholder="Your full name"
                  autocomplete="name"
                  required
                
                  :aria-invalid="!!nameError"
                  :aria-describedby="nameError ? 'reg-name-error' : null"
                />
                <div v-if="nameError" id="reg-name-error" class="error-message">{{ nameError }}</div>
              </div>

              <!-- Email -->
              <div class="mb-3">
                <label for="reg-email" class="form-label">Email address</label>
                <input
                  id="reg-email"
                  v-model="form.email"
                  type="email"
                  class="form-control"
                  :class="{ 'input-error': emailError, 'input-valid': form.email && !emailError }"
                  placeholder="you@example.com"
                  autocomplete="email"
                  required
                
                  :aria-invalid="!!emailError"
                  :aria-describedby="emailError ? 'reg-email-error' : null"
                />
                <div v-if="emailError" id="reg-email-error" class="error-message">{{ emailError }}</div>
              </div>

              <!-- Password -->
              <div class="mb-3">
                <label for="reg-password" class="form-label">Password</label>
                <input
                  id="reg-password"
                  v-model="form.password"
                  type="password"
                  class="form-control"
                  :class="{ 'input-error': passwordError, 'input-valid': form.password && !passwordError }"
                  placeholder="Create a strong password"
                  autocomplete="new-password"
                  required
                
                  :aria-invalid="!!passwordError"
                  :aria-describedby="passwordError ? 'reg-password-error' : null"
                />
                <div v-if="passwordError" id="reg-password-error" class="error-message">{{ passwordError }}</div>
                <div v-else-if="form.password && !passwordError" class="success-message">Password strength: Good ✓</div>
                <small class="text-muted">Min 8 characters, 1 uppercase, 1 number, 1 special character.</small>
              </div>

              <!-- Confirm Password -->
              <div class="mb-3">
                <label for="reg-confirm" class="form-label">Confirm Password</label>
                <input
                  id="reg-confirm"
                  v-model="form.confirmPassword"
                  type="password"
                  class="form-control"
                  :class="{ 'input-error': confirmError, 'input-valid': form.confirmPassword && !confirmError }"
                  placeholder="Repeat your password"
                  autocomplete="new-password"
                  required
                
                  :aria-invalid="!!confirmError"
                  :aria-describedby="confirmError ? 'reg-confirm-error' : null"
                />
                <div v-if="confirmError" id="reg-confirm-error" class="error-message">{{ confirmError }}</div>
                <div v-else-if="form.confirmPassword && !confirmError" class="success-message">Passwords match ✓</div>
              </div>

              <!-- Role Selection -->
              <div class="mb-3">
                <label for="reg-role" class="form-label">Account Type</label>
                <select id="reg-role" v-model="form.role" class="form-select">
                  <option value="client">Client — I want to access mental health resources</option>
                  <option value="volunteer">Volunteer — I want to help others</option>
                  <option value="professional">Health Professional — I want to support my clients</option>
                </select>
              </div>

              <button
                type="submit"
                class="btn btn-mindbridge w-100 mt-3"
                :disabled="submitted && !isFormValid || isLoading"
              >
                <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                Create Account
              </button>
            </form>

            <div class="text-center mt-3">
              <p class="mb-0">
                Already have an account?
                <router-link to="/login">Sign in</router-link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.form-label {
  font-weight: 500;
  color: var(--mindbridge-heading);
}
</style>
