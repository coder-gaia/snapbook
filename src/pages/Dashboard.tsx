import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useBookings } from '../hooks/useBookings'
import { useServices } from '../hooks/useServices'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { PageSkeleton } from '../components/ui/Skeleton'
import { formatBRL, formatDate, formatTime, DAY_NAMES_SHORT } from '../utils/formatters'
import { CalendarDays, Camera, Clock, Link, AlertCircle } from 'lucide-react'
import type { Booking } from '../types'

function statusLabel(status: Booking['status']): { label: string; variant: 'warning' | 'success' | 'danger' | 'gray' } {
  switch (status) {
    case 'pending_payment': return { label: 'Aguardando pagamento', variant: 'warning' }
    case 'confirmed':       return { label: 'Confirmado', variant: 'success' }
    case 'cancelled':       return { label: 'Cancelado', variant: 'danger' }
    case 'completed':       return { label: 'Concluído', variant: 'gray' }
  }
}

export default function Dashboard() {
  const { profile } = useAuth()
  const navigate    = useNavigate()
  const { data: bookings, isLoading: loadingB, updateStatus } = useBookings()
  const { data: services, isLoading: loadingS } = useServices()

  if (loadingB || loadingS) return <PageSkeleton />

  const today     = new Date().toISOString().split('T')[0]
  const pending   = bookings?.filter(b => b.status === 'pending_payment') ?? []
  const upcoming  = bookings?.filter(b => b.date >= today && b.status === 'confirmed') ?? []
  const thisMonth = bookings?.filter(b => {
    const m = new Date().toISOString().slice(0, 7)
    return b.date.startsWith(m) && b.status !== 'cancelled'
  }) ?? []

  const monthRevenue = thisMonth
    .filter(b => b.status === 'confirmed' || b.status === 'completed')
    .reduce((s, b) => s + (b.service?.price ?? 0), 0)

  const bookingUrl = profile?.slug
    ? `${window.location.origin}/book/${profile.slug}`
    : null

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">
          Olá, {profile?.display_name?.split(' ')[0]} 👋
        </h1>
        <p className="page-subtitle">Aqui está o resumo da sua agenda.</p>
      </div>

      {/* Alerta de pendentes */}
      {pending.length > 0 && (
        <div className="dash-alert">
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>
            {pending.length} agendamento{pending.length > 1 ? 's' : ''} aguardando confirmação de pagamento.
          </span>
          <Button size="sm" variant="secondary" onClick={() => navigate('/app/agenda')}>
            Ver agenda
          </Button>
        </div>
      )}

      {/* Métricas */}
      <div className="grid-4" style={{ marginBottom: 20 }}>
        <div className="card">
          <p className="card-title">Agendamentos (mês)</p>
          <p className="card-value">{thisMonth.length}</p>
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
          <p className="card-value" style={{ fontSize: 22 }}>
            {services?.filter(s => s.active).length ?? 0}
          </p>
        </div>
      </div>

      {/* Link de agendamento */}
      {bookingUrl && (
        <div className="card card--gold" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <Link size={18} style={{ color: 'var(--color-gold)', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <p className="text-sm text-muted">Seu link de agendamento — compartilhe no Instagram e WhatsApp</p>
              <p className="text-mono text-sm" style={{ color: 'var(--color-gold)', marginTop: 2 }}>{bookingUrl}</p>
            </div>
            <Button size="sm" variant="secondary" onClick={() => navigator.clipboard.writeText(bookingUrl)}>
              Copiar link
            </Button>
          </div>
        </div>
      )}

      <div className="grid-2">
        {/* Próximos confirmados */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <p className="card-title" style={{ marginBottom: 0 }}>Próximos agendamentos</p>
            <Button size="sm" variant="ghost" onClick={() => navigate('/app/agenda')}>Ver todos</Button>
          </div>

          {!upcoming.length ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <CalendarDays size={32} style={{ color: 'var(--color-muted-2)', margin: '0 auto 8px' }} />
              <p className="text-sm text-muted">Nenhum agendamento confirmado</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {upcoming.slice(0, 4).map(b => (
                <div key={b.id} className="dash-booking-item">
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
              ))}
            </div>
          )}
        </div>

        {/* Pendentes de confirmação */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <p className="card-title" style={{ marginBottom: 0 }}>Aguardando confirmação</p>
            <Clock size={16} style={{ color: 'var(--color-warning)' }} />
          </div>

          {!pending.length ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <Camera size={32} style={{ color: 'var(--color-muted-2)', margin: '0 auto 8px' }} />
              <p className="text-sm text-muted">Nenhum agendamento pendente</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {pending.slice(0, 4).map(b => {
                const s = statusLabel(b.status)
                return (
                  <div key={b.id} className="dash-booking-item">
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 500, fontSize: 14 }}>{b.client_name}</p>
                      <p className="text-xs text-muted">{formatDate(b.date)} · {formatTime(b.start_time)}</p>
                      <p className="text-xs text-muted">{b.service?.name}</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
                      <Badge variant={s.variant}>{s.label}</Badge>
                      <Button size="sm" onClick={() => updateStatus.mutate({ id: b.id, status: 'confirmed' })}>
                        Confirmar
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}