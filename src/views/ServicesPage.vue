<script setup>
import { ref, computed } from 'vue'
import { useServicesStore } from '../stores/services'
import { useRatingsStore } from '../stores/ratings'
import StarRating from '../components/StarRating.vue'

const { services, serviceCategories } = useServicesStore()
const { getRating } = useRatingsStore()

const selectedCategory = ref('all')

const filteredServices = computed(() => {
  if (selectedCategory.value === 'all') return services.value
  return services.value.filter(s => s.category === selectedCategory.value)
})
</script>

<template>
  <div class="services-page">
    <!-- Hero -->
    <section class="hero-gradient page-section pb-4">
      <div class="container text-center">
        <h1 class="hero-title">Our Services</h1>
        <p class="hero-subtitle mx-auto" style="max-width: 700px;">
          Comprehensive mental health support designed to meet you wherever you are on your journey.
        </p>
      </div>
    </section>

    <section class="page-section pt-0">
      <div class="container">
        <!-- Category Filter -->
        <div class="d-flex flex-wrap gap-2 mb-4 justify-content-center">
          <button
            v-for="cat in serviceCategories"
            :key="cat.key"
            @click="selectedCategory = cat.key"
            class="btn btn-sm"
            :class="selectedCategory === cat.key ? 'btn-mindbridge' : 'btn-outline-secondary'"
          >
            {{ cat.label }}
          </button>
        </div>

        <!-- Services Grid -->
        <div class="row g-4">
          <div class="col-lg-4 col-md-6" v-for="service in filteredServices" :key="service.id">
            <div class="card card-mindbridge h-100">
              <div class="card-body d-flex flex-column">
                <div class="service-icon mb-3">{{ service.icon }}</div>
                <span class="badge bg-soft-primary text-primary mb-2 align-self-start">{{ service.category }}</span>
                <h3 class="card-title fs-5">{{ service.name }}</h3>
                <p class="card-text text-muted small">{{ service.description }}</p>

                <div class="mt-3 mb-2">
                  <StarRating :itemId="service.id" :readOnly="true" />
                </div>

                <div class="mt-2 small text-muted">
                  <div>💰 {{ service.price }}</div>
                  <div>🕐 {{ service.availability }}</div>
                </div>

                <div class="mt-auto pt-3">
                  <router-link :to="`/services/${service.id}`" class="btn btn-mindbridge-outline btn-sm w-100">
                    View Details
                  </router-link>
                </div>
              </div>
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
.service-icon {
  font-size: 2.5rem;
}
.bg-soft-primary {
  background: rgba(44, 111, 143, 0.1);
}
@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }
}
</style>
