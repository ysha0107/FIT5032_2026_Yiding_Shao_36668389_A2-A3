<script setup>
import NavBar from './components/NavBar.vue'
import FooterBar from './components/FooterBar.vue'
import CrisisHelpline from './components/CrisisHelpline.vue'
import OfflineBanner from './components/OfflineBanner.vue'
</script>

<template>
  <div id="app-wrapper">
    <a href="#main" class="skip-link">Skip to main content</a>
    <OfflineBanner />
    <CrisisHelpline />
    <NavBar />
    <main id="main" class="main-content" tabindex="-1">
      <router-view />
    </main>
    <FooterBar />
  </div>
</template>

<style scoped>
#app-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.main-content {
  flex: 1;
}
</style>
