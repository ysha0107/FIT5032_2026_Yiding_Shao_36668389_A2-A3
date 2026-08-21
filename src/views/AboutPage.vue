<script setup>
// AboutPage — MindBridge Health Foundation
</script>

<template>
  <div class="about-page">
    <!-- Hero -->
    <section class="hero-gradient page-section">
      <div class="container text-center">
        <h1 class="hero-title">About MindBridge</h1>
        <p class="hero-subtitle mx-auto" style="max-width: 700px;">
          We are a health charity dedicated to bridging the gap between those who need mental health
          support and the resources that can help them thrive.
        </p>
      </div>
    </section>

    <!-- Mission & Vision -->
    <section class="page-section bg-white">
      <div class="container">
        <div class="row g-5 align-items-center">
          <div class="col-lg-6">
            <h2 class="section-title">Our Mission</h2>
            <p class="mb-4">
              At MindBridge Health Foundation, our mission is to provide accessible, evidence-based
              mental health resources and support to underrepresented communities. We believe that
              everyone deserves access to quality mental health care, regardless of their
              background, location, or financial situation.
            </p>
            <p class="mb-4">
              Founded in 2020, we have grown from a small community initiative to a nationwide
              organisation supporting over 50,000 Australians each year through our programs,
              resources, and support services.
            </p>
            <h4 class="mt-4">Our Values</h4>
            <ul class="list-unstyled mt-3">
              <li class="mb-2">💚 <strong>Compassion</strong> — We lead with empathy in everything we do.</li>
              <li class="mb-2">🤝 <strong>Inclusivity</strong> — Mental health support should be accessible to all.</li>
              <li class="mb-2">🔬 <strong>Evidence-Based</strong> — Our resources are grounded in clinical research.</li>
              <li class="mb-2">🌱 <strong>Growth</strong> — We believe recovery and growth are always possible.</li>
              <li class="mb-2">🔒 <strong>Privacy</strong> — We protect the confidentiality of everyone we serve.</li>
            </ul>
          </div>
          <div class="col-lg-6">
            <div class="about-image-placeholder p-5 text-center rounded" style="background: var(--mindbridge-light);">
              <span style="font-size: 5rem;">🧠</span>
              <h4 class="mt-3">Building Bridges to Better Mental Health</h4>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Impact -->
    <section class="page-section bg-calm">
      <div class="container">
        <div class="text-center mb-5">
          <h2 class="section-title">Our Impact</h2>
          <p class="section-subtitle">Making a measurable difference in the community</p>
        </div>
        <div class="row g-4 text-center">
          <div class="col-md-4">
            <div class="card card-mindbridge p-4">
              <div class="h2 text-primary">50,000+</div>
              <p>Individuals supported since 2020</p>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card card-mindbridge p-4">
              <div class="h2 text-primary">98%</div>
              <p>Of users report improved mental wellbeing</p>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card card-mindbridge p-4">
              <div class="h2 text-primary">300+</div>
              <p>Volunteer mental health professionals</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Team -->
    <section class="page-section bg-white">
      <div class="container">
        <div class="text-center mb-5">
          <h2 class="section-title">Our Leadership Team</h2>
          <p class="section-subtitle">Dedicated professionals committed to mental health advocacy</p>
        </div>
        <div class="row g-4">
          <div class="col-lg-3 col-md-6" v-for="member in 4" :key="member">
            <div class="card card-mindbridge p-4 text-center">
              <div class="team-avatar mb-3">👤</div>
              <h3 class="fs-5">Team Member</h3>
              <small class="text-muted">Leadership Role</small>
              <p class="small mt-2 text-muted">Committed to advancing mental health support and advocacy in our community.</p>
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
.about-image-placeholder {
  min-height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.team-avatar {
  font-size: 3.5rem;
}
@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }
}
</style>
