<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import Chart from 'chart.js/auto'
import DataTable from '../components/DataTable.vue'
import BulkEmailPanel from '../views/BulkEmailPanel.vue'
import { useAuthStore } from '../stores/auth'
import { useRatingsStore } from '../stores/ratings'
import { useContactsStore } from '../stores/contacts'
import { useAppointmentsStore } from '../stores/appointments'
import { useServicesStore } from '../stores/services'
import { exportTablePdf } from '../utils/pdf'

const { allUsers, userName, logout } = useAuthStore()
const { ratings } = useRatingsStore()
const { contacts, removeContact } = useContactsStore()
const { appointments, setStatus } = useAppointmentsStore()
const { services } = useServicesStore()

// ---- table data ----
const userColumns = [
  { key: 'name', label: 'Name', sortable: true, searchable: true },
  { key: 'email', label: 'Email', sortable: true, searchable: true },
  { key: 'role', label: 'Role', sortable: true, searchable: true },
  { key: 'createdAt', label: 'Joined', sortable: true, searchable: false }
]
const contactColumns = [
  { key: 'date', label: 'Date', sortable: true, searchable: false },
  { key: 'name', label: 'Name', sortable: true, searchable: true },
  { key: 'email', label: 'Email', sortable: true, searchable: true },
  { key: 'subject', label: 'Subject', sortable: true, searchable: true },
  { key: 'enquiryType', label: 'Type', sortable: true, searchable: true },
  { key: 'attachmentName', label: 'Attachment', sortable: false, searchable: false }
]
const appointmentColumns = [
  { key: 'date', label: 'Date', sortable: true, searchable: true },
  { key: 'start', label: 'Start', sortable: true, searchable: false },
  { key: 'professional', label: 'Professional', sortable: true, searchable: true },
  { key: 'userName', label: 'Client', sortable: true, searchable: true },
  { key: 'serviceName', label: 'Service', sortable: true, searchable: true },
  { key: 'status', label: 'Status', sortable: true, searchable: true }
]

const selectedUserUids = ref([])
const selectedUsers = computed(() => allUsers.value.filter((u) => selectedUserUids.value.includes(u.uid)))
const totalServices = computed(() => services.value.length)
const totalRatings = computed(() => ratings.value.length)
const upcomingAppointments = computed(() =>
  appointments.value.filter((a) => a.status === 'confirmed' && new Date(`${a.date}T${a.end}:00`) > new Date())
)

// ---- charts (Chart.js, data from Firestore) ----
const roleChartEl = ref(null)
const ratingChartEl = ref(null)
const appointmentChartEl = ref(null)
let roleChart = null, ratingChart = null, appointmentChart = null

function weekLabel(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  const day = (d.getDay() + 6) % 7 // Monday = 0
  const monday = new Date(d)
  monday.setDate(d.getDate() - day)
  return monday.toISOString().slice(0, 10)
}

function buildCharts() {
  const roleCounts = {}
  allUsers.value.forEach((u) => { roleCounts[u.role] = (roleCounts[u.role] || 0) + 1 })

  const ratingAvg = {}
  ratings.value.forEach((r) => {
    if (!ratingAvg[r.itemId]) ratingAvg[r.itemId] = { sum: 0, n: 0 }
    ratingAvg[r.itemId].sum += r.score
    ratingAvg[r.itemId].n++
  })
  const serviceLabels = services.value.map((s) => s.name)
  const serviceAvgs = services.value.map((s) => {
    const agg = ratingAvg[s.id]
    return agg ? +(agg.sum / agg.n).toFixed(1) : 0
  })

  const weekCounts = {}
  appointments.value
    .filter((a) => a.status !== 'cancelled')
    .forEach((a) => {
      const w = weekLabel(a.date)
      weekCounts[w] = (weekCounts[w] || 0) + 1
    })
  const weekKeys = Object.keys(weekCounts).sort()

  if (roleChart) roleChart.destroy()
  if (ratingChart) ratingChart.destroy()
  if (appointmentChart) appointmentChart.destroy()

  roleChart = new Chart(roleChartEl.value, {
    type: 'doughnut',
    data: {
      labels: Object.keys(roleCounts),
      datasets: [{ data: Object.values(roleCounts), backgroundColor: ['#2c6f8f', '#4a9c7c', '#f0a04b', '#c53030'] }]
    },
    options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
  })
  ratingChart = new Chart(ratingChartEl.value, {
    type: 'bar',
    data: {
      labels: serviceLabels,
      datasets: [{ label: 'Average rating', data: serviceAvgs, backgroundColor: '#4a9c7c' }]
    },
    options: { responsive: true, scales: { y: { min: 0, max: 5 } }, plugins: { legend: { display: false } } }
  })
  appointmentChart = new Chart(appointmentChartEl.value, {
    type: 'line',
    data: {
      labels: weekKeys,
      datasets: [{ label: 'Appointments', data: weekKeys.map((w) => weekCounts[w]), borderColor: '#2c6f8f', backgroundColor: 'rgba(44,111,143,0.15)', fill: true, tension: 0.3 }]
    },
    options: { responsive: true, plugins: { legend: { display: false } } }
  })
}

onMounted(buildCharts)
watch([allUsers, ratings, appointments], buildCharts, { deep: true })
onBeforeUnmount(() => {
  if (roleChart) roleChart.destroy()
  if (ratingChart) ratingChart.destroy()
  if (appointmentChart) appointmentChart.destroy()
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
                <h1 class="h2 mb-1">⚙️ Admin Dashboard</h1>
                <p class="text-muted mb-0">System overview for <strong>{{ userName }}</strong></p>
              </div>
              <div class="d-flex gap-2">
                <router-link to="/dashboard" class="btn btn-mindbridge-outline btn-sm">My Dashboard</router-link>
                <button @click="logout" class="btn btn-outline-secondary btn-sm">Logout</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="row g-4 mb-4">
        <div class="col-lg-3 col-md-6"><div class="card card-mindbridge p-4 text-center"><div class="h1 text-primary mb-0">{{ allUsers.length }}</div><div class="text-muted">Total Users</div></div></div>
        <div class="col-lg-3 col-md-6"><div class="card card-mindbridge p-4 text-center"><div class="h1 text-success mb-0">{{ totalServices }}</div><div class="text-muted">Services Offered</div></div></div>
        <div class="col-lg-3 col-md-6"><div class="card card-mindbridge p-4 text-center"><div class="h1 text-warning mb-0">{{ totalRatings }}</div><div class="text-muted">Total Ratings</div></div></div>
        <div class="col-lg-3 col-md-6"><div class="card card-mindbridge p-4 text-center"><div class="h1 text-info mb-0">{{ upcomingAppointments.length }}</div><div class="text-muted">Upcoming Appointments</div></div></div>
      </div>

      <!-- Charts (F.1 innovation #3) -->
      <div class="row g-4 mb-4">
        <div class="col-lg-4">
          <div class="card card-mindbridge p-4 h-100">
            <h5>👥 Users by Role</h5>
            <div class="chart-box"><canvas ref="roleChartEl" role="img" aria-label="Doughnut chart of users by role"></canvas></div>
          </div>
        </div>
        <div class="col-lg-4">
          <div class="card card-mindbridge p-4 h-100">
            <h5>⭐ Average Rating per Service</h5>
            <div class="chart-box"><canvas ref="ratingChartEl" role="img" aria-label="Bar chart of average rating per service"></canvas></div>
          </div>
        </div>
        <div class="col-lg-4">
          <div class="card card-mindbridge p-4 h-100">
            <h5>📈 Appointments per Week</h5>
            <div class="chart-box"><canvas ref="appointmentChartEl" role="img" aria-label="Line chart of appointments per week"></canvas></div>
          </div>
        </div>
      </div>

      <!-- Users table + bulk email (F.1 innovation #2) -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="card card-mindbridge p-4">
            <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2">
              <h5 class="mb-0">📋 Users</h5>
              <button type="button" class="btn btn-outline-secondary btn-sm" @click="exportTablePdf('MindBridge Users', userColumns, allUsers, 'mindbridge-users.pdf')">⬇ Export PDF</button>
            </div>
            <DataTable
              caption="Users"
              :columns="userColumns"
              :rows="allUsers"
              row-key="uid"
              csv-filename="mindbridge-users.csv"
              selectable
              v-model:selected="selectedUserUids"
            >
              <template #cell-role="{ row }">
                <span class="badge" :class="row.role === 'admin' ? 'bg-warning text-dark' : 'bg-soft-primary text-primary'">{{ row.role }}</span>
              </template>
              <template #cell-createdAt="{ value }">
                <small>{{ value ? new Date(value.seconds * 1000).toLocaleDateString() : '—' }}</small>
              </template>
            </DataTable>
          </div>
        </div>
      </div>

      <div class="row mb-4">
        <div class="col-12">
          <BulkEmailPanel :recipients="selectedUsers" />
        </div>
      </div>

      <!-- Appointments table (admin view of F.1 bookings) -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="card card-mindbridge p-4">
            <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2">
              <h5 class="mb-0">🗓️ All Appointments</h5>
              <button type="button" class="btn btn-outline-secondary btn-sm" @click="exportTablePdf('MindBridge Appointments', appointmentColumns, appointments, 'mindbridge-appointments.pdf')">⬇ Export PDF</button>
            </div>
            <DataTable
              caption="Appointments"
              :columns="appointmentColumns"
              :rows="appointments"
              row-key="id"
              csv-filename="mindbridge-appointments.csv"
            >
              <template #cell-status="{ value }">
                <span class="badge" :class="value === 'confirmed' ? 'bg-success' : value === 'cancelled' ? 'bg-danger' : 'bg-secondary'">{{ value }}</span>
              </template>
              <template #actions="{ row }">
                <button v-if="row.status !== 'cancelled'" type="button" class="btn btn-outline-danger btn-sm" @click="setStatus(row.id, 'cancelled')">Cancel</button>
              </template>
            </DataTable>
          </div>
        </div>
      </div>

      <!-- Contact messages table -->
      <div class="row">
        <div class="col-12">
          <div class="card card-mindbridge p-4">
            <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2">
              <h5 class="mb-0">📬 Contact Messages</h5>
              <button type="button" class="btn btn-outline-secondary btn-sm" @click="exportTablePdf('MindBridge Contact Messages', contactColumns, contacts, 'mindbridge-contacts.pdf')">⬇ Export PDF</button>
            </div>
            <DataTable
              caption="Contact messages"
              :columns="contactColumns"
              :rows="contacts"
              row-key="id"
              csv-filename="mindbridge-contacts.csv"
            >
              <template #cell-date="{ value }">
                <small>{{ value ? new Date(value.seconds * 1000).toLocaleString() : new Date().toLocaleString() }}</small>
              </template>
              <template #cell-attachmentName="{ value }">
                <small>{{ value || '—' }}</small>
              </template>
              <template #actions="{ row }">
                <button type="button" class="btn btn-outline-danger btn-sm" @click="removeContact(row.id)">Delete</button>
              </template>
            </DataTable>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.min-vh-100-minus-nav { min-height: calc(100vh - 200px); }
.bg-soft-primary { background: rgba(44, 111, 143, 0.1); }
.border-4 { border-width: 4px !important; }
.chart-box { position: relative; height: 260px; }
</style>
