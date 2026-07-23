<script setup>
import { computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRatingsStore } from '../stores/ratings'

const { currentUser, userName, userRole, logout } = useAuthStore()
const { getRating } = useRatingsStore()

// Get some data for the dashboard
const contactMessages = computed(() => {
  return JSON.parse(localStorage.getItem('mindbridge_contacts') || '[]')
})

const recentContacts = computed(() => {
  return contactMessages.value.slice(-5).reverse()
})
</script>

<template>
  <div class="dashboard-page page-section bg-calm min-vh-100-minus-nav">
    <div class="container">
      <!-- Welcome Header -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="card card-mindbridge p-4">
            <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
              <div>
                <h2 class="mb-1">Welcome back, {{ userName }}!</h2>
                <p class="text-muted mb-0">
                  Role: <span class="badge bg-soft-primary text-primary">{{ userRole }}</span>
                </p>
              </div>
              <div class="d-flex gap-2">
                <router-link v-if="userRole === 'admin'" to="/admin" class="btn btn-accent btn-sm">
                  Admin Dashboard
                </router-link>
                <button @click="logout" class="btn btn-outline-secondary btn-sm">Logout</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Dashboard Content based on role -->
      <div class="row g-4">
        <!-- Quick Links -->
        <div class="col-lg-4 col-md-6">
          <div class="card card-mindbridge p-4 h-100">
            <h5>🔗 Quick Links</h5>
            <ul class="list-unstyled mt-3 mb-0">
              <li class="mb-2">
                <router-link to="/services" class="d-flex align-items-center gap-2">
                  🧠 Browse Services
                </router-link>
              </li>
              <li class="mb-2">
                <router-link to="/resources" class="d-flex align-items-center gap-2">
                  📚 Explore Resources
                </router-link>
              </li>
              <li class="mb-2">
                <router-link to="/contact" class="d-flex align-items-center gap-2">
                  📧 Contact Support
                </router-link>
              </li>
              <li>
                <router-link to="/get-involved" class="d-flex align-items-center gap-2">
                  🤝 Get Involved
                </router-link>
              </li>
            </ul>
          </div>
        </div>

        <!-- Account Info -->
        <div class="col-lg-4 col-md-6">
          <div class="card card-mindbridge p-4 h-100">
            <h5>👤 Account Information</h5>
            <div class="mt-3">
              <div class="mb-2">
                <strong>Name:</strong> {{ currentUser?.name }}
              </div>
              <div class="mb-2">
                <strong>Email:</strong> {{ currentUser?.email }}
              </div>
              <div class="mb-2">
                <strong>Role:</strong> {{ currentUser?.role }}
              </div>
              <div class="mb-2">
                <strong>Member Since:</strong> {{ currentUser?.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : 'N/A' }}
              </div>
            </div>
          </div>
        </div>

        <!-- Activity / Stats -->
        <div class="col-lg-4 col-md-12">
          <div class="card card-mindbridge p-4 h-100">
            <h5>📊 Your Wellness Journey</h5>
            <div class="mt-3">
              <div class="d-flex justify-content-between mb-2">
                <span>Resources Read</span>
                <strong>3</strong>
              </div>
              <div class="progress mb-3" style="height: 6px;">
                <div class="progress-bar bg-primary" style="width: 30%;"></div>
              </div>
              <div class="d-flex justify-content-between mb-2">
                <span>Services Accessed</span>
                <strong>1</strong>
              </div>
              <div class="progress mb-3" style="height: 6px;">
                <div class="progress-bar bg-success" style="width: 16%;"></div>
              </div>
              <div class="d-flex justify-content-between mb-2">
                <span>Days Active</span>
                <strong>7</strong>
              </div>
              <div class="progress mb-3" style="height: 6px;">
                <div class="progress-bar bg-warning" style="width: 23%;"></div>
              </div>
              <p class="text-muted small mt-3 mb-0">
                🌱 Every step forward is progress. Keep going!
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activity (conditional by role) -->
      <div class="row mt-4" v-if="recentContacts.length > 0">
        <div class="col-12">
          <div class="card card-mindbridge p-4">
            <h5>📬 Recent Contact Submissions</h5>
            <div class="table-responsive mt-3">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Name</th>
                    <th>Subject</th>
                    <th>Type</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="msg in recentContacts" :key="msg.id">
                    <td><small>{{ new Date(msg.date).toLocaleDateString() }}</small></td>
                    <td>{{ msg.name }}</td>
                    <td>{{ msg.subject }}</td>
                    <td><span class="badge bg-light text-muted">{{ msg.enquiryType }}</span></td>
                  </tr>
                </tbody>
              </table>
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
}
.bg-soft-primary {
  background: rgba(44, 111, 143, 0.1);
}
</style>
