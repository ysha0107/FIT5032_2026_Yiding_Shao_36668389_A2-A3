<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { useServicesStore } from '../stores/services'
import { useAuthStore } from '../stores/auth'
import StarRating from '../components/StarRating.vue'

const route = useRoute()
const { getServiceById } = useServicesStore()
const { isLoggedIn } = useAuthStore()

const service = getServiceById(route.params.id)
const ratingMessage = ref('')

function onRated(data) {
  ratingMessage.value = `Thank you! You rated this service ${data.score}/5.`
  setTimeout(() => { ratingMessage.value = '' }, 3000)
}
</script>

<template>
  <div class="service-detail-page" v-if="service">
    <!-- Breadcrumb -->
    <div class="container py-3">
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb">
          <li class="breadcrumb-item"><router-link to="/">Home</router-link></li>
          <li class="breadcrumb-item"><router-link to="/services">Services</router-link></li>
          <li class="breadcrumb-item active">{{ service.name }}</li>
        </ol>
      </nav>
    </div>

    <!-- Service Detail -->
    <section class="page-section pt-0">
      <div class="container">
        <div class="row g-5">
          <div class="col-lg-8">
            <div class="service-icon-lg mb-3">{{ service.icon }}</div>
            <h1 class="service-title">{{ service.name }}</h1>
            <span class="badge bg-soft-primary text-primary mb-3">{{ service.category }}</span>

            <div class="mt-4">
              <p class="lead">{{ service.fullDescription }}</p>
            </div>

            <!-- Features -->
            <h4 class="mt-4">What's Included</h4>
            <ul class="list-unstyled">
              <li v-for="feature in service.features" :key="feature" class="mb-2">
                ✅ {{ feature }}
              </li>
            </ul>
          </div>

          <div class="col-lg-4">
            <div class="card card-mindbridge p-4 sticky-sidebar">
              <h5>Service Details</h5>
              <hr>
              <div class="mb-3">
                <strong>💰 Pricing:</strong>
                <p class="text-muted mb-0">{{ service.price }}</p>
              </div>
              <div class="mb-3">
                <strong>🕐 Availability:</strong>
                <p class="text-muted mb-0">{{ service.availability }}</p>
              </div>
              <div class="mb-3">
                <strong>📍 Location:</strong>
                <p class="text-muted mb-0">{{ service.location }}</p>
              </div>
              <hr>

              <!-- Rating Section -->
              <div class="mb-3">
                <h6>Rate This Service</h6>
                <StarRating :itemId="service.id" @rated="onRated" />
                <div v-if="ratingMessage" class="alert alert-success mt-2 py-2 small mb-0">
                  {{ ratingMessage }}
                </div>
                <div v-if="!isLoggedIn" class="mt-2">
                  <small class="text-muted">
                    Please <router-link to="/login">login</router-link> to rate this service.
                  </small>
                </div>
              </div>

              <button class="btn btn-mindbridge w-100 mt-3">Book This Service</button>
              <button class="btn btn-mindbridge-outline w-100 mt-2">Contact Us</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>

  <div v-else class="page-section text-center">
    <h2>Service not found</h2>
    <router-link to="/services" class="btn btn-mindbridge">Back to Services</router-link>
  </div>
</template>

<style scoped>
.service-icon-lg {
  font-size: 3.5rem;
}
.service-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--mindbridge-heading);
}
.bg-soft-primary {
  background: rgba(44, 111, 143, 0.1);
}
.sticky-sidebar {
  position: sticky;
  top: 100px;
}
@media (max-width: 768px) {
  .service-title {
    font-size: 1.8rem;
  }
  .sticky-sidebar {
    position: static;
  }
}
</style>
