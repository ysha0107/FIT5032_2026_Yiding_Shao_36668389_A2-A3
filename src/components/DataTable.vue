<script setup>
import { ref, computed, watch } from 'vue'
import { applyFilters, applySort, paginate } from '../utils/table'
import { toCsv, downloadCsv } from '../utils/csv'

const props = defineProps({
  caption: { type: String, required: true },
  columns: { type: Array, required: true }, // [{ key, label, sortable?, searchable? }]
  rows: { type: Array, default: () => [] },
  pageSize: { type: Number, default: 10 },
  rowKey: { type: String, default: 'id' },
  selectable: { type: Boolean, default: false },
  csvFilename: { type: String, default: '' }
})

const selected = defineModel('selected', { type: Array, default: () => [] })
defineExpose({ filteredRows })

const filters = ref({})
const sortKey = ref(null)
const sortDir = ref(null)
const page = ref(1)

const filteredRows = computed(() => applyFilters(props.rows, props.columns, filters.value))
const sortedRows = computed(() => applySort(filteredRows.value, sortKey.value, sortDir.value))
const paged = computed(() => paginate(sortedRows.value, page.value, props.pageSize))
const pageRows = computed(() => paged.value.pageRows)
const totalPages = computed(() => paged.value.totalPages)

const allSelected = computed(
  () => props.rows.length > 0 && pageRows.value.every((r) => selected.value.includes(r[props.rowKey]))
)

watch(filters, () => { page.value = 1 })
watch(() => props.rows.length, () => { page.value = 1 })

function toggleSort(key) {
  if (sortKey.value !== key) { sortKey.value = key; sortDir.value = 'asc' }
  else if (sortDir.value === 'asc') { sortDir.value = 'desc' }
  else { sortKey.value = null; sortDir.value = null }
}

function toggleAll() {
  const ids = pageRows.value.map((r) => r[props.rowKey])
  if (allSelected.value) {
    selected.value = selected.value.filter((id) => !ids.includes(id))
  } else {
    selected.value = [...new Set([...selected.value, ...ids])]
  }
}

function exportCsv() {
  if (!filteredRows.value.length) return
  downloadCsv(props.csvFilename || 'export.csv', toCsv(props.columns, sortedRows.value))
}
</script>

<template>
  <div class="data-table">
    <div class="data-table-toolbar d-flex justify-content-between align-items-center mb-2 gap-2 flex-wrap">
      <span class="text-muted small" aria-live="polite">{{ filteredRows.length }} row{{ filteredRows.length !== 1 ? 's' : '' }}</span>
      <button v-if="csvFilename" type="button" class="btn btn-mindbridge-outline btn-sm" :disabled="!filteredRows.length" @click="exportCsv">
        ⬇ Export CSV
      </button>
    </div>

    <div class="table-responsive" role="region" :aria-label="caption + ' table'" tabindex="0">
      <table class="table table-striped table-hover align-middle mb-0">
        <caption class="visually-hidden">{{ caption }}</caption>
        <thead>
          <tr>
            <th v-if="selectable" scope="col">
              <input type="checkbox" :checked="allSelected" :aria-label="'Select all rows on this page'" @change="toggleAll">
            </th>
            <th
              v-for="col in columns"
              :key="col.key"
              scope="col"
              :aria-sort="sortKey === col.key ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'"
            >
              <div class="d-flex flex-column gap-1">
                <button v-if="col.sortable" type="button" class="data-table-sort" @click="toggleSort(col.key)">
                  {{ col.label }}
                  <span aria-hidden="true">{{ sortKey === col.key ? (sortDir === 'asc' ? '▲' : '▼') : '↕' }}</span>
                </button>
                <span v-else class="fw-semibold">{{ col.label }}</span>
                <input
                  v-if="col.searchable"
                  v-model="filters[col.key]"
                  type="text"
                  class="form-control form-control-sm"
                  :aria-label="'Search by ' + col.label"
                  placeholder="Search…"
                >
              </div>
            </th>
            <th v-if="$slots.actions" scope="col"><span class="visually-hidden">Row actions</span></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in pageRows" :key="row[rowKey] ?? row._index">
            <td v-if="selectable">
              <input v-model="selected" type="checkbox" :value="row[rowKey]" :aria-label="'Select row ' + row[rowKey]">
            </td>
            <td v-for="col in columns" :key="col.key">
              <slot :name="'cell-' + col.key" :row="row" :value="row[col.key]">{{ row[col.key] }}</slot>
            </td>
            <td v-if="$slots.actions"><slot name="actions" :row="row"></slot></td>
          </tr>
          <tr v-if="!pageRows.length">
            <td :colspan="columns.length + (selectable ? 1 : 0) + ($slots.actions ? 1 : 0)" class="text-center text-muted py-4">
              No rows found.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <nav class="data-table-pagination d-flex align-items-center justify-content-between mt-2 flex-wrap gap-2" aria-label="Table pagination">
      <button type="button" class="btn btn-outline-secondary btn-sm" :disabled="page <= 1" @click="page--">← Previous</button>
      <span aria-live="polite">Page {{ page }} of {{ totalPages }}</span>
      <button type="button" class="btn btn-outline-secondary btn-sm" :disabled="page >= totalPages" @click="page++">Next →</button>
    </nav>
  </div>
</template>
