<script setup>
import { ref, reactive, computed } from 'vue'
import emailjs from '@emailjs/browser'
import { useContactsStore } from '../stores/contacts'

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

// Contact form state with validations — BR B.1
const form = reactive({
  name: '',
  email: '',
  subject: '',
  message: '',
  enquiryType: 'general'
})

const submitted = ref(false)
const isLoading = ref(false)
const submitSuccess = ref(false)
const submitError = ref('')
const attachment = ref(null)
const attachmentError = ref('')

// Validation Type 1: Required fields + Email format
const nameError = computed(() => {
  if (!form.name && !submitted.value) return ''
  if (!form.name.trim()) return 'Your name is required.'
  if (form.name.trim().length < 2) return 'Name must be at least 2 characters.'
  return ''
})

const emailError = computed(() => {
  if (!form.email && !submitted.value) return ''
  if (!form.email.trim()) return 'Email address is required.'
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(form.email)) return 'Please enter a valid email address (e.g. name@example.com).'
  return ''
})

// Validation Type 2: Minimum length / content validation
const messageError = computed(() => {
  if (!form.message && !submitted.value) return ''
  if (!form.message.trim()) return 'A message is required.'
  if (form.message.trim().length < 10) return 'Please provide at least 10 characters in your message.'
  if (form.message.trim().length > 2000) return 'Message must be less than 2000 characters.'
  return ''
})

const subjectError = computed(() => {
  if (!form.subject && !submitted.value) return ''
  if (!form.subject.trim()) return 'Subject is required.'
  return ''
})

const isFormValid = computed(() => {
  return !nameError.value &&
         !emailError.value &&
         !messageError.value &&
         !subjectError.value &&
         form.name.trim() &&
         form.email.trim() &&
         form.subject.trim() &&
         form.message.trim()
})

function sanitizeInput(input) {
  return input.replace(/<[^>]*>/g, '').trim()
}

function handleFileChange(event) {
  attachment.value = event.target.files[0] || null
  attachmentError.value = ''
  if (attachment.value && attachment.value.size > 1024 * 1024) {
    attachmentError.value = 'Attachment must be 1 MB or smaller.'
    attachment.value = null
    event.target.value = ''
  }
}

async function handleSubmit() {
  submitted.value = true
  submitError.value = ''
  submitSuccess.value = false

  if (!isFormValid.value) {
    submitError.value = 'Please correct the errors below before submitting.'
    return
  }
  if (attachmentError.value) {
    submitError.value = 'Please fix the attachment error before submitting.'
    return
  }

  isLoading.value = true

  const contactPayload = {
    name: sanitizeInput(form.name),
    email: sanitizeInput(form.email),
    subject: sanitizeInput(form.subject),
    message: sanitizeInput(form.message),
    enquiryType: form.enquiryType,
    attachmentName: attachment.value?.name || '',
    attachmentSize: attachment.value?.size || 0
  }

  const saved = await useContactsStore().submitContact(contactPayload)

  // D.2: send the email with attachment via EmailJS (best-effort; the message
  // is stored in Firestore either way)
  if (!saved.queued && SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY) {
    try {
      await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        {
          from_name: contactPayload.name,
          from_email: contactPayload.email,
          subject: contactPayload.subject,
          message: contactPayload.message,
          enquiry_type: contactPayload.enquiryType,
          ...(attachment.value ? { attachment_file: attachment.value } : {})
        },
        { publicKey: PUBLIC_KEY }
      )
    } catch (e) {
      console.error('EmailJS send failed', e)
    }
  }

  isLoading.value = false
  submitted.value = false
  if (saved.success) {
    submitSuccess.value = true
    form.name = ''
    form.email = ''
    form.subject = ''
    form.message = ''
    form.enquiryType = 'general'
    attachment.value = null
    const fileInput = document.getElementById('contact-attachment')
    if (fileInput) fileInput.value = ''
    setTimeout(() => {
      submitSuccess.value = false
    }, 6000)
  } else {
    submitError.value = saved.error || 'Something went wrong. Please try again.'
  }
}
</script>

<template>
  <div class="contact-page">
    <!-- Hero -->
    <section class="hero-gradient page-section pb-4">
      <div class="container text-center">
        <h1 class="hero-title">Contact Us</h1>
        <p class="hero-subtitle mx-auto" style="max-width: 700px;">
          We're here to help. Reach out with any questions, feedback, or to learn more about our services.
        </p>
      </div>
    </section>

    <section class="page-section pt-0">
      <div class="container">
        <div class="row g-5">
          <!-- Contact Form -->
          <div class="col-lg-7">
            <div class="card card-mindbridge p-4">
              <h3 class="mb-4">Send Us a Message</h3>

              <!-- Success Alert -->
              <div v-if="submitSuccess" class="alert alert-success" role="alert">
                <strong>✅ Message Sent!</strong> Thank you for reaching out. We will get back to you within 1-2 business days.
              </div>

              <!-- Error Alert -->
              <div v-if="submitError" class="alert alert-danger alert-dismissible fade show" role="alert">
                {{ submitError }}
                <button type="button" class="btn-close" @click="submitError = ''" aria-label="Close"></button>
              </div>

              <form @submit.prevent="handleSubmit" novalidate>
                <!-- Enquiry Type -->
                <div class="mb-3">
                  <label for="enquiry-type" class="form-label">Enquiry Type</label>
                  <select id="enquiry-type" v-model="form.enquiryType" class="form-select">
                    <option value="general">General Enquiry</option>
                    <option value="support">Support Request</option>
                    <option value="volunteer">Volunteering</option>
                    <option value="partnership">Partnership</option>
                    <option value="feedback">Feedback</option>
                  </select>
                </div>

                <!-- Name -->
                <div class="mb-3">
                  <label for="contact-name" class="form-label">Your Name <span class="text-danger">*</span></label>
                  <input
                    id="contact-name"
                    v-model="form.name"
                    type="text"
                    class="form-control"
                    :class="{ 'input-error': nameError, 'input-valid': form.name && !nameError }"
                    placeholder="John Doe"
                    autocomplete="name"
                    required
                  
                  :aria-invalid="!!nameError"
                  :aria-describedby="nameError ? 'contact-name-error' : null"
                />
                  <div v-if="nameError" id="contact-name-error" class="error-message">{{ nameError }}</div>
                </div>

                <!-- Email -->
                <div class="mb-3">
                  <label for="contact-email" class="form-label">Email Address <span class="text-danger">*</span></label>
                  <input
                    id="contact-email"
                    v-model="form.email"
                    type="email"
                    class="form-control"
                    :class="{ 'input-error': emailError, 'input-valid': form.email && !emailError }"
                    placeholder="you@example.com"
                    autocomplete="email"
                    required
                  
                  :aria-invalid="!!emailError"
                  :aria-describedby="emailError ? 'contact-email-error' : null"
                />
                  <div v-if="emailError" id="contact-email-error" class="error-message">{{ emailError }}</div>
                </div>

                <!-- Subject -->
                <div class="mb-3">
                  <label for="contact-subject" class="form-label">Subject <span class="text-danger">*</span></label>
                  <input
                    id="contact-subject"
                    v-model="form.subject"
                    type="text"
                    class="form-control"
                    :class="{ 'input-error': subjectError, 'input-valid': form.subject && !subjectError }"
                    placeholder="What is this about?"
                    required
                  
                  :aria-invalid="!!subjectError"
                  :aria-describedby="subjectError ? 'contact-subject-error' : null"
                />
                  <div v-if="subjectError" id="contact-subject-error" class="error-message">{{ subjectError }}</div>
                </div>

                <!-- Message -->
                <div class="mb-3">
                  <label for="contact-message" class="form-label">Message <span class="text-danger">*</span></label>
                  <textarea
                    id="contact-message"
                    v-model="form.message"
                    class="form-control"
                    :class="{ 'input-error': messageError, 'input-valid': form.message && !messageError }"
                    rows="5"
                    placeholder="Tell us how we can help (minimum 10 characters)..."
                    required
                    :aria-invalid="!!messageError"
                    :aria-describedby="messageError ? 'contact-message-error' : null"
                  ></textarea>
                  <div v-if="messageError" id="contact-message-error" class="error-message">{{ messageError }}</div>
                  <small class="text-muted">{{ form.message.length }}/2000 characters</small>
                </div>

                <!-- Attachment (D.2) -->
                <div class="mb-3">
                  <label for="contact-attachment" class="form-label">Attachment <small class="text-muted">(optional, max 1 MB)</small></label>
                  <input
                    id="contact-attachment"
                    type="file"
                    class="form-control"
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.txt"
                    @change="handleFileChange"
                  />
                  <div v-if="attachmentError" class="error-message">{{ attachmentError }}</div>
                  <small v-if="attachment" class="text-muted">📎 {{ attachment.name }} ({{ Math.round(attachment.size / 1024) }} KB)</small>
                </div>

                <button
                  type="submit"
                  class="btn btn-mindbridge btn-lg"
                  :disabled="submitted && !isFormValid || isLoading"
                >
                  <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                  Send Message
                </button>
              </form>
            </div>
          </div>

          <!-- Contact Info Sidebar -->
          <div class="col-lg-5">
            <div class="card card-mindbridge p-4 mb-4">
              <h5>📞 Crisis Support</h5>
              <p class="text-muted small">If you or someone you know is in immediate danger, please call:</p>
              <div class="d-grid gap-2">
                <a href="tel:000" class="btn btn-crisis btn-sm">Emergency: 000</a>
                <a href="tel:131114" class="btn btn-outline-danger btn-sm">Lifeline: 13 11 14</a>
              </div>
            </div>

            <div class="card card-mindbridge p-4 mb-4">
              <h5>📧 General Inquiries</h5>
              <ul class="list-unstyled mb-0 mt-3">
                <li class="mb-2">📧 info@mindbridge.org.au</li>
                <li class="mb-2">📞 (03) 9000 1234</li>
                <li class="mb-2">📍 Melbourne, VIC 3000</li>
                <li class="mb-2">🕐 Mon-Fri, 9am-5pm AEST</li>
              </ul>
            </div>

            <div class="card card-mindbridge p-4">
              <h5>🗺️ Find a Centre Near You</h5>
              <p class="text-muted small mt-2">We have locations across Australia. Use our interactive map to find the nearest MindBridge centre.</p>
              <router-link to="/locations" class="btn btn-mindbridge-outline w-100 mt-2">
                🗺️ Open Interactive Map
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.hero-title {
  font-size: 2.8rem;
  font-weight: 700;
  color: var(--mindbridge-heading);
}
.hero-subtitle {
  font-size: 1.15rem;
  color: var(--mindbridge-text);
  line-height: 1.7;
}
.map-placeholder {
  min-height: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
}
.form-label {
  font-weight: 500;
  color: var(--mindbridge-heading);
}
@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }
}
</style>
