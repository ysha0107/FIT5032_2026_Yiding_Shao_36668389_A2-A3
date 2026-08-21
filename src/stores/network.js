// Online/offline state + localStorage sync queue (F.1 innovation #4)
import { ref } from 'vue'

const isOnline = ref(navigator.onLine)
const QUEUE_KEY = 'mindbridge_offline_queue'
const flushers = []

window.addEventListener('online', () => {
  isOnline.value = true
  flushQueue()
})
window.addEventListener('offline', () => { isOnline.value = false })

export function useNetworkStore() {
  return { isOnline }
}

export function enqueue(type, payload) {
  const q = JSON.parse(localStorage.getItem(QUEUE_KEY) || '{"contacts":[],"ratings":[]}')
  q[type] = q[type] || []
  q[type].push(payload)
  localStorage.setItem(QUEUE_KEY, JSON.stringify(q))
}

export function registerFlusher(fn) { flushers.push(fn) }

export async function flushQueue() {
  for (const fn of flushers) {
    try { await fn() } catch (e) { console.error('flush failed', e) }
  }
}
