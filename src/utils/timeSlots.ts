import { format, addMinutes, setHours, setMinutes } from 'date-fns'
import type { Availability, BlockedDate, Booking } from '../types'

type BookingAvailabilityData = Pick<
  Booking,
  'date' | 'status' | 'start_time' | 'end_time'
>

function timeToDate(base: Date, timeStr: string): Date {
  const [h, m] = timeStr.split(':').map(Number)
  return setMinutes(setHours(new Date(base), h), m)
}

export function generateSlots(
  date: Date,
  availability: Availability[],
  blockedDates: BlockedDate[],
  existingBookings: BookingAvailabilityData[],
  serviceDurationMin: number,
  slotIntervalMin = 30,
): string[] {
  const dateStr = format(date, 'yyyy-MM-dd')
  if (blockedDates.some(b => b.blocked_date === dateStr)) return []
  const avail = availability.find(a => a.day_of_week === date.getDay())
  if (!avail) return []

  const windowStart = timeToDate(date, avail.start_time)
  const windowEnd   = timeToDate(date, avail.end_time)
  const dayBookings = existingBookings.filter(b => b.date === dateStr && b.status !== 'cancelled')
  const slots: string[] = []
  let cursor = new Date(windowStart)

  while (addMinutes(cursor, serviceDurationMin) <= windowEnd) {
    const slotEnd = addMinutes(cursor, serviceDurationMin)
    const hasConflict = dayBookings.some(b => {
      const bStart = timeToDate(date, b.start_time)
      const bEnd   = timeToDate(date, b.end_time)
      return cursor < bEnd && slotEnd > bStart
    })
    if (!hasConflict) slots.push(format(cursor, 'HH:mm'))
    cursor = addMinutes(cursor, slotIntervalMin)
  }
  return slots
}

export function calcEndTime(startTime: string, durationMin: number): string {
  const [h, m] = startTime.split(':').map(Number)
  return format(addMinutes(setMinutes(setHours(new Date(), h), m), durationMin), 'HH:mm')
}

export function hasAvailableSlots(
  date: Date,
  availability: Availability[],
  blockedDates: BlockedDate[],
  existingBookings: BookingAvailabilityData[],
  serviceDurationMin: number,
): boolean {
  return generateSlots(date, availability, blockedDates, existingBookings, serviceDurationMin).length > 0
}