import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { formatBRL, formatDate, formatTime, DAY_NAMES_SHORT } from '../../utils/formatters'
import type { Booking } from '../../types'

type StatusVariant = 'warning' | 'success' | 'danger' | 'gray'

// eslint-disable-next-line react-refresh/only-export-components
export function bookingStatusInfo(status: Booking['status']): { label: string; variant: StatusVariant } {
  switch (status) {
    case 'pending_payment': return { label: 'Aguardando pagamento', variant: 'warning' }
    case 'confirmed':       return { label: 'Confirmado',           variant: 'success' }
    case 'cancelled':       return { label: 'Cancelado',            variant: 'danger'  }
    case 'completed':       return { label: 'Concluído',            variant: 'gray'    }
  }
}

interface Props {
  booking:         Booking
  onConfirm?:      (id: string) => void
  onClick?:        (booking: Booking) => void
  compact?:        boolean
}

export function BookingCard({ booking: b, onConfirm, onClick, compact }: Props) {
  const s = bookingStatusInfo(b.status)

  if (compact) {
    return (
      <div className="dash-booking-item">
        <div className="dash-booking-date">
          <span className="text-xs text-muted">{DAY_NAMES_SHORT[new Date(b.date + 'T12:00').getDay()]}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 18, color: 'var(--color-gold)' }}>
            {new Date(b.date + 'T12:00').getDate()}
          </span>
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 500, fontSize: 14 }}>{b.client_name}</p>
          <p className="text-xs text-muted">{b.service?.name} · {formatTime(b.start_time)}</p>
        </div>
        {b.service?.price && (
          <span className="text-mono text-sm" style={{ color: 'var(--color-gold)' }}>
            {formatBRL(b.service.price)}
          </span>
        )}
      </div>
    )
  }

  return (
    <div className="card agenda-card" onClick={() => onClick?.(b)} style={{ cursor: onClick ? 'pointer' : undefined }}>
      <div className="agenda-card-header">
        <div>
          <p style={{ fontWeight: 600, fontSize: 15 }}>{b.client_name}</p>
          <p className="text-sm text-muted">{b.client_email} · {b.client_phone}</p>
        </div>
        <Badge variant={s.variant}>{s.label}</Badge>
      </div>
      <div className="agenda-card-info">
        <span className="text-sm"><strong>{b.service?.name}</strong></span>
        <span className="text-sm text-muted">{formatDate(b.date)}</span>
        <span className="text-mono text-sm">{formatTime(b.start_time)} – {formatTime(b.end_time)}</span>
        {b.service?.price && (
          <span className="text-mono text-sm" style={{ color: 'var(--color-gold)' }}>
            {formatBRL(b.service.price)}
          </span>
        )}
      </div>
      {b.notes && <p className="text-sm text-muted" style={{ marginTop: 8, fontStyle: 'italic' }}>"{b.notes}"</p>}
      {onConfirm && b.status === 'pending_payment' && (
        <Button size="sm" style={{ marginTop: 10 }} onClick={e => { e.stopPropagation(); onConfirm(b.id) }}>
          ✓ Confirmar
        </Button>
      )}
    </div>
  )
}