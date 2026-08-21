// PDF export via jsPDF + autotable (E.4 — export in multiple formats)
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

export function exportTablePdf(title, columns, rows, filename) {
  const doc = new jsPDF()
  doc.setFontSize(16)
  doc.text(title, 14, 16)
  autoTable(doc, {
    startY: 22,
    head: [columns.map((c) => c.label)],
    body: rows.map((r) => columns.map((c) => formatCell(r[c.key])))
  })
  doc.save(filename)
}

function formatCell(value) {
  if (value == null) return ''
  if (value && value.seconds) return new Date(value.seconds * 1000).toLocaleString()
  return String(value)
}
