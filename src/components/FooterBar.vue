<script setup>
// FooterBar — MindBridge Health Foundation
</script>

<template>
  <footer class="footer bg-dark text-white pt-5 pb-3">
    <div class="container">
      <div class="row g-4">
        <div class="col-lg-4 col-md-6">
          <h3 class="footer-heading fs-5">
            <span class="me-2">🧠</span>MindBridge Health Foundation
          </h3>
          <p class="footer-text">
            Connecting individuals with accessible, evidence-based mental health resources and support. Together, we build bridges to better mental health.
          </p>
          <div class="footer-social mt-3">
            <a href="#" class="social-link" aria-label="Facebook">📘</a>
            <a href="#" class="social-link" aria-label="Twitter">🐦</a>
            <a href="#" class="social-link" aria-label="Instagram">📷</a>
            <a href="#" class="social-link" aria-label="LinkedIn">💼</a>
          </div>
        </div>

        <div class="col-lg-2 col-md-6">
          <h6 class="footer-heading">Quick Links</h6>
          <ul class="list-unstyled">
            <li><router-link to="/" class="footer-link">Home</router-link></li>
            <li><router-link to="/about" class="footer-link">About Us</router-link></li>
            <li><router-link to="/resources" class="footer-link">Resources</router-link></li>
            <li><router-link to="/services" class="footer-link">Services</router-link></li>
          </ul>
        </div>

        <div class="col-lg-2 col-md-6">
          <h6 class="footer-heading">Get Help</h6>
          <ul class="list-unstyled">
            <li><router-link to="/contact" class="footer-link">Contact Us</router-link></li>
            <li><a href="#" class="footer-link">Crisis Helpline</a></li>
            <li><a href="#" class="footer-link">Find a Therapist</a></li>
            <li><a href="#" class="footer-link">FAQs</a></li>
          </ul>
        </div>

        <div class="col-lg-4 col-md-6">
          <h6 class="footer-heading">Stay Connected</h6>
          <p class="footer-text mb-2">Subscribe to our newsletter for mental health resources and updates.</p>
          <div class="input-group mb-2">
            <input type="email" class="form-control" placeholder="Your email" aria-label="Email for newsletter">
            <button class="btn btn-accent" type="button">Subscribe</button>
          </div>
          <small class="footer-text">We respect your privacy. Unsubscribe anytime.</small>
        </div>
      </div>

      <hr class="my-4" style="border-color: rgba(255,255,255,0.15);">

      <div class="row">
        <div class="col-md-6 text-center text-md-start">
          <p class="mb-0 footer-text small">&copy; {{ new Date().getFullYear() }} MindBridge Health Foundation. All rights reserved.</p>
        </div>
        <div class="col-md-6 text-center text-md-end">
          <a href="#" class="footer-link small me-3">Privacy Policy</a>
          <a href="#" class="footer-link small me-3">Terms of Service</a>
          <a href="#" class="footer-link small">Accessibility</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background: linear-gradient(135deg, #1a365d 0%, #1a4d5e 100%);
  margin-top: auto;
}
.footer-heading {
  color: #ffffff;
  font-weight: 600;
  margin-bottom: 1rem;
}
.footer-text {
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.6;
}
.footer-link {
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  padding: 0.15rem 0;
  display: inline-block;
  transition: color 0.2s;
}
.footer-link:hover {
  color: var(--mindbridge-accent);
}
.social-link {
  font-size: 1.3rem;
  margin-right: 0.75rem;
  text-decoration: none;
  transition: transform 0.2s;
  display: inline-block;
}
.social-link:hover {
  transform: scale(1.15);
}
</style>
