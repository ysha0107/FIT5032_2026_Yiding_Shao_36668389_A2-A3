import { test } from 'node:test'
import assert from 'node:assert/strict'
import { toCsv } from '../src/utils/csv.js'

const columns = [{ key: 'name', label: 'Name' }, { key: 'note', label: 'Note' }]

test('toCsv builds header + rows with BOM and CRLF', () => {
  const csv = toCsv(columns, [{ name: 'A', note: 'plain' }])
  assert.equal(csv, '﻿Name,Note\r\nA,plain')
})

test('toCsv escapes quotes, commas and newlines', () => {
  const csv = toCsv(columns, [{ name: 'A, "B"', note: 'line1\nline2' }])
  assert.equal(csv, '﻿Name,Note\r\n"A, ""B""","line1\nline2"')
})

test('toCsv renders null/undefined as empty', () => {
  const csv = toCsv(columns, [{ name: null, note: undefined }])
  assert.equal(csv, '﻿Name,Note\r\n,')
})
