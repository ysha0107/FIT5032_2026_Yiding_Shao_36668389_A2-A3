<script setup>
import { useResourcesStore } from '../stores/resources'
import { useServicesStore } from '../stores/services'
import { useRatingsStore } from '../stores/ratings'

const { getFeaturedResources, resources } = useResourcesStore()
const { services } = useServicesStore()
const { getRating } = useRatingsStore()

const featuredResources = getFeaturedResources()
const featuredServices = services.value.slice(0, 3)
</script>

<template>
  <div class="home-page">
    <!-- Hero Section -->
    <section class="hero-gradient page-section">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-lg-6 mb-4 mb-lg-0">
            <h1 class="hero-title">You Are <span class="text-accent">Not Alone</span></h1>
            <p class="hero-subtitle">
              MindBridge connects you with accessible, evidence-based mental health resources,
              professional support, and a caring community. Your journey to better mental health starts here.
            </p>
            <div class="d-flex flex-wrap gap-3 mt-4">
              <router-link to="/services" class="btn btn-mindbridge btn-lg">Get Support Now</router-link>
              <router-link to="/resources" class="btn btn-mindbridge-outline btn-lg">Learn More</router-link>
            </div>
          </div>
          <div class="col-lg-6 text-center">
            <div class="hero-illustration">
              <span class="hero-emoji">🧠💚🌈</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Impact Statistics -->
    <section class="page-section bg-white">
      <div class="container">
        <div class="row g-4 text-center">
          <div class="col-md-3 col-6">
            <div class="stat-card">
              <div class="stat-number">50,000+</div>
              <div class="stat-label">Lives Touched</div>
            </div>
          </div>
          <div class="col-md-3 col-6">
            <div class="stat-card">
              <div class="stat-number">2,500+</div>
              <div class="stat-label">Therapy Sessions</div>
            </div>
          </div>
          <div class="col-md-3 col-6">
            <div class="stat-card">
              <div class="stat-number">150+</div>
              <div class="stat-label">Support Groups</div>
            </div>
          </div>
          <div class="col-md-3 col-6">
            <div class="stat-card">
              <div class="stat-number">24/7</div>
              <div class="stat-label">Crisis Support</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Services Section -->
    <section class="page-section bg-calm">
      <div class="container">
        <div class="text-center mb-5">
          <h2 class="section-title">Our Services</h2>
          <p class="section-subtitle">Comprehensive mental health support tailored to your needs</p>
        </div>
        <div class="row g-4">
          <div class="col-lg-4 col-md-6" v-for="service in featuredServices" :key="service.id">
            <div class="card card-mindbridge h-100 p-4 text-center">
              <div class="service-icon mb-3">{{ service.icon }}</div>
              <h5>{{ service.name }}</h5>
              <p class="text-muted small">{{ service.description }}</p>
              <div class="mt-auto">
                <router-link :to="`/services/${service.id}`" class="btn btn-mindbridge-outline btn-sm">
                  Learn More
                </router-link>
              </div>
            </div>
          </div>
        </div>
        <div class="text-center mt-4">
          <router-link to="/services" class="btn btn-mindbridge">View All Services</router-link>
        </div>
      </div>
    </section>

    <!-- Featured Resources -->
    <section class="page-section bg-white">
      <div class="container">
        <div class="text-center mb-5">
          <h2 class="section-title">Featured Resources</h2>
          <p class="section-subtitle">Evidence-based articles and guides from mental health professionals</p>
        </div>
        <div class="row g-4">
          <div class="col-lg-4 col-md-6" v-for="resource in featuredResources" :key="resource.id">
            <div class="card card-mindbridge h-100">
              <div class="card-body">
                <span class="badge bg-soft-primary text-primary mb-2">{{ resource.category }}</span>
                <h5 class="card-title">{{ resource.title }}</h5>
                <p class="card-text text-muted small">{{ resource.excerpt }}</p>
              </div>
              <div class="card-footer bg-white border-0 d-flex justify-content-between align-items-center">
                <small class="text-muted">{{ resource.readTime }} read</small>
                <router-link :to="`/resources`" class="btn btn-sm btn-mindbridge-outline">Read More</router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonials -->
    <section class="page-section bg-primary-soft">
      <div class="container">
        <div class="text-center mb-5">
          <h2 class="section-title">Stories of Hope</h2>
          <p class="section-subtitle">Real stories from people who found support through MindBridge</p>
        </div>
        <div class="row g-4">
          <div class="col-md-4" v-for="i in 3" :key="i">
            <div class="card card-mindbridge h-100 p-4">
              <div class="mb-2">★★★★★</div>
              <p class="testimonial-text fst-italic">
                "MindBridge gave me the courage to seek help when I felt completely lost.
                The resources and support groups changed my life."
              </p>
              <div class="mt-3">
                <strong class="text-muted">— Community Member</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="page-section bg-dark text-white text-center">
      <div class="container">
        <h2 class="text-white mb-3">Ready to Take the First Step?</h2>
        <p class="mb-4" style="color: rgba(255,255,255,0.7);">
          Join thousands of others who have found support through MindBridge. Your mental health matters.
        </p>
        <div class="d-flex justify-content-center gap-3 flex-wrap">
          <router-link to="/register" class="btn btn-accent btn-lg">Join MindBridge Free</router-link>
          <router-link to="/contact" class="btn btn-outline-light btn-lg">Contact Us</router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.hero-title {
  font-size: 3rem;
  font-weight: 700;
  color: var(--mindbridge-heading);
  line-height: 1.2;
}
.text-accent {
  color: var(--mindbridge-secondary);
}
.hero-subtitle {
  font-size: 1.15rem;
  color: var(--mindbridge-text);
  line-height: 1.7;
  margin-top: 1rem;
}
.hero-illustration {
  font-size: 6rem;
  padding: 2rem;
}
.hero-emoji {
  display: inline-block;
  animation: float 3s ease-in-out infinite;
}
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}
.stat-card {
  padding: 1.5rem;
}
.stat-number {
  font-size: 2.2rem;
  font-weight: 700;
  color: var(--mindbridge-primary);
}
.stat-label {
  color: var(--mindbridge-text);
  font-size: 0.95rem;
  margin-top: 0.25rem;
}
.service-icon {
  font-size: 2.5rem;
}
.bg-soft-primary {
  background: rgba(44, 111, 143, 0.1);
}
.testimonial-text {
  font-size: 0.95rem;
  color: var(--mindbridge-text);
  line-height: 1.6;
}
@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }
  .hero-illustration {
    font-size: 3.5rem;
  }
  .stat-number {
    font-size: 1.6rem;
  }
}
</style>
