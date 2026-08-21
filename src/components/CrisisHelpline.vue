<script setup>
// CrisisHelpline — persistent banner across all pages
</script>

<template>
  <div class="crisis-banner" role="region" aria-label="Crisis support">
    <div class="container d-flex align-items-center justify-content-center flex-wrap gap-3">
      <span class="crisis-text">
        <strong>In crisis?</strong> You are not alone. Free, confidential support is available 24/7.
      </span>
      <a href="tel:131114" class="btn btn-crisis btn-sm">
        📞 Call Lifeline: 13 11 14
      </a>
      <span class="crisis-text d-none d-md-inline">or</span>
      <a href="tel:000" class="btn btn-outline-dark btn-sm">
        🚨 Emergency: 000
      </a>
    </div>
  </div>
</template>

<style scoped>
.crisis-banner {
  background-color: #fef5e7;
  border-bottom: 2px solid var(--mindbridge-accent);
  padding: 8px 0;
  font-size: 0.9rem;
}
.crisis-text {
  color: #7b5b20;
}
@media (max-width: 576px) {
  .crisis-banner {
    font-size: 0.8rem;
    padding: 6px 4px;
  }
  .crisis-banner .btn {
    font-size: 0.75rem;
    padding: 6px 10px;
  }
}
</style>
