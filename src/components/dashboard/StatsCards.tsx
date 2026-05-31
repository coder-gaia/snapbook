import { formatBRL } from '../../utils/formatters'
import type { Booking, Service } from '../../types'

interface Props {
  bookings: Booking[]
  services: Service[]
}

export function StatsCards({ bookings, services }: Props) {
  const thisMonth = new Date().toISOString().slice(0, 7)

  const monthBookings = bookings.filter(b => b.date.startsWith(thisMonth) && b.status !== 'cancelled')
  const pending       = bookings.filter(b => b.status === 'pending_payment')
  const monthRevenue  = monthBookings
    .filter(b => b.status === 'confirmed' || b.status === 'completed')
    .reduce((s, b) => s + (b.service?.price ?? 0), 0)
  const activeServices = services.filter(s => s.active).length

  return (
    <div className="grid-4" style={{ marginBottom: 20 }}>
      <div className="card">
        <p className="card-title">Agendamentos (mês)</p>
        <p className="card-value">{monthBookings.length}</p>
      </div>
      <div className="card">
        <p className="card-title">Receita estimada</p>
        <p className="card-value" style={{ fontSize: 22, color: 'var(--color-gold)' }}>
          {formatBRL(monthRevenue)}
        </p>
      </div>
      <div className="card">
        <p className="card-title">Pendentes</p>
        <p className="card-value" style={{ fontSize: 22, color: pending.length > 0 ? 'var(--color-warning)' : undefined }}>
          {pending.length}
        </p>
      </div>
      <div className="card">
        <p className="card-title">Serviços ativos</p>
        <p className="card-value" style={{ fontSize: 22 }}>{activeServices}</p>
      </div>
    </div>
  )
}