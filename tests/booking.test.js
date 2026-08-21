import { test } from 'node:test'
import assert from 'node:assert/strict'
import { isPast, isWithinBusinessHours, isWeekday, hasConflict, countUpcoming } from '../src/utils/booking.js'

const bookings = [
  { id: 'b1', date: '2026-08-24', start: '09:00', end: '10:00', professional: 'Dr. Emily Chen', userId: 'u1', status: 'confirmed' },
  { id: 'b2', date: '2026-08-24', start: '11:00', end: '12:00', professional: 'James Walker', userId: 'u2', status: 'confirmed' },
  { id: 'b3', date: '2026-08-24', start: '09:00', end: '10:00', professional: 'Dr. Emily Chen', userId: 'u3', status: 'cancelled' }
]

test('isPast: end time strictly after now is not past', () => {
  const now = new Date(2026, 7, 24, 9, 0) // 24 Aug 2026 09:00 local
  assert.equal(isPast('2026-08-24', '10:00', now), false)
  assert.equal(isPast('2026-08-24', '09:00', now), true)
  assert.equal(isPast('2026-08-23', '17:00', now), true)
})

test('isWithinBusinessHours: 9-17 only, end after start', () => {
  assert.equal(isWithinBusinessHours('09:00', '10:00'), true)
  assert.equal(isWithinBusinessHours('16:00', '17:00'), true)
  assert.equal(isWithinBusinessHours('08:00', '09:00'), false)
  assert.equal(isWithinBusinessHours('16:00', '18:00'), false)
  assert.equal(isWithinBusinessHours('10:00', '09:00'), false)
})

test('isWeekday: Mon-Fri only', () => {
  assert.equal(isWeekday('2026-08-24'), true)  // Monday
  assert.equal(isWeekday('2026-08-22'), false) // Saturday
  assert.equal(isWeekday('2026-08-23'), false) // Sunday
})

test('hasConflict: same professional + same date + overlapping time only', () => {
  const newBooking = { id: 'new', date: '2026-08-24', start: '09:30', end: '10:30', professional: 'Dr. Emily Chen', userId: 'u4' }
  assert.equal(hasConflict(bookings, newBooking), true)
  // boundary: ends exactly when existing starts -> no conflict
  assert.equal(hasConflict(bookings, { ...newBooking, start: '08:00', end: '09:00' }), false)
  // different professional -> no conflict
  assert.equal(hasConflict(bookings, { ...newBooking, professional: 'Priya Patel' }), false)
  // cancelled bookings ignored (b1 conflicts, b3 cancelled)
  assert.equal(hasConflict(bookings, { ...newBooking, start: '09:00', end: '10:00' }), true)
})

test('countUpcoming: own, non-cancelled, future only', () => {
  const before = new Date(2026, 7, 20) // 20 Aug 2026 — b1 (24 Aug) still upcoming
  assert.equal(countUpcoming(bookings, 'u1', before), 1)
  assert.equal(countUpcoming(bookings, 'u3', before), 0) // cancelled
  assert.equal(countUpcoming(bookings, 'u9', before), 0)
  const after = new Date(2026, 7, 26) // 26 Aug 2026 — b1 now in the past
  assert.equal(countUpcoming(bookings, 'u1', after), 0)
})
