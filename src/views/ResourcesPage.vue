<script setup>
import { useResourcesStore } from '../stores/resources'

const { resources, categories, searchQuery, selectedCategory, filteredResources } = useResourcesStore()
</script>

<template>
  <div class="resources-page">
    <!-- Hero -->
    <section class="hero-gradient page-section pb-4">
      <div class="container text-center">
        <h1 class="hero-title">Resources & Articles</h1>
        <p class="hero-subtitle mx-auto" style="max-width: 700px;">
          Explore our library of evidence-based articles, guides, and self-help resources
          curated by mental health professionals.
        </p>
      </div>
    </section>

    <section class="page-section pt-0">
      <div class="container">
        <!-- Search & Filter -->
        <div class="row mb-4">
          <div class="col-lg-4 col-md-5 mb-3 mb-md-0">
            <div class="input-group">
              <span class="input-group-text bg-white">🔍</span>
              <input
                v-model="searchQuery"
                type="text"
                class="form-control"
                placeholder="Search resources..."
                aria-label="Search resources"
              />
            </div>
          </div>
          <div class="col-lg-8 col-md-7">
            <div class="d-flex flex-wrap gap-2">
              <button
                v-for="cat in categories"
                :key="cat.key"
                @click="selectedCategory = cat.key"
                class="btn btn-sm"
                :class="selectedCategory === cat.key ? 'btn-mindbridge' : 'btn-outline-secondary'"
              >
                {{ cat.label }}
              </button>
            </div>
          </div>
        </div>

        <!-- Results count -->
        <div class="mb-4 text-muted">
          <small>Showing {{ filteredResources.length }} of {{ resources.length }} resources</small>
        </div>

        <!-- Resource Grid -->
        <div class="row g-4">
          <div class="col-lg-6" v-for="resource in filteredResources" :key="resource.id">
            <div class="card card-mindbridge h-100">
              <div class="card-body">
                <div class="d-flex flex-wrap gap-2 mb-2">
                  <span class="badge bg-soft-primary text-primary">{{ resource.category }}</span>
                  <span v-for="tag in resource.tags.slice(0, 2)" :key="tag" class="badge bg-light text-muted">{{ tag }}</span>
                </div>
                <h5 class="card-title">{{ resource.title }}</h5>
                <p class="card-text text-muted">{{ resource.excerpt }}</p>
                <div class="d-flex justify-content-between align-items-center mt-3">
                  <small class="text-muted">By {{ resource.author }} · {{ resource.readTime }} read</small>
                  <small class="text-muted">{{ resource.date }}</small>
                </div>
              </div>
              <div class="card-footer bg-white border-0">
                <button class="btn btn-mindbridge-outline btn-sm w-100">Read Article</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div v-if="filteredResources.length === 0" class="text-center py-5">
          <span style="font-size: 3rem;">📭</span>
          <h4 class="mt-3">No resources found</h4>
          <p class="text-muted">Try adjusting your search or filter criteria.</p>
          <button class="btn btn-mindbridge" @click="searchQuery = ''; selectedCategory = 'all'">
            Clear Filters
          </button>
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
.bg-soft-primary {
  background: rgba(44, 111, 143, 0.1);
}
@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }
}
</style>
