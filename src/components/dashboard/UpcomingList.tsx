import { useNavigate } from 'react-router-dom'
import { CalendarDays, Camera } from 'lucide-react'
import { BookingCard } from './BookingCard'
import { Button } from '../ui/Button'
import type { Booking } from '../../types'

interface Props {
  bookings:   Booking[]
  onConfirm:  (id: string) => void
}

export function UpcomingList({ bookings, onConfirm }: Props) {
  const navigate  = useNavigate()
  const today     = new Date().toISOString().split('T')[0]
  const upcoming  = bookings.filter(b => b.date >= today && b.status === 'confirmed')
  const pending   = bookings.filter(b => b.status === 'pending_payment')

  return (
    <div className="grid-2">
      {/* Próximos confirmados */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <p className="card-title" style={{ marginBottom: 0 }}>Próximos confirmados</p>
          <Button size="sm" variant="ghost" onClick={() => navigate('/app/agenda')}>Ver todos</Button>
        </div>
        {!upcoming.length ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <CalendarDays size={32} style={{ color: 'var(--color-muted-2)', margin: '0 auto 8px' }} />
            <p className="text-sm text-muted">Nenhum agendamento confirmado</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {upcoming.slice(0, 4).map(b => <BookingCard key={b.id} booking={b} compact />)}
          </div>
        )}
      </div>

      {/* Aguardando confirmação */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <p className="card-title" style={{ marginBottom: 0 }}>Aguardando confirmação</p>
        </div>
        {!pending.length ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <Camera size={32} style={{ color: 'var(--color-muted-2)', margin: '0 auto 8px' }} />
            <p className="text-sm text-muted">Nenhum agendamento pendente</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {pending.slice(0, 4).map(b => (
              <BookingCard key={b.id} booking={b} compact onConfirm={onConfirm} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}