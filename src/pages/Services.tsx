import { useState } from 'react'
import { useServices } from '../hooks/useServices'
import { ServiceForm } from '../components/services/ServiceForm'
import { Modal }  from '../components/ui/Modal'
import { Button } from '../components/ui/Button'
import { Badge }  from '../components/ui/Badge'
import { Skeleton } from '../components/ui/Skeleton'
import { formatBRL } from '../utils/formatters'
import { Plus, Camera, Trash2, Link } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export default function Services() {
  const { profile } = useAuth()
  const { data: services, isLoading, create, toggle, remove } = useServices()
  const [open, setOpen] = useState(false)

  const bookingUrl = profile?.slug ? `${window.location.origin}/book/${profile.slug}` : null

  if (isLoading) return (
    <div>
      <div className="page-header"><Skeleton width="160px" height={30} style={{ marginBottom: 8 }} /><Skeleton width="200px" height={16} /></div>
      <div className="grid-2">{[1,2].map(i => <div key={i} className="card"><Skeleton height={80} /></div>)}</div>
    </div>
  )

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title">Serviços</h1>
          <p className="page-subtitle">{services?.length ?? 0} serviço{services?.length !== 1 ? 's' : ''} cadastrado{services?.length !== 1 ? 's' : ''}</p>
        </div>
        <Button icon={<Plus size={16} />} onClick={() => setOpen(true)}>Novo serviço</Button>
      </div>

      {bookingUrl && (
        <div className="booking-link-card">
          <Link size={16} style={{ color: 'var(--color-gold)', flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p className="text-sm text-muted">Seu link de agendamento</p>
            <p className="text-mono text-sm" style={{ color: 'var(--color-gold)', wordBreak: 'break-all' }}>{bookingUrl}</p>
          </div>
          <Button size="sm" variant="secondary" onClick={() => navigator.clipboard.writeText(bookingUrl)}>
            Copiar
          </Button>
        </div>
      )}

      {!services?.length ? (
        <div className="empty-state">
          <span className="empty-state-icon"><Camera size={40} /></span>
          <p className="empty-state-title">Nenhum serviço ainda</p>
          <p className="empty-state-desc">Adicione seus serviços para que os clientes possam agendar.</p>
          <Button onClick={() => setOpen(true)} style={{ marginTop: 8 }}>Adicionar serviço</Button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {services.map(svc => (
            <div key={svc.id} className="card service-card">
              <div className="service-card-header">
                <div>
                  <p style={{ fontWeight: 600, fontSize: 16 }}>{svc.name}</p>
                  {svc.description && <p className="text-sm text-muted" style={{ marginTop: 3 }}>{svc.description}</p>}
                </div>
                <Badge variant={svc.active ? 'success' : 'gray'}>{svc.active ? 'Ativo' : 'Inativo'}</Badge>
              </div>

              <div className="service-card-info">
                <div className="service-info-item">
                  <span className="text-xs text-muted">Duração</span>
                  <span className="text-mono text-sm">{svc.duration_min >= 60 ? `${svc.duration_min/60}h${svc.duration_min%60 ? `${svc.duration_min%60}min` : ''}` : `${svc.duration_min}min`}</span>
                </div>
                <div className="service-info-item">
                  <span className="text-xs text-muted">Preço</span>
                  <span className="text-mono text-sm" style={{ color: 'var(--color-gold)' }}>{formatBRL(svc.price)}</span>
                </div>
                {svc.deposit && (
                  <div className="service-info-item">
                    <span className="text-xs text-muted">Sinal</span>
                    <span className="text-mono text-sm">{formatBRL(svc.deposit)}</span>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <Button size="sm" variant="secondary"
                  onClick={() => toggle.mutate({ id: svc.id, active: !svc.active })}>
                  {svc.active ? 'Desativar' : 'Ativar'}
                </Button>
                <Button size="sm" variant="ghost" icon={<Trash2 size={14} />}
                  onClick={() => remove.mutate(svc.id)}>
                  Remover
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Novo serviço">
        <ServiceForm
          onSubmit={async data => { await create.mutateAsync(data); setOpen(false) }}
          onCancel={() => setOpen(false)}
        />
      </Modal>
    </div>
  )
}