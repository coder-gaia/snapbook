import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { formatBRL, formatTime } from '../utils/formatters'
import { calcEndTime } from '../utils/timeSlots'
import { Button } from '../components/ui/Button'
import type { Service, PhotographerProfile } from '../types'

interface LocationState {
  service:    Service
  date:       string
  time:       string
  profile:    PhotographerProfile
  clientName: string
}

export default function BookingConfirm() {
  const location = useLocation()
  const navigate = useNavigate()
  const state    = location.state as LocationState | null

  if (!state) { navigate('/'); return null }

  const { service, date, time, profile, clientName } = state

  return (
    <div className="booking-page">
      <div className="booking-content" style={{ maxWidth: 500, margin: '0 auto', paddingTop: 60 }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }} style={{ textAlign: 'center' }}
        >
          <div className="confirm-icon">📸</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
            Agendamento realizado!
          </h1>
          <p style={{ color: 'var(--color-muted)', marginBottom: 32 }}>
            Olá, {clientName.split(' ')[0]}! Seu pedido foi recebido com sucesso.
          </p>

          <div className="booking-summary" style={{ textAlign: 'left', marginBottom: 24 }}>
            <SRow label="Fotógrafo"    value={profile.display_name} />
            <SRow label="Serviço"      value={service.name} />
            <SRow label="Data"         value={format(parseISO(date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })} />
            <SRow label="Horário"      value={`${formatTime(time)} – ${calcEndTime(time, service.duration_min)}`} mono />
            <SRow label="Valor total"  value={formatBRL(service.price)} mono gold />
            {service.deposit && <SRow label="Sinal" value={formatBRL(service.deposit)} mono />}
          </div>

          {service.deposit && profile.pix_key && (
            <div className="booking-pix-info" style={{ textAlign: 'left', marginBottom: 24 }}>
              <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>
                Próximo passo: pague o sinal de {formatBRL(service.deposit)}
              </p>
              <div style={{ background: 'var(--color-surface-2)', borderRadius: 'var(--radius-md)', padding: '12px 14px', marginTop: 8 }}>
                <p className="text-xs text-muted" style={{ marginBottom: 4 }}>Chave PIX</p>
                <p className="text-mono" style={{ color: 'var(--color-gold)', fontWeight: 600 }}>{profile.pix_key}</p>
                {profile.pix_info && <p className="text-sm text-muted" style={{ marginTop: 4 }}>{profile.pix_info}</p>}
              </div>
              <p className="text-sm text-muted" style={{ marginTop: 12 }}>
                Após o pagamento, aguarde a confirmação por WhatsApp ou email.
              </p>
            </div>
          )}

          {!service.deposit && (
            <div className="booking-pix-info" style={{ marginBottom: 24 }}>
              <p className="text-sm">Aguarde a confirmação do fotógrafo por WhatsApp ou email. ✓</p>
            </div>
          )}

          <Button full onClick={() => navigate('/')}>Voltar ao início</Button>
        </motion.div>
      </div>
    </div>
  )
}

function SRow({ label, value, mono, gold }: { label: string; value: string; mono?: boolean; gold?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--color-border)' }}>
      <span className="text-sm text-muted">{label}</span>
      <span className={['text-sm', mono ? 'text-mono' : '', gold ? 'text-gold' : ''].join(' ')} style={{ fontWeight: 600 }}>{value}</span>
    </div>
  )
}