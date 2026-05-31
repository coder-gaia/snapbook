import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { format, addDays, startOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { supabase } from '../services/supabase'
import { usePublicPhotographer } from '../hooks/usePublicPhotographer'
import { usePublicBookings } from '../hooks/useBookings'
import { generateSlots, calcEndTime } from '../utils/timeSlots'
import { formatBRL, formatTime, DAY_NAMES_SHORT } from '../utils/formatters'
import { Button } from '../components/ui/Button'
import { Input }  from '../components/ui/Input'
import { Spinner } from '../components/ui/Spinner'
import type { Service } from '../types'

type Step = 'service' | 'date' | 'time' | 'client' | 'confirm'

export default function BookingPage() {
  const { slug }  = useParams<{ slug: string }>()
  const navigate  = useNavigate()
  const { data, isLoading, error } = usePublicPhotographer(slug)
  const { data: existingBookings } = usePublicBookings(data?.profile.id)

  const [step, setStep]           = useState<Step>('service')
  const [service, setService]     = useState<Service | null>(null)
  const [date, setDate]           = useState<Date | null>(null)
  const [time, setTime]           = useState<string | null>(null)
  const [clientName, setClientName]   = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [clientNotes, setClientNotes] = useState('')
  const [saving, setSaving]       = useState(false)
  const [formError, setFormError] = useState('')

  if (isLoading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Spinner size="lg" />
    </div>
  )

  if (error || !data) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 24 }}>
      <div>
        <p style={{ fontSize: 48, marginBottom: 16 }}>📷</p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, marginBottom: 8 }}>Fotógrafo não encontrado</h1>
        <p style={{ color: 'var(--color-muted)' }}>Verifique o link e tente novamente.</p>
      </div>
    </div>
  )

  const { profile, services, availability, blockedDates } = data
  const STEPS: Step[] = ['service', 'date', 'time', 'client', 'confirm']
  const stepIndex = STEPS.indexOf(step)

  // Gera os próximos 60 dias com disponibilidade
  const today = startOfDay(new Date())
  const availableDays: Date[] = []
  if (service) {
    for (let i = 1; i <= 60; i++) {
      const d = addDays(today, i)
      const slots = generateSlots(d, availability, blockedDates, existingBookings ?? [], service.duration_min)
      if (slots.length > 0) availableDays.push(d)
    }
  }

  const slots = (date && service)
    ? generateSlots(date, availability, blockedDates, existingBookings ?? [], service.duration_min)
    : []

  async function handleSubmit() {
    if (!service || !date || !time) return
    if (!clientName.trim() || !clientEmail.trim() || !clientPhone.trim()) {
      setFormError('Preencha todos os campos obrigatórios.')
      return
    }
    setSaving(true); setFormError('')
    try {
      const { error: bookingError } = await supabase.from('bookings').insert({
        photographer_id: profile.id,
        service_id:      service.id,
        client_name:     clientName.trim(),
        client_email:    clientEmail.trim(),
        client_phone:    clientPhone.trim(),
        notes:           clientNotes.trim() || null,
        date:            format(date, 'yyyy-MM-dd'),
        start_time:      time,
        end_time:        calcEndTime(time, service.duration_min),
        status:          'pending_payment',
      })
      if (bookingError) throw bookingError
      navigate(`/book/${slug}/confirmacao`, {
        state: { service, date: format(date, 'yyyy-MM-dd'), time, profile, clientName }
      })
    } catch { setFormError('Erro ao realizar agendamento. Tente novamente.') }
    finally { setSaving(false) }
  }

  return (
    <div className="booking-page">
      {/* Header do fotógrafo */}
      <div className="booking-header">
        <div className="booking-header-inner">
          <div className="booking-avatar">
            {profile.display_name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="booking-photographer-name">{profile.display_name}</h1>
            {profile.bio && <p className="booking-bio">{profile.bio}</p>}
            {profile.instagram && (
              <a href={`https://instagram.com/${profile.instagram.replace('@','')}`}
                target="_blank" rel="noopener noreferrer"
                className="booking-instagram">
                {profile.instagram}
              </a>
            )}
          </div>
        </div>

        {/* Progress */}
        <div className="booking-progress">
          {STEPS.map((s, i) => (
            <div key={s} className={`booking-step-dot ${i <= stepIndex ? 'booking-step-dot--active' : ''}`} />
          ))}
        </div>
      </div>

      {/* Conteúdo */}
      <div className="booking-content">
        <AnimatePresence mode="wait">
          <motion.div key={step}
            initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.2 }}>

            {/* Step 1: Serviço */}
            {step === 'service' && (
              <div>
                <h2 className="booking-step-title">Escolha o serviço</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {services.map(svc => (
                    <button key={svc.id} className="booking-service-card"
                      onClick={() => { setService(svc); setStep('date') }}>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: 15 }}>{svc.name}</p>
                        {svc.description && <p className="text-sm text-muted" style={{ marginTop: 3 }}>{svc.description}</p>}
                        <p className="text-sm text-muted" style={{ marginTop: 6 }}>
                          {svc.duration_min >= 60 ? `${svc.duration_min/60}h${svc.duration_min%60?`${svc.duration_min%60}min`:''}` : `${svc.duration_min}min`}
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
            )}

            {/* Step 2: Data */}
            {step === 'date' && (
              <div>
                <h2 className="booking-step-title">Escolha a data</h2>
                <p className="text-sm text-muted" style={{ marginBottom: 16 }}>
                  Mostrando dias disponíveis para: <strong>{service?.name}</strong>
                </p>
                {!availableDays.length ? (
                  <p className="text-sm text-muted">Nenhuma data disponível nos próximos 60 dias.</p>
                ) : (
                  <div className="booking-calendar">
                    {availableDays.map(d => (
                      <button key={d.toISOString()} className="booking-day-btn"
                        onClick={() => { setDate(d); setStep('time') }}>
                        <span className="text-xs text-muted">{DAY_NAMES_SHORT[d.getDay()]}</span>
                        <span style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{d.getDate()}</span>
                        <span className="text-xs text-muted">
                          {format(d, 'MMM', { locale: ptBR })}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
                <Button variant="ghost" style={{ marginTop: 16 }} onClick={() => setStep('service')}>← Voltar</Button>
              </div>
            )}

            {/* Step 3: Horário */}
            {step === 'time' && (
              <div>
                <h2 className="booking-step-title">Escolha o horário</h2>
                {date && <p className="text-sm text-muted" style={{ marginBottom: 16 }}>
                  {format(date, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                </p>}
                <div className="booking-slots">
                  {slots.map(slot => (
                    <button key={slot} className="booking-slot-btn"
                      onClick={() => { setTime(slot); setStep('client') }}>
                      {formatTime(slot)}
                    </button>
                  ))}
                </div>
                <Button variant="ghost" style={{ marginTop: 16 }} onClick={() => setStep('date')}>← Voltar</Button>
              </div>
            )}

            {/* Step 4: Dados do cliente */}
            {step === 'client' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <h2 className="booking-step-title">Seus dados</h2>
                <Input label="Nome completo" placeholder="Maria Silva"
                  value={clientName} onChange={e => setClientName(e.target.value)} required />
                <Input label="Email" type="email" placeholder="maria@email.com"
                  value={clientEmail} onChange={e => setClientEmail(e.target.value)} required />
                <Input label="WhatsApp / Telefone" placeholder="(11) 99999-9999"
                  value={clientPhone} onChange={e => setClientPhone(e.target.value)} required />
                <div className="form-group">
                  <label className="form-label">Observações (opcional)</label>
                  <textarea className="form-input" rows={2} value={clientNotes}
                    onChange={e => setClientNotes(e.target.value)}
                    placeholder="Alguma preferência ou informação importante..."
                    style={{ resize: 'vertical' }} />
                </div>
                {formError && <p className="form-error">{formError}</p>}
                <div style={{ display: 'flex', gap: 10 }}>
                  <Button variant="ghost" onClick={() => setStep('time')}>← Voltar</Button>
                  <Button full onClick={() => {
                    if (!clientName.trim() || !clientEmail.trim() || !clientPhone.trim()) {
                      setFormError('Preencha todos os campos obrigatórios.')
                      return
                    }
                    setFormError('')
                    setStep('confirm')
                  }}>Continuar →</Button>
                </div>
              </div>
            )}

            {/* Step 5: Confirmação */}
            {step === 'confirm' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <h2 className="booking-step-title">Confirmar agendamento</h2>
                <div className="booking-summary">
                  <SummaryRow label="Serviço"   value={service?.name ?? ''} />
                  <SummaryRow label="Data"      value={date ? format(date, "dd 'de' MMMM", { locale: ptBR }) : ''} />
                  <SummaryRow label="Horário"   value={time ? `${formatTime(time)} – ${calcEndTime(time, service?.duration_min ?? 60)}` : ''} mono />
                  <SummaryRow label="Valor"     value={service ? formatBRL(service.price) : ''} mono gold />
                  {service?.deposit && <SummaryRow label="Sinal" value={formatBRL(service.deposit)} mono />}
                  <SummaryRow label="Nome"      value={clientName} />
                  <SummaryRow label="Email"     value={clientEmail} />
                  <SummaryRow label="Telefone"  value={clientPhone} />
                </div>

                {service?.deposit && (
                  <div className="booking-pix-info">
                    <p style={{ fontWeight: 600, marginBottom: 4 }}>Pagamento do sinal</p>
                    <p className="text-sm text-muted">
                      Após confirmar, você receberá as instruções para pagar o sinal de{' '}
                      <strong style={{ color: 'var(--color-gold)' }}>{formatBRL(service.deposit)}</strong>.
                      O agendamento será confirmado após o recebimento.
                    </p>
                  </div>
                )}

                {formError && <p className="form-error" style={{ textAlign: 'center' }}>{formError}</p>}
                <div style={{ display: 'flex', gap: 10 }}>
                  <Button variant="ghost" onClick={() => setStep('client')} disabled={saving}>← Voltar</Button>
                  <Button full loading={saving} onClick={handleSubmit}>Confirmar agendamento</Button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

function SummaryRow({ label, value, mono, gold }: { label: string; value: string; mono?: boolean; gold?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--color-border)' }}>
      <span className="text-sm text-muted">{label}</span>
      <span className={['text-sm', mono ? 'text-mono' : '', gold ? 'text-gold' : ''].join(' ')} style={{ fontWeight: 600 }}>{value}</span>
    </div>
  )
}