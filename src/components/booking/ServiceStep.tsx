import { formatBRL } from '../../utils/formatters'
import type { Service } from '../../types'

interface Props {
  services:  Service[]
  onSelect:  (service: Service) => void
}

export function ServiceStep({ services, onSelect }: Props) {
  return (
    <div>
      <h2 className="booking-step-title">Escolha o serviço</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {services.map(svc => (
          <button key={svc.id} className="booking-service-card" onClick={() => onSelect(svc)}>
            <div>
              <p style={{ fontWeight: 600, fontSize: 15 }}>{svc.name}</p>
              {svc.description && (
                <p className="text-sm text-muted" style={{ marginTop: 3 }}>{svc.description}</p>
              )}
              <p className="text-sm text-muted" style={{ marginTop: 6 }}>
                {svc.duration_min >= 60
                  ? `${svc.duration_min / 60}h${svc.duration_min % 60 ? `${svc.duration_min % 60}min` : ''}`
                  : `${svc.duration_min}min`}
                {svc.deposit ? ` · Sinal: ${formatBRL(svc.deposit)}` : ''}
              </p>
            </div>
            <p className="text-mono" style={{ color: 'var(--color-gold)', fontWeight: 700, fontSize: 18, flexShrink: 0 }}>
              {formatBRL(svc.price)}
            </p>
          </button>
        ))}
      </div>
    </div>
  )
}