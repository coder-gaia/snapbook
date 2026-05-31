import { useState } from 'react'
import { useBookings } from '../hooks/useBookings'
import { Modal } from '../components/ui/Modal'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { PageSkeleton } from '../components/ui/Skeleton'
import { formatBRL, formatDate, formatTime } from '../utils/formatters'
import { CalendarDays } from 'lucide-react'
import type { Booking } from '../types'

type Status = Booking['status'] | 'all'

function statusLabel(status: Booking['status']): { label: string; variant: 'warning' | 'success' | 'danger' | 'gray' } {
  switch (status) {
    case 'pending_payment': return { label: 'Aguardando pagamento', variant: 'warning' }
    case 'confirmed':       return { label: 'Confirmado', variant: 'success' }
    case 'cancelled':       return { label: 'Cancelado', variant: 'danger' }
    case 'completed':       return { label: 'Concluído', variant: 'gray' }
  }
}

export default function Agenda() {
  const { data: bookings, isLoading, updateStatus } = useBookings()
  const [filter, setFilter]   = useState<Status>('all')
  const [selected, setSelected] = useState<Booking | null>(null)
  const [notes, setNotes]     = useState('')
  const [saving, setSaving]   = useState(false)

  const filtered = bookings?.filter(b => filter === 'all' ? true : b.status === filter) ?? []

  async function handleAction(id: string, status: Booking['status']) {
    setSaving(true)
    await updateStatus.mutateAsync({ id, status, notes: notes || undefined })
    setSaving(false)
    setSelected(null)
    setNotes('')
  }

  if (isLoading) return <PageSkeleton />

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Agenda</h1>
        <p className="page-subtitle">{bookings?.length ?? 0} agendamento{bookings?.length !== 1 ? 's' : ''} no total</p>
      </div>

      {/* Filtros */}
      <div className="mode-toggle" style={{ marginBottom: 20 }}>
        {([
          ['all', 'Todos'],
          ['pending_payment', 'Pendentes'],
          ['confirmed', 'Confirmados'],
          ['completed', 'Concluídos'],
          ['cancelled', 'Cancelados'],
        ] as [Status, string][]).map(([val, label]) => (
          <button key={val} className={`mode-btn ${filter === val ? 'mode-btn--active' : ''}`}
            onClick={() => setFilter(val)}>
            {label}
          </button>
        ))}
      </div>

      {!filtered.length ? (
        <div className="empty-state">
          <span className="empty-state-icon"><CalendarDays size={40} /></span>
          <p className="empty-state-title">Nenhum agendamento{filter !== 'all' ? ' nesse filtro' : ''}</p>
          <p className="empty-state-desc">Os agendamentos feitos pelos clientes aparecerão aqui.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(b => {
            const s = statusLabel(b.status)
            return (
              <div key={b.id} className="card agenda-card"
                onClick={() => { setSelected(b); setNotes('') }}
                style={{ cursor: 'pointer' }}>
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
                  {b.service?.price && <span className="text-mono text-sm" style={{ color: 'var(--color-gold)' }}>{formatBRL(b.service.price)}</span>}
                </div>
                {b.notes && <p className="text-sm text-muted" style={{ marginTop: 8, fontStyle: 'italic' }}>"{b.notes}"</p>}
              </div>
            )
          })}
        </div>
      )}

      {/* Modal de ações */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title="Agendamento">
        {selected && (() => {
          const s = statusLabel(selected.status)
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 16 }}>{selected.client_name}</p>
                  <p className="text-sm text-muted">{selected.client_email}</p>
                  <p className="text-sm text-muted">{selected.client_phone}</p>
                </div>
                <Badge variant={s.variant}>{s.label}</Badge>
              </div>

              <div style={{ background: 'var(--color-surface-2)', borderRadius: 'var(--radius-md)', padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Row label="Serviço"   value={selected.service?.name ?? '—'} />
                <Row label="Data"      value={formatDate(selected.date)} />
                <Row label="Horário"   value={`${formatTime(selected.start_time)} – ${formatTime(selected.end_time)}`} mono />
                {selected.service?.price && <Row label="Valor" value={formatBRL(selected.service.price)} mono gold />}
                {selected.service?.deposit && <Row label="Sinal" value={formatBRL(selected.service.deposit)} mono />}
              </div>

              {selected.notes && (
                <div style={{ background: 'var(--color-surface-2)', borderRadius: 'var(--radius-md)', padding: 12 }}>
                  <p className="text-xs text-muted" style={{ marginBottom: 4 }}>Observação do cliente</p>
                  <p className="text-sm">{selected.notes}</p>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Nota interna (opcional)</label>
                <textarea className="form-input" rows={2} value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Localização, instruções, equipamentos..."
                  style={{ resize: 'vertical' }} />
              </div>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {selected.status === 'pending_payment' && (
                  <Button onClick={() => handleAction(selected.id, 'confirmed')} loading={saving}>
                    ✓ Confirmar
                  </Button>
                )}
                {selected.status === 'confirmed' && (
                  <Button onClick={() => handleAction(selected.id, 'completed')} loading={saving}>
                    ✓ Concluir
                  </Button>
                )}
                {(selected.status === 'pending_payment' || selected.status === 'confirmed') && (
                  <Button variant="danger" onClick={() => handleAction(selected.id, 'cancelled')} loading={saving}>
                    Cancelar
                  </Button>
                )}
                {selected.status === 'cancelled' && (
                  <Button variant="secondary" onClick={() => handleAction(selected.id, 'pending_payment')} loading={saving}>
                    Reabrir
                  </Button>
                )}
                <Button variant="ghost" onClick={() => setSelected(null)}>Fechar</Button>
              </div>
            </div>
          )
        })()}
      </Modal>
    </div>
  )
}

function Row({ label, value, mono, gold }: { label: string; value: string; mono?: boolean; gold?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span className="text-sm text-muted">{label}</span>
      <span className={['text-sm', mono ? 'text-mono' : '', gold ? 'text-gold' : ''].join(' ')} style={{ fontWeight: 500 }}>{value}</span>
    </div>
  )
}