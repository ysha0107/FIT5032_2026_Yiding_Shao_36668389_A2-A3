<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRatingsStore } from '../stores/ratings'

const props = defineProps({
  itemId: {
    type: [Number, String],
    required: true
  },
  readOnly: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['rated'])

const { currentUser, isLoggedIn } = useAuthStore()
const { getRating, getUserRating, addOrUpdateRating } = useRatingsStore()

const hoverRating = ref(0)
const queuedMessage = ref('')

const ratingData = computed(() => getRating(props.itemId))
const userRating = computed(() => getUserRating(props.itemId))

async function rate(score) {
  if (!isLoggedIn.value || props.readOnly) return
  queuedMessage.value = ''
  const result = await addOrUpdateRating(props.itemId, score)
  if (result.queued) {
    queuedMessage.value = 'Saved offline — will sync when you reconnect.'
  }
  emit('rated', { score, itemId: props.itemId })
}

function starClass(index) {
  const effective = hoverRating.value || userRating.value?.score || 0
  if (props.readOnly) {
    const avg = parseFloat(ratingData.value.average) || 0
    return index <= Math.round(avg) ? 'star-filled' : 'star-empty'
  }
  return index <= effective ? 'star-filled' : 'star-empty'
}
</script>

<template>
  <div class="star-rating">
    <div class="stars d-inline-flex align-items-center gap-1" role="group" aria-label="Rate this service from 1 to 5 stars">
      <button
        v-for="star in 5"
        :key="star"
        type="button"
        class="star-btn"
        :class="[starClass(star), { clickable: !readOnly && isLoggedIn }]"
        :disabled="readOnly || !isLoggedIn"
        :aria-label="`Rate ${star} out of 5 stars`"
        :aria-pressed="userRating?.score === star && !readOnly"
        @click="rate(star)"
        @mouseenter="hoverRating = star"
        @mouseleave="hoverRating = 0"
      >
        ★
      </button>
    </div>
    <span v-if="ratingData.count > 0" class="rating-text ms-2">
      {{ ratingData.average }} / 5
      <small class="text-muted">({{ ratingData.count }} rating{{ ratingData.count !== 1 ? 's' : '' }})</small>
    </span>
    <span v-else class="rating-text ms-2 text-muted">
      No ratings yet
    </span>
    <span v-if="queuedMessage" class="text-muted small ms-2" role="status">{{ queuedMessage }}</span>
    <div v-if="!isLoggedIn && !readOnly" class="mt-1">
      <small class="text-muted">
        <router-link to="/login">Login</router-link> to rate
      </small>
    </div>
  </div>
</template>

<style scoped>
.star-btn {
  background: none;
  border: none;
  font-size: 1.4rem;
  padding: 0;
  cursor: default;
  transition: transform 0.15s;
  line-height: 1;
}
.star-btn.clickable {
  cursor: pointer;
}
.star-btn.clickable:hover {
  transform: scale(1.2);
}
.star-filled {
  color: #f0a04b;
}
.star-empty {
  color: #d1d5db;
}
.rating-text {
  font-weight: 600;
  color: var(--mindbridge-heading);
  font-size: 0.95rem;
}
</style>
