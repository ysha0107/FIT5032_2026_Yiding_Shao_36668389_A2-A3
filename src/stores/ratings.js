// Rating system store — localStorage persisted for BR C.3
import { ref, computed } from 'vue'

const STORAGE_KEY = 'mindbridge_ratings'

// Load ratings from localStorage
const ratings = ref(JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'))

function saveRatings() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ratings.value))
}

export function useRatingsStore() {
  function getRating(itemId) {
    const itemRatings = ratings.value[itemId] || []
    if (itemRatings.length === 0) {
      return { average: 0, count: 0, ratings: [] }
    }
    const sum = itemRatings.reduce((acc, r) => acc + r.score, 0)
    return {
      average: (sum / itemRatings.length).toFixed(1),
      count: itemRatings.length,
      ratings: itemRatings
    }
  }

  function getUserRating(itemId, userId) {
    const itemRatings = ratings.value[itemId] || []
    return itemRatings.find(r => r.userId === userId) || null
  }

  function addOrUpdateRating(itemId, userId, score) {
    if (!ratings.value[itemId]) {
      ratings.value[itemId] = []
    }

    const existingIndex = ratings.value[itemId].findIndex(r => r.userId === userId)
    if (existingIndex >= 0) {
      ratings.value[itemId][existingIndex].score = score
      ratings.value[itemId][existingIndex].updatedAt = new Date().toISOString()
    } else {
      ratings.value[itemId].push({
        userId,
        score,
        createdAt: new Date().toISOString()
      })
    }

    saveRatings()
    return getRating(itemId)
  }

  function getAllRatings() {
    const result = {}
    for (const [itemId, itemRatings] of Object.entries(ratings.value)) {
      if (itemRatings.length > 0) {
        const sum = itemRatings.reduce((acc, r) => acc + r.score, 0)
        result[itemId] = {
          average: (sum / itemRatings.length).toFixed(1),
          count: itemRatings.length
        }
      }
    }
    return result
  }

  return {
    getRating,
    getUserRating,
    addOrUpdateRating,
    getAllRatings
  }
}
