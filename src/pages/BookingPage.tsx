import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { supabase } from '../services/supabase'
import { usePublicPhotographer } from '../hooks/usePublicPhotographer'
import { usePublicBookings } from '../hooks/useBookings'
import { generateSlots, calcEndTime } from '../utils/timeSlots'
import { Spinner } from '../components/ui/Spinner'
import { Button } from '../components/ui/Button'
import { ServiceStep }     from '../components/booking/ServiceStep'
import { DateStep }        from '../components/booking/DateStep'
import { TimeStep }        from '../components/booking/TimeStep'
import { ClientStep }      from '../components/booking/ClientStep'
import { BookingProgress } from '../components/booking/BookingProgress'
import { formatBRL, formatTime } from '../utils/formatters'
import type { Service } from '../types'

type Step = 'service' | 'date' | 'time' | 'client' | 'confirm'

export default function BookingPage() {
  const { slug }   = useParams<{ slug: string }>()
  const navigate   = useNavigate()
  const { data, isLoading, error } = usePublicPhotographer(slug)
  const { data: existingBookings } = usePublicBookings(data?.profile.id)

  const [step,    setStep]    = useState<Step>('service')
  const [service, setService] = useState<Service | null>(null)
  const [date,    setDate]    = useState<Date | null>(null)
  const [time,    setTime]    = useState<string | null>(null)
  const [name,    setName]    = useState('')
  const [email,   setEmail]   = useState('')
  const [phone,   setPhone]   = useState('')
  const [notes,   setNotes]   = useState('')
  const [saving,  setSaving]  = useState(false)
  const [formErr, setFormErr] = useState('')

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
  const slots = (date && service)
    ? generateSlots(date, availability, blockedDates, existingBookings ?? [], service.duration_min)
    : []

  async function handleSubmit() {
    if (!service || !date || !time) return
    if (!name.trim() || !email.trim() || !phone.trim()) {
      setFormErr('Preencha todos os campos obrigatórios.')
      return
    }
    setSaving(true); setFormErr('')
    try {
      const { error: err } = await supabase.from('bookings').insert({
        photographer_id: profile.id,
        service_id:      service.id,
        client_name:     name.trim(),
        client_email:    email.trim(),
        client_phone:    phone.trim(),
        notes:           notes.trim() || null,
        date:            format(date, 'yyyy-MM-dd'),
        start_time:      time,
        end_time:        calcEndTime(time, service.duration_min),
        status:          'pending_payment',
      })
      if (err) throw err
      navigate(`/book/${slug}/confirmacao`, {
        state: { service, date: format(date, 'yyyy-MM-dd'), time, profile, clientName: name }
      })
    } catch { setFormErr('Erro ao realizar agendamento. Tente novamente.') }
    finally { setSaving(false) }
  }

  return (
    <div className="booking-page">
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
                target="_blank" rel="noopener noreferrer" className="booking-instagram">
                {profile.instagram}
              </a>
            )}
          </div>
        </div>
        <BookingProgress current={step} />
      </div>

      <div className="booking-content">
        <AnimatePresence mode="wait">
          <motion.div key={step}
            initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.2 }}>

            {step === 'service' && (
              <ServiceStep
                services={services}
                onSelect={s => { setService(s); setStep('date') }}
              />
            )}

            {step === 'date' && service && (
              <DateStep
                service={service}
                availability={availability}
                blockedDates={blockedDates}
                existingBookings={existingBookings ?? []}
                selected={date}
                onSelect={d => { setDate(d); setStep('time') }}
                onBack={() => setStep('service')}
              />
            )}

            {step === 'time' && date && (
              <TimeStep
                slots={slots}
                date={date}
                onSelect={t => { setTime(t); setStep('client') }}
                onBack={() => setStep('date')}
              />
            )}

            {step === 'client' && (
              <ClientStep
                name={name}     setName={setName}
                email={email}   setEmail={setEmail}
                phone={phone}   setPhone={setPhone}
                notes={notes}   setNotes={setNotes}
                error={formErr}
                onNext={() => {
                  if (!name.trim() || !email.trim() || !phone.trim()) {
                    setFormErr('Preencha todos os campos obrigatórios.')
                    return
                  }
                  setFormErr(''); setStep('confirm')
                }}
                onBack={() => setStep('time')}
              />
            )}

            {step === 'confirm' && service && date && time && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <h2 className="booking-step-title">Confirmar agendamento</h2>
                <div className="booking-summary">
                  <SRow label="Serviço"  value={service.name} />
                  <SRow label="Data"     value={format(date, "dd/MM/yyyy")} />
                  <SRow label="Horário"  value={`${formatTime(time)} – ${calcEndTime(time, service.duration_min)}`} mono />
                  <SRow label="Valor"    value={formatBRL(service.price)} mono gold />
                  {service.deposit && <SRow label="Sinal" value={formatBRL(service.deposit)} mono />}
                  <SRow label="Nome"     value={name} />
                  <SRow label="Email"    value={email} />
                  <SRow label="Telefone" value={phone} />
                </div>

                {service.deposit && (
                  <div className="booking-pix-info">
                    <p style={{ fontWeight: 600, marginBottom: 4 }}>Sobre o pagamento</p>
                    <p className="text-sm text-muted">
                      Após confirmar, você receberá as instruções para pagar o sinal de{' '}
                      <strong style={{ color: 'var(--color-gold)' }}>{formatBRL(service.deposit)}</strong>.
                      O agendamento é confirmado após o recebimento.
                    </p>
                  </div>
                )}

                {formErr && <p className="form-error" style={{ textAlign: 'center' }}>{formErr}</p>}

                <div style={{ display: 'flex', gap: 10 }}>
                  <Button variant="ghost" onClick={() => setStep('client')} disabled={saving}>
                    ← Voltar
                  </Button>
                  <Button full loading={saving} onClick={handleSubmit}>
                    Confirmar agendamento
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

function SRow({ label, value, mono, gold }: { label: string; value: string; mono?: boolean; gold?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--color-border)' }}>
      <span className="text-sm text-muted">{label}</span>
      <span className={['text-sm', mono ? 'text-mono' : '', gold ? 'text-gold' : ''].join(' ')} style={{ fontWeight: 600 }}>
        {value}
      </span>
    </div>
  )
}