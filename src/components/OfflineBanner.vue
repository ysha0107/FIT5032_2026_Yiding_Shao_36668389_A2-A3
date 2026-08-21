<script setup>
import { useNetworkStore } from '../stores/network'

const { isOnline } = useNetworkStore()
</script>

<template>
  <div v-if="!isOnline" class="offline-banner" role="status">
    ⚠️ You are offline — new messages and ratings will be saved locally and synced when you reconnect.
  </div>
</template>

<style scoped>
.offline-banner {
  background: #f0a04b;
  color: #3a2a12;
  text-align: center;
  padding: 0.5rem 1rem;
  font-weight: 600;
}
</style>
