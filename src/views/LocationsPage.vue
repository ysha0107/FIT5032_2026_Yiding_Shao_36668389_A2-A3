<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useServicesStore } from '../stores/services'

// Fix default marker icons missing under bundlers
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow
})

const { services } = useServicesStore()

const mapEl = ref(null)
const searchQuery = ref('')
const routeInfo = ref(null)
const searching = ref(false)
const errorMessage = ref('')
let map = null
let routeLayer = null
let searchMarker = null
let lastSearchPoint = null

onMounted(() => {
  map = L.map(mapEl.value).setView([-37.8136, 144.9631], 12)
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map)

  services.value.forEach((s) => {
    const marker = L.marker([s.lat, s.lng])
      .addTo(map)
      .bindPopup(`<strong>${s.name}</strong><br>${s.category}<br><button id="route-${s.id}" class="btn btn-mindbridge btn-sm mt-1">Route here</button>`)
    marker.on('popupopen', () => {
      const btn = document.getElementById('route-' + s.id)
      if (btn) btn.addEventListener('click', () => routeTo(s))
    })
  })
})

onBeforeUnmount(() => {
  if (map) map.remove()
})

// E.2 feature 1: geocoding search (Nominatim)
async function handleSearch() {
  if (!searchQuery.value.trim()) return
  searching.value = true
  errorMessage.value = ''
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(searchQuery.value)}`
    )
    const results = await res.json()
    if (!results.length) {
      errorMessage.value = 'No location found for that search.'
      return
    }
    const hit = results[0]
    const point = [parseFloat(hit.lat), parseFloat(hit.lon)]
    lastSearchPoint = point
    if (searchMarker) map.removeLayer(searchMarker)
    searchMarker = L.marker(point).addTo(map).bindPopup(`<strong>${hit.display_name}</strong>`).openPopup()
    map.flyTo(point, 14)
    clearRoute()
  } catch (e) {
    errorMessage.value = 'Search failed. Please try again in a moment.'
  } finally {
    searching.value = false
  }
}

// E.2 feature 2: routing (OSRM) — from search point / user location to a service
async function routeTo(service) {
  errorMessage.value = ''
  let start = lastSearchPoint
  if (!start) {
    start = await new Promise((resolve) => {
      if (!navigator.geolocation) return resolve(null)
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve([pos.coords.latitude, pos.coords.longitude]),
        () => resolve(null)
      )
    })
  }
  if (!start) {
    errorMessage.value = 'Search for a starting address first, or allow location access.'
    return
  }
  const end = [service.lat, service.lng]
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`
    const res = await fetch(url)
    const data = await res.json()
    if (!data.routes || !data.routes.length) {
      errorMessage.value = 'No route found between these points.'
      return
    }
    const route = data.routes[0]
    clearRoute()
    routeLayer = L.geoJSON(route.geometry, { style: { color: '#2c6f8f', weight: 5 } }).addTo(map)
    routeInfo.value = {
      service: service.name,
      distanceKm: (route.distance / 1000).toFixed(1),
      durationMin: Math.round(route.duration / 60)
    }
    map.fitBounds(L.geoJSON(route.geometry).getBounds())
  } catch (e) {
    errorMessage.value = 'Routing failed. Please try again in a moment.'
  }
}

function clearRoute() {
  if (routeLayer) { map.removeLayer(routeLayer); routeLayer = null }
  routeInfo.value = null
}
</script>

<template>
  <div class="locations-page">
    <section class="hero-gradient page-section pb-4">
      <div class="container text-center">
        <h1 class="hero-title">Find Support Near You</h1>
        <p class="hero-subtitle mx-auto" style="max-width: 700px;">
          Search for a place of interest or plan your route to one of our MindBridge centres.
        </p>
      </div>
    </section>

    <section class="page-section pt-4">
      <div class="container">
        <div class="card card-mindbridge p-4">
          <div class="row g-3 mb-3">
            <div class="col-md-6">
              <label for="map-search" class="form-label">Search a place of interest</label>
              <div class="d-flex gap-2">
                <input
                  id="map-search"
                  v-model="searchQuery"
                  type="text"
                  class="form-control"
                  placeholder="e.g. Flinders Street Station, Melbourne"
                  @keyup.enter="handleSearch"
                >
                <button type="button" class="btn btn-mindbridge text-nowrap" :disabled="searching" @click="handleSearch">
                  <span v-if="searching" class="spinner-border spinner-border-sm me-1"></span>
                  Search
                </button>
              </div>
            </div>
            <div class="col-md-6 d-flex align-items-end">
              <div v-if="routeInfo" class="alert alert-success mb-0 py-2" role="status">
                <strong>Route to {{ routeInfo.service }}:</strong>
                {{ routeInfo.distanceKm }} km · about {{ routeInfo.durationMin }} min
                <button type="button" class="btn-close ms-2" aria-label="Clear route" @click="clearRoute"></button>
              </div>
              <p v-else class="text-muted small mb-0">
                Click a centre marker and choose “Route here”, or search an address first to route from it.
              </p>
            </div>
          </div>
          <div v-if="errorMessage" class="alert alert-warning py-2" role="alert">{{ errorMessage }}</div>
          <div ref="mapEl" class="map-container" aria-label="Map of MindBridge centres and searched locations" role="application"></div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.hero-title { font-size: 2.8rem; font-weight: 700; color: var(--mindbridge-heading); }
.hero-subtitle { font-size: 1.15rem; color: var(--mindbridge-text); line-height: 1.7; }
.map-container { height: 480px; border-radius: 12px; z-index: 0; }
@media (max-width: 768px) { .hero-title { font-size: 2rem; } .map-container { height: 340px; } }
</style>
