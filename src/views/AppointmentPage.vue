<script setup>
import { ref, computed, reactive } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { useAppointmentsStore, PROFESSIONALS } from '../stores/appointments'
import { useAuthStore } from '../stores/auth'
import { useServicesStore } from '../stores/services'
import { isPast, isWithinBusinessHours, isWeekday, hasConflict, countUpcoming } from '../utils/booking'

const { appointments, bookAppointment, setStatus } = useAppointmentsStore()
const { currentUser } = useAuthStore()
const { services } = useServicesStore()

const showModal = ref(false)
const selectedSlot = reactive({ date: '', start: '', end: '' })
const bookingForm = reactive({ professional: PROFESSIONALS[0], serviceId: 1 })
const errorMessage = ref('')
const successMessage = ref('')
const saving = ref(false)

const myBookings = computed(() =>
  appointments.value
    .filter((b) => b.userId === currentUser.value?.uid)
    .sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start))
)

const calendarOptions = computed(() => ({
  plugins: [timeGridPlugin, interactionPlugin],
  initialView: 'timeGridWeek',
  height: 'auto',
  allDaySlot: false,
  weekends: false,
  slotDuration: '01:00',
  slotMinTime: '09:00:00',
  slotMaxTime: '17:00:00',
  selectable: true,
  selectMirror: true,
  headerToolbar: { left: 'prev,next today', center: 'title', right: 'timeGridWeek,timeGridDay' },
  businessHours: [{ daysOfWeek: [1, 2, 3, 4, 5], startTime: '09:00', endTime: '17:00' }],
  validRange: { start: new Date() },
  events: appointments.value
    .filter((b) => b.status !== 'cancelled')
    .map((b) => ({
      id: b.id,
      title: `${b.professional.split(' — ')[0]} · ${b.userName}`,
      start: `${b.date}T${b.start}:00`,
      end: `${b.date}T${b.end}:00`,
      backgroundColor: '#2c6f8f',
      borderColor: '#1a526b'
    })),
  select(info) {
    const date = info.startStr.slice(0, 10)
    const start = info.startStr.slice(11, 16)
    const end = info.endStr.slice(11, 16)
    openBooking(date, start, end)
  }
}))

function openBooking(date, start, end) {
  errorMessage.value = ''
  successMessage.value = ''
  selectedSlot.date = date
  selectedSlot.start = start
  selectedSlot.end = end
  showModal.value = true
}

async function confirmBooking() {
  errorMessage.value = ''
  const { date, start, end } = selectedSlot
  const newBooking = { id: 'new', date, start, end, professional: bookingForm.professional }

  // F.1 booking constraints — client-side validation
  if (isPast(date, end)) { errorMessage.value = 'That time slot is in the past.'; return }
  if (!isWeekday(date)) { errorMessage.value = 'Appointments are available on weekdays only.'; return }
  if (!isWithinBusinessHours(start, end)) { errorMessage.value = 'Appointments are available between 9:00 and 17:00.'; return }
  if (hasConflict(appointments.value, newBooking)) {
    errorMessage.value = 'This professional is already booked for that time slot. Please pick another slot.'
    return
  }
  if (countUpcoming(appointments.value, currentUser.value.uid) >= 2) {
    errorMessage.value = 'You can have at most 2 upcoming appointments. Please cancel one first.'
    return
  }

  saving.value = true
  const service = services.value.find((s) => s.id === bookingForm.serviceId) || services.value[0]
  const result = await bookAppointment({
    date, start, end,
    professional: bookingForm.professional,
    serviceId: service.id,
    serviceName: service.name
  })
  saving.value = false
  if (result.success) {
    showModal.value = false
    successMessage.value = 'Appointment booked! We will email you a confirmation.'
    setTimeout(() => { successMessage.value = '' }, 5000)
  } else {
    errorMessage.value = result.error
  }
}

async function cancelBooking(id) {
  await setStatus(id, 'cancelled')
}
</script>

<template>
  <div class="appointment-page page-section bg-calm">
    <div class="container">
      <div class="row mb-4">
        <div class="col-12">
          <div class="card card-mindbridge p-4">
            <h1 class="h3 mb-2">📅 Book an Appointment</h1>
            <p class="text-muted mb-0">
              Select an available slot on the calendar (weekdays, 9:00–17:00). Each professional can only see one client per slot.
            </p>
          </div>
        </div>
      </div>

      <div v-if="successMessage" class="alert alert-success" role="status">{{ successMessage }}</div>

      <div class="card card-mindbridge p-4 mb-4">
        <FullCalendar :options="calendarOptions" />
      </div>

      <div class="card card-mindbridge p-4">
        <h2 class="fs-5">🗓️ My Bookings</h2>
        <ul class="list-group list-group-flush">
          <li v-for="b in myBookings" :key="b.id" class="list-group-item d-flex justify-content-between align-items-center flex-wrap gap-2">
            <span>
              <strong>{{ b.serviceName }}</strong> with {{ b.professional }}<br>
              <small class="text-muted">{{ b.date }} · {{ b.start }}–{{ b.end }} ·
                <span :class="b.status === 'cancelled' ? 'text-danger' : 'text-success'">{{ b.status }}</span></small>
            </span>
            <button v-if="b.status !== 'cancelled' && !isPast(b.date, b.end)" type="button" class="btn btn-outline-danger btn-sm" @click="cancelBooking(b.id)">
              Cancel
            </button>
          </li>
          <li v-if="!myBookings.length" class="list-group-item text-muted">No bookings yet.</li>
        </ul>
      </div>
    </div>

    <!-- Booking modal -->
    <div v-if="showModal" class="modal d-block" tabindex="-1" role="dialog" aria-modal="true" aria-labelledby="booking-modal-title">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h2 id="booking-modal-title" class="modal-title fs-5">Confirm Appointment</h2>
            <button type="button" class="btn-close" aria-label="Close" @click="showModal = false"></button>
          </div>
          <div class="modal-body">
            <p>
              <strong>Slot:</strong> {{ selectedSlot.date }} · {{ selectedSlot.start }}–{{ selectedSlot.end }}
            </p>
            <div class="mb-3">
              <label for="booking-service" class="form-label">Service</label>
              <select id="booking-service" v-model.number="bookingForm.serviceId" class="form-select">
                <option v-for="s in services" :key="s.id" :value="s.id">{{ s.name }}</option>
              </select>
            </div>
            <div class="mb-3">
              <label for="booking-professional" class="form-label">Professional</label>
              <select id="booking-professional" v-model="bookingForm.professional" class="form-select">
                <option v-for="p in PROFESSIONALS" :key="p" :value="p">{{ p }}</option>
              </select>
            </div>
            <div v-if="errorMessage" class="alert alert-danger py-2" role="alert">{{ errorMessage }}</div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" @click="showModal = false">Cancel</button>
            <button type="button" class="btn btn-mindbridge" :disabled="saving" @click="confirmBooking">
              <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>
              Book Appointment
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
