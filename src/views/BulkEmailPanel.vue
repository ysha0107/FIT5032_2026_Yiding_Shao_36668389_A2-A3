<script setup>
import { ref, computed } from 'vue'
import emailjs from '@emailjs/browser'

const props = defineProps({
  recipients: { type: Array, required: true } // [{ uid, name, email }]
})
const emit = defineEmits(['sent'])

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID
const BULK_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_BULK_TEMPLATE_ID
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

const subject = ref('')
const message = ref('')
const sending = ref(false)
const status = ref('')   // '' | success text | error text
const sentCount = ref(0)

const canSend = computed(() =>
  props.recipients.length > 0 && subject.value.trim() && message.value.trim() && !sending.value
)

async function sendBulk() {
  if (!canSend.value) return
  if (!SERVICE_ID || !BULK_TEMPLATE_ID || !PUBLIC_KEY) {
    status.value = 'EmailJS is not configured (.env keys missing).'
    return
  }
  sending.value = true
  status.value = ''
  sentCount.value = 0
  for (const recipient of props.recipients) {
    try {
      await emailjs.send(
        SERVICE_ID,
        BULK_TEMPLATE_ID,
        {
          to_email: recipient.email,
          to_name: recipient.name || recipient.email,
          subject: subject.value,
          message: message.value
        },
        { publicKey: PUBLIC_KEY }
      )
      sentCount.value++
    } catch (e) {
      console.error('bulk send failed for', recipient.email, e)
    }
  }
  sending.value = false
  if (sentCount.value === props.recipients.length) {
    status.value = `✅ Sent to all ${sentCount.value} recipient(s).`
  } else {
    status.value = `⚠️ Sent to ${sentCount.value} of ${props.recipients.length} recipient(s). Check the EmailJS quota (free plan: 200/month).`
  }
  emit('sent', sentCount.value)
  subject.value = ''
  message.value = ''
}
</script>

<template>
  <div class="card card-mindbridge p-4 h-100">
    <h5>📧 Bulk Email <span class="badge bg-soft-primary text-primary ms-1">{{ recipients.length }} selected</span></h5>
    <p class="text-muted small">
      Select recipients in the Users table above, then compose one message — it is sent to each of them individually.
    </p>
    <div class="mb-3">
      <label for="bulk-subject" class="form-label">Subject</label>
      <input id="bulk-subject" v-model="subject" type="text" class="form-control" placeholder="e.g. New support group starting this month">
    </div>
    <div class="mb-3">
      <label for="bulk-message" class="form-label">Message</label>
      <textarea id="bulk-message" v-model="message" class="form-control" rows="5" placeholder="Write your message..."></textarea>
    </div>
    <div v-if="status" class="alert py-2" :class="status.startsWith('✅') ? 'alert-success' : 'alert-warning'" role="status">{{ status }}</div>
    <button type="button" class="btn btn-mindbridge" :disabled="!canSend" @click="sendBulk">
      <span v-if="sending" class="spinner-border spinner-border-sm me-1"></span>
      Send to {{ recipients.length }} recipient{{ recipients.length !== 1 ? 's' : '' }}
    </button>
  </div>
</template>

<style scoped>
.bg-soft-primary { background: rgba(44, 111, 143, 0.1); }
</style>
