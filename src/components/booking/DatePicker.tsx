import { useState } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval,
         startOfWeek, endOfWeek, isSameMonth, isSameDay,
         addMonths, subMonths, isBefore, startOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type {
  Availability,
  BlockedDate,
  Booking,
} from '../../types'
import { hasAvailableSlots } from '../../utils/timeSlots'


type BookingAvailabilityData = Pick<
  Booking,
  'date' | 'status' | 'start_time' | 'end_time'
>

interface Props {
  availability:     Availability[]
  blockedDates:     BlockedDate[]
  existingBookings: BookingAvailabilityData[]
  serviceDuration:  number
  selected:         Date | null
  onSelect:         (date: Date) => void
}

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export function DatePicker({
  availability, blockedDates, existingBookings,
  serviceDuration, selected, onSelect,
}: Props) {
  const today = startOfDay(new Date())
  const [viewMonth, setViewMonth] = useState(() => addMonths(today, 0))

  const monthStart = startOfMonth(viewMonth)
  const monthEnd   = endOfMonth(viewMonth)

  // Grid começa na semana do primeiro dia e termina na semana do último
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const calEnd   = endOfWeek(monthEnd,     { weekStartsOn: 0 })
  const days     = eachDayOfInterval({ start: calStart, end: calEnd })

  function isAvailable(day: Date) {
    if (isBefore(day, addMonths(today, 0)) && !isSameDay(day, today)) return false
    if (isBefore(day, today)) return false
    return hasAvailableSlots(day, availability, blockedDates, existingBookings, serviceDuration)
  }

  return (
    <div className="date-picker">
      {/* Header do mês */}
      <div className="date-picker-header">
        <button className="date-picker-nav"
          onClick={() => setViewMonth(m => subMonths(m, 1))}
          disabled={isSameMonth(viewMonth, today)}>
          <ChevronLeft size={18} />
        </button>

        <h3 className="date-picker-month">
          {format(viewMonth, 'MMMM yyyy', { locale: ptBR })}
        </h3>

        <button className="date-picker-nav"
          onClick={() => setViewMonth(m => addMonths(m, 1))}
          disabled={isSameMonth(viewMonth, addMonths(today, 2))}>
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Dias da semana */}
      <div className="date-picker-weekdays">
        {WEEKDAYS.map(d => (
          <span key={d} className="date-picker-weekday">{d}</span>
        ))}
      </div>

      {/* Grid de dias */}
      <div className="date-picker-grid">
        {days.map(day => {
          const inMonth  = isSameMonth(day, viewMonth)
          const avail    = inMonth && isAvailable(day)
          const isToday  = isSameDay(day, today)
          const isSel    = selected && isSameDay(day, selected)

          return (
            <button
              key={day.toISOString()}
              disabled={!avail}
              onClick={() => avail && onSelect(day)}
              className={[
                'date-picker-day',
                !inMonth  ? 'date-picker-day--outside'  : '',
                isToday   ? 'date-picker-day--today'    : '',
                avail     ? 'date-picker-day--available' : '',
                isSel     ? 'date-picker-day--selected'  : '',
              ].join(' ')}
            >
              {format(day, 'd')}
            </button>
          )
        })}
      </div>
    </div>
  )
}