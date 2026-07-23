<script setup>
// GetInvolvedPage — MindBridge Health Foundation
</script>

<template>
  <div class="get-involved-page">
    <!-- Hero -->
    <section class="hero-gradient page-section">
      <div class="container text-center">
        <h1 class="hero-title">Get Involved</h1>
        <p class="hero-subtitle mx-auto" style="max-width: 700px;">
          Your support can change lives. Whether you donate, volunteer, or partner with us,
          you help bridge the gap in mental health care.
        </p>
      </div>
    </section>

    <!-- Donate Section -->
    <section class="page-section bg-white">
      <div class="container">
        <div class="row align-items-center g-5">
          <div class="col-lg-6">
            <h2 class="section-title">Make a Donation</h2>
            <p>
              Your generous donation helps us provide free mental health resources, support groups,
              and crisis helpline services to those who need them most. Every contribution,
              no matter the size, makes a meaningful difference.
            </p>
            <div class="row g-3 mt-3">
              <div class="col-6 col-md-3" v-for="amount in ['$25', '$50', '$100', '$250']" :key="amount">
                <div class="card card-mindbridge p-3 text-center donation-card">
                  <strong>{{ amount }}</strong>
                </div>
              </div>
            </div>
            <button class="btn btn-accent btn-lg mt-4">Donate Now</button>
          </div>
          <div class="col-lg-6">
            <div class="card card-mindbridge p-4">
              <h5>Where Your Donation Goes</h5>
              <div class="mt-3">
                <div class="d-flex justify-content-between mb-2">
                  <span>Direct Support Programs</span><strong>70%</strong>
                </div>
                <div class="progress mb-3" style="height: 8px;">
                  <div class="progress-bar bg-primary" style="width: 70%;"></div>
                </div>
                <div class="d-flex justify-content-between mb-2">
                  <span>Resource Development</span><strong>15%</strong>
                </div>
                <div class="progress mb-3" style="height: 8px;">
                  <div class="progress-bar bg-success" style="width: 15%;"></div>
                </div>
                <div class="d-flex justify-content-between mb-2">
                  <span>Community Outreach</span><strong>10%</strong>
                </div>
                <div class="progress mb-3" style="height: 8px;">
                  <div class="progress-bar bg-warning" style="width: 10%;"></div>
                </div>
                <div class="d-flex justify-content-between mb-2">
                  <span>Administration</span><strong>5%</strong>
                </div>
                <div class="progress" style="height: 8px;">
                  <div class="progress-bar bg-secondary" style="width: 5%;"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Volunteer Section -->
    <section class="page-section bg-calm">
      <div class="container">
        <div class="text-center mb-5">
          <h2 class="section-title">Volunteer With Us</h2>
          <p class="section-subtitle">Share your time and skills to make a difference</p>
        </div>
        <div class="row g-4">
          <div class="col-md-4">
            <div class="card card-mindbridge h-100 p-4 text-center">
              <div class="h2 mb-3">🤝</div>
              <h5>Peer Support Volunteer</h5>
              <p class="text-muted small">Facilitate support groups and provide one-on-one peer support to individuals on their mental health journey.</p>
              <button class="btn btn-mindbridge-outline btn-sm mt-auto">Apply Now</button>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card card-mindbridge h-100 p-4 text-center">
              <div class="h2 mb-3">📚</div>
              <h5>Content Contributor</h5>
              <p class="text-muted small">Help create and review mental health resources, articles, and educational materials for our community.</p>
              <button class="btn btn-mindbridge-outline btn-sm mt-auto">Apply Now</button>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card card-mindbridge h-100 p-4 text-center">
              <div class="h2 mb-3">📣</div>
              <h5>Community Ambassador</h5>
              <p class="text-muted small">Raise awareness about mental health in your community and help connect people with our services.</p>
              <button class="btn btn-mindbridge-outline btn-sm mt-auto">Apply Now</button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Partnership Section -->
    <section class="page-section bg-primary-soft">
      <div class="container text-center">
        <h2 class="section-title">Partner With Us</h2>
        <p class="section-subtitle mx-auto" style="max-width: 600px;">
          We collaborate with healthcare providers, corporations, and community organisations
          to expand our reach and impact.
        </p>
        <router-link to="/contact" class="btn btn-mindbridge btn-lg">Become a Partner</router-link>
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
.donation-card {
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid transparent;
}
.donation-card:hover {
  border-color: var(--mindbridge-primary);
  background: var(--mindbridge-light);
}
@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }
}
</style>
