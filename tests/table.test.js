import { test } from 'node:test'
import assert from 'node:assert/strict'
import { applyFilters, applySort, paginate } from '../src/utils/table.js'

const columns = [
  { key: 'name', label: 'Name', sortable: true, searchable: true },
  { key: 'role', label: 'Role', sortable: true, searchable: true },
  { key: 'count', label: 'Count', sortable: true, searchable: false }
]
const rows = [
  { id: 1, name: 'Alice', role: 'admin', count: 3 },
  { id: 2, name: 'bob', role: 'client', count: 10 },
  { id: 3, name: 'Carla', role: 'volunteer', count: 2 }
]

test('applyFilters matches per-column, case-insensitive, AND across columns', () => {
  assert.deepEqual(applyFilters(rows, columns, { name: 'a', role: '' }), [rows[0], rows[2]])
  assert.deepEqual(applyFilters(rows, columns, { name: 'bob', role: 'client' }), [rows[1]])
  assert.deepEqual(applyFilters(rows, columns, { name: 'bob', role: 'admin' }), [])
  // non-searchable column is ignored
  assert.deepEqual(applyFilters(rows, columns, { count: '3' }), rows)
})

test('applyFilters ignores whitespace-only filters', () => {
  assert.deepEqual(applyFilters(rows, columns, { name: '   ', role: '' }), rows)
})

test('applySort sorts asc/desc, numbers numerically, case-insensitive strings', () => {
  assert.deepEqual(applySort(rows, 'name', 'asc').map((r) => r.id), [1, 2, 3])
  assert.deepEqual(applySort(rows, 'name', 'desc').map((r) => r.id), [3, 2, 1])
  assert.deepEqual(applySort(rows, 'count', 'desc').map((r) => r.id), [2, 1, 3])
  // does not mutate input
  assert.equal(rows[0].name, 'Alice')
})

test('paginate clamps page and computes totalPages', () => {
  assert.deepEqual(paginate(rows, 1, 2), { pageRows: [rows[0], rows[1]], totalPages: 2, page: 1 })
  assert.deepEqual(paginate(rows, 2, 2), { pageRows: [rows[2]], totalPages: 2, page: 2 })
  assert.deepEqual(paginate(rows, 9, 2), { pageRows: [rows[2]], totalPages: 2, page: 2 })
  assert.equal(paginate([], 1, 10).totalPages, 1)
})
