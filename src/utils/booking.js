// Appointment booking rules — pure functions, tested with node --test
export const BUSINESS_HOURS = { start: 9, end: 17 }

export function isPast(dateStr, endTime, now = new Date()) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const [eh, em = 0] = endTime.split(':').map(Number)
  const end = new Date(y, m - 1, d, eh, em)
  return end <= now
}

export function isWithinBusinessHours(startTime, endTime) {
  const [sh] = startTime.split(':').map(Number)
  const [eh] = endTime.split(':').map(Number)
  return sh >= BUSINESS_HOURS.start && eh <= BUSINESS_HOURS.end && eh > sh
}

export function isWeekday(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const day = new Date(y, m - 1, d).getDay()
  return day !== 0 && day !== 6
}

export function hasConflict(bookings, newBooking) {
  return bookings.some((b) => {
    if (b.id === newBooking.id) return false
    if (b.status === 'cancelled') return false
    if (b.professional !== newBooking.professional) return false
    if (b.date !== newBooking.date) return false
    return newBooking.start < b.end && newBooking.end > b.start
  })
}

export function countUpcoming(bookings, userId, now = new Date()) {
  return bookings.filter(
    (b) => b.userId === userId && b.status !== 'cancelled' && !isPast(b.date, b.end, now)
  ).length
}
