import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../services/supabase'
import { useAuth } from '../hooks/useAuth'
import { slugify, DAY_NAMES } from '../utils/formatters'
import { Button } from '../components/ui/Button'
import { Input }  from '../components/ui/Input'

const DEFAULT_AVAIL = DAY_NAMES.map((_, i) => ({
  day: i, start: '09:00', end: '18:00', active: i >= 1 && i <= 5,
}))

export default function Onboarding() {
  const { refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [step, setStep]     = useState(1)
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  const [displayName, setDisplayName] = useState('')
  const [slug, setSlug]               = useState('')
  const [bio, setBio]                 = useState('')
  const [instagram, setInstagram]     = useState('')
  const [pixKey, setPixKey]           = useState('')
  const [pixInfo, setPixInfo]         = useState('')
  const [svcName, setSvcName]         = useState('')
  const [svcDuration, setSvcDuration] = useState('60')
  const [svcPrice, setSvcPrice]       = useState('')
  const [svcDeposit, setSvcDeposit]   = useState('')
  const [avail, setAvail]             = useState(DEFAULT_AVAIL)

  function handleNameChange(v: string) {
    setDisplayName(v)
    setSlug(slugify(v))
  }

  function toggleDay(day: number) {
    setAvail(p => p.map(a => a.day === day ? { ...a, active: !a.active } : a))
  }
  function setDayTime(day: number, field: 'start' | 'end', value: string) {
    setAvail(p => p.map(a => a.day === day ? { ...a, [field]: value } : a))
  }

  async function finish() {
    setSaving(true); setError('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) { navigate('/login'); return }
      const uid = session.user.id

      // 1. Perfil
      const { error: pe } = await supabase.from('photographer_profiles').upsert({
        id: uid, slug: slug.trim(), display_name: displayName.trim(),
        bio: bio.trim() || null, instagram: instagram.trim() || null,
        pix_key: pixKey.trim() || null, pix_info: pixInfo.trim() || null,
      }, { onConflict: 'id' })
      if (pe) throw pe

      // 2. Primeiro serviço
      if (svcName.trim()) {
        const { error: se } = await supabase.from('services').insert({
          photographer_id: uid, name: svcName.trim(),
          duration_min: parseInt(svcDuration),
          price: parseFloat(svcPrice),
          deposit: svcDeposit ? parseFloat(svcDeposit) : null,
          active: true,
        })
        if (se) throw se
      }

      // 3. Disponibilidade
      const active = avail.filter(a => a.active)
      if (active.length > 0) {
        const { error: ae } = await supabase.from('availability').insert(
          active.map(a => ({
            photographer_id: uid, day_of_week: a.day,
            start_time: a.start, end_time: a.end,
          }))
        )
        if (ae) throw ae
      }

      await refreshProfile()
      navigate('/app')
    } catch (err: unknown) {
      console.error(err)
      setError('Erro ao salvar. Verifique os dados e tente novamente.')
    } finally { setSaving(false) }
  }

  const TOTAL = 5

  return (
    <div className="onboarding-page">
      <div className="onboarding-progress">
        {Array.from({ length: TOTAL }, (_, i) => (
          <div key={i} className={`onboarding-dot ${i + 1 <= step ? 'onboarding-dot--active' : ''}`} />
        ))}
      </div>

      <div className="onboarding-card">
        <AnimatePresence mode="wait">
          <motion.div key={step}
            initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}
          >
            {step === 1 && (
              <div className="onboarding-step">
                <p className="onboarding-step-number">Passo 1 de {TOTAL}</p>
                <h2 className="onboarding-step-title">Como você quer aparecer?</h2>
                <p className="onboarding-step-desc">Seu nome e URL pública de agendamento.</p>
                <Input label="Nome de exibição" placeholder="João Silva Fotografia" value={displayName}
                  onChange={e => handleNameChange(e.target.value)} required />
                <Input label="Seu link personalizado" placeholder="joao-silva"
                  value={slug} onChange={e => setSlug(slugify(e.target.value))}
                  prefix="snapbook.app/" mono
                  hint={slug ? `Seu link: snapbook.app/${slug}` : 'Gerado automaticamente do seu nome'} />
                {error && <p className="form-error">{error}</p>}
                <Button full onClick={() => {
                  if (!displayName.trim() || !slug.trim()) { setError('Preencha nome e link.'); return }
                  setError(''); setStep(2)
                }}>Continuar →</Button>
              </div>
            )}

            {step === 2 && (
              <div className="onboarding-step">
                <p className="onboarding-step-number">Passo 2 de {TOTAL}</p>
                <h2 className="onboarding-step-title">Conte sobre você</h2>
                <p className="onboarding-step-desc">Essas informações aparecem na sua página de agendamento.</p>
                <div className="form-group">
                  <label className="form-label">Bio</label>
                  <textarea className="form-input" rows={3} placeholder="Fotógrafo especializado em ensaios externos e eventos..."
                    value={bio} onChange={e => setBio(e.target.value)}
                    style={{ resize: 'vertical', minHeight: 80 }} />
                </div>
                <Input label="Instagram (opcional)" placeholder="@joaosilva.foto"
                  value={instagram} onChange={e => setInstagram(e.target.value)} />
                <div className="onboarding-actions">
                  <Button variant="ghost" onClick={() => setStep(1)}>← Voltar</Button>
                  <Button onClick={() => setStep(3)}>Continuar →</Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="onboarding-step">
                <p className="onboarding-step-number">Passo 3 de {TOTAL}</p>
                <h2 className="onboarding-step-title">Como receber o sinal?</h2>
                <p className="onboarding-step-desc">Essas informações aparecem ao cliente após agendar.</p>
                <Input label="Chave PIX" placeholder="seu@email.com ou CPF" value={pixKey}
                  onChange={e => setPixKey(e.target.value)} />
                <Input label="Instrução de pagamento" placeholder="Banco Inter, em nome de João Silva"
                  value={pixInfo} onChange={e => setPixInfo(e.target.value)}
                  hint="Opcional — aparece como dica para o cliente" />
                <div className="onboarding-actions">
                  <Button variant="ghost" onClick={() => setStep(2)}>← Voltar</Button>
                  <Button onClick={() => setStep(4)}>Continuar →</Button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="onboarding-step">
                <p className="onboarding-step-number">Passo 4 de {TOTAL}</p>
                <h2 className="onboarding-step-title">Seu primeiro serviço</h2>
                <p className="onboarding-step-desc">Pode adicionar mais depois. Deixe em branco para pular.</p>
                <Input label="Nome do serviço" placeholder="Ensaio Externo"
                  value={svcName} onChange={e => setSvcName(e.target.value)} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Duração (min)</label>
                    <select className="form-input" value={svcDuration} onChange={e => setSvcDuration(e.target.value)}>
                      {[30,60,90,120,180,240].map(d => <option key={d} value={d}>{d} min</option>)}
                    </select>
                  </div>
                  <Input label="Preço (R$)" type="number" placeholder="350" mono
                    value={svcPrice} onChange={e => setSvcPrice(e.target.value)} />
                </div>
                <Input label="Valor do sinal (R$)" type="number" placeholder="100" mono
                  value={svcDeposit} onChange={e => setSvcDeposit(e.target.value)}
                  hint="Opcional — valor que o cliente precisa pagar para confirmar" />
                <div className="onboarding-actions">
                  <Button variant="ghost" onClick={() => setStep(3)}>← Voltar</Button>
                  <Button onClick={() => setStep(5)}>Continuar →</Button>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="onboarding-step">
                <p className="onboarding-step-number">Passo 5 de {TOTAL}</p>
                <h2 className="onboarding-step-title">Quando você trabalha?</h2>
                <p className="onboarding-step-desc">Configure os dias e horários de atendimento.</p>
                <div className="avail-grid">
                  {avail.map(a => (
                    <div key={a.day} className={`avail-row ${a.active ? 'avail-row--active' : ''}`}>
                      <button type="button" className="avail-day-toggle"
                        onClick={() => toggleDay(a.day)}>
                        <span className={`avail-check ${a.active ? 'avail-check--on' : ''}`}>
                          {a.active ? '✓' : ''}
                        </span>
                        <span className="avail-day-name">{DAY_NAMES[a.day]}</span>
                      </button>
                      {a.active && (
                        <div className="avail-times">
                          <input type="time" className="form-input form-input--mono"
                            style={{ width: 110 }} value={a.start}
                            onChange={e => setDayTime(a.day, 'start', e.target.value)} />
                          <span className="text-muted text-sm">até</span>
                          <input type="time" className="form-input form-input--mono"
                            style={{ width: 110 }} value={a.end}
                            onChange={e => setDayTime(a.day, 'end', e.target.value)} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {error && <p className="form-error" style={{ textAlign: 'center' }}>{error}</p>}
                <div className="onboarding-actions">
                  <Button variant="ghost" onClick={() => setStep(4)} disabled={saving}>← Voltar</Button>
                  <Button loading={saving} onClick={finish}>Entrar no Snapbook →</Button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}