<script setup>
import { computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRatingsStore } from '../stores/ratings'
import { useServicesStore } from '../stores/services'

const { currentUser, userName, getAllUsers, getUserCount, getUserCountByRole, logout } = useAuthStore()
const { getAllRatings } = useRatingsStore()
const { services } = useServicesStore()

const allUsers = computed(() => getAllUsers())
const totalUsers = computed(() => getUserCount())
const usersByRole = computed(() => getUserCountByRole())
const allRatings = computed(() => getAllRatings())

const totalServices = computed(() => services.value.length)
const totalRatings = computed(() => Object.keys(allRatings.value).length)

const contactMessages = computed(() => {
  return JSON.parse(localStorage.getItem('mindbridge_contacts') || '[]')
})

const recentUsers = computed(() => {
  return allUsers.value.slice(-5).reverse()
})
</script>

<template>
  <div class="admin-page page-section bg-calm min-vh-100-minus-nav">
    <div class="container">
      <!-- Header -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="card card-mindbridge p-4 border-start border-4 border-warning">
            <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
              <div>
                <h2 class="mb-1">⚙️ Admin Dashboard</h2>
                <p class="text-muted mb-0">
                  System overview for <strong>{{ userName }}</strong>
                </p>
              </div>
              <div class="d-flex gap-2">
                <router-link to="/dashboard" class="btn btn-mindbridge-outline btn-sm">
                  My Dashboard
                </router-link>
                <button @click="logout" class="btn btn-outline-secondary btn-sm">Logout</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="row g-4 mb-4">
        <div class="col-lg-3 col-md-6">
          <div class="card card-mindbridge p-4 text-center">
            <div class="h1 text-primary mb-0">{{ totalUsers }}</div>
            <div class="text-muted">Total Users</div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6">
          <div class="card card-mindbridge p-4 text-center">
            <div class="h1 text-success mb-0">{{ totalServices }}</div>
            <div class="text-muted">Services Offered</div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6">
          <div class="card card-mindbridge p-4 text-center">
            <div class="h1 text-warning mb-0">{{ totalRatings }}</div>
            <div class="text-muted">Rated Services</div>
          </div>
        </div>
        <div class="col-lg-3 col-md-6">
          <div class="card card-mindbridge p-4 text-center">
            <div class="h1 text-info mb-0">{{ contactMessages.length }}</div>
            <div class="text-muted">Contact Messages</div>
          </div>
        </div>
      </div>

      <!-- User Breakdown & System Info -->
      <div class="row g-4 mb-4">
        <!-- Users by Role -->
        <div class="col-lg-6">
          <div class="card card-mindbridge p-4 h-100">
            <h5>👥 Users by Role</h5>
            <div class="mt-3">
              <div v-for="(count, role) in usersByRole" :key="role" class="d-flex justify-content-between mb-3">
                <span>
                  <span class="badge bg-soft-primary text-primary me-2">{{ role }}</span>
                </span>
                <div class="d-flex align-items-center gap-2" style="min-width: 60%;">
                  <div class="progress flex-grow-1" style="height: 8px;">
                    <div
                      class="progress-bar"
                      :class="role === 'admin' ? 'bg-warning' : role === 'professional' ? 'bg-info' : 'bg-primary'"
                      :style="{ width: (count / totalUsers * 100) + '%' }"
                    ></div>
                  </div>
                  <strong>{{ count }}</strong>
                </div>
              </div>
              <div v-if="Object.keys(usersByRole).length === 0" class="text-muted text-center py-3">
                No user data available.
              </div>
            </div>
          </div>
        </div>

        <!-- System Overview -->
        <div class="col-lg-6">
          <div class="card card-mindbridge p-4 h-100">
            <h5>🔧 System Overview</h5>
            <ul class="list-group list-group-flush mt-2">
              <li class="list-group-item d-flex justify-content-between">
                <span>Authentication Method</span>
                <span class="badge bg-light text-dark">Local (localStorage)</span>
              </li>
              <li class="list-group-item d-flex justify-content-between">
                <span>Role-Based Access</span>
                <span class="badge bg-success">Active</span>
              </li>
              <li class="list-group-item d-flex justify-content-between">
                <span>Rating System</span>
                <span class="badge bg-success">Active</span>
              </li>
              <li class="list-group-item d-flex justify-content-between">
                <span>Input Validation</span>
                <span class="badge bg-success">Active</span>
              </li>
              <li class="list-group-item d-flex justify-content-between">
                <span>XSS Protection</span>
                <span class="badge bg-success">Active</span>
              </li>
              <li class="list-group-item d-flex justify-content-between">
                <span>Data Storage</span>
                <span class="badge bg-light text-dark">localStorage</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Recent Users Table -->
      <div class="row">
        <div class="col-12">
          <div class="card card-mindbridge p-4">
            <h5>📋 Recent Users</h5>
            <div class="table-responsive mt-3">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="user in recentUsers" :key="user.id">
                    <td>{{ user.id }}</td>
                    <td>{{ user.name }}</td>
                    <td>{{ user.email }}</td>
                    <td>
                      <span
                        class="badge"
                        :class="user.role === 'admin' ? 'bg-warning text-dark' : 'bg-soft-primary text-primary'"
                      >
                        {{ user.role }}
                      </span>
                    </td>
                    <td><small>{{ new Date(user.createdAt).toLocaleDateString() }}</small></td>
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
.border-4 {
  border-width: 4px !important;
}
</style>
