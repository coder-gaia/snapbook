import { DatePicker } from './DatePicker'
import { Button } from '../ui/Button'
import type {
  Availability,
  BlockedDate,
  Booking,
  Service,
} from '../../types'

interface Props {
  service: Service
  availability: Availability[]
  blockedDates: BlockedDate[]
  existingBookings: Booking[]
  selected: Date | null
  onSelect: (date: Date) => void
  onBack: () => void
}

export function DateStep({
  service,
  availability,
  blockedDates,
  existingBookings,
  selected,
  onSelect,
  onBack,
}: Props) {
  return (
    <div>
      <h2 className="booking-step-title">Escolha a data</h2>

      <p
        className="text-sm text-muted"
        style={{ marginBottom: 20 }}
      >
        Serviço:{' '}
        <strong style={{ color: 'var(--color-offwhite)' }}>
          {service.name}
        </strong>
      </p>

      <DatePicker
        availability={availability}
        blockedDates={blockedDates}
        existingBookings={existingBookings}
        serviceDuration={service.duration_min}
        selected={selected}
        onSelect={onSelect}
      />

      <Button
        variant="ghost"
        style={{ marginTop: 20 }}
        onClick={onBack}
      >
        ← Voltar
      </Button>
    </div>
  )
}