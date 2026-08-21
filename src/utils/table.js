// Pure table logic shared by DataTable.vue — kept dependency-free for node --test
export function applyFilters(rows, columns, filters) {
  const active = columns.filter(
    (c) => c.searchable !== false && (filters[c.key] || '').trim() !== ''
  )
  if (!active.length) return rows
  return rows.filter((row) =>
    active.every((col) => {
      const hay = String(row[col.key] ?? '')
      return hay.toLowerCase().includes(filters[col.key].trim().toLowerCase())
    })
  )
}

export function applySort(rows, sortKey, sortDir) {
  if (!sortKey || !sortDir) return rows
  const dir = sortDir === 'asc' ? 1 : -1
  return [...rows].sort((a, b) => {
    const av = a[sortKey]
    const bv = b[sortKey]
    if (av == null) return 1
    if (bv == null) return -1
    if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir
    return String(av).localeCompare(String(bv), undefined, { numeric: true, sensitivity: 'base' }) * dir
  })
}

export function paginate(rows, page, pageSize) {
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize))
  const p = Math.min(Math.max(1, page), totalPages)
  const start = (p - 1) * pageSize
  return { pageRows: rows.slice(start, start + pageSize), totalPages, page: p }
}
