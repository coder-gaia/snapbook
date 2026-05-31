import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { formatPhone } from '../../utils/formatters'

interface Props {
  name:    string; setName:  (v: string) => void
  email:   string; setEmail: (v: string) => void
  phone:   string; setPhone: (v: string) => void
  notes:   string; setNotes: (v: string) => void
  error:   string
  onNext:  () => void
  onBack:  () => void
}

export function ClientStep({ name, setName, email, setEmail, phone, setPhone, notes, setNotes, error, onNext, onBack }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <h2 className="booking-step-title">Seus dados</h2>
      <Input label="Nome completo" placeholder="Maria Silva"
        value={name} onChange={e => setName(e.target.value)} required />
      <Input label="Email" type="email" placeholder="maria@email.com"
        value={email} onChange={e => setEmail(e.target.value)} required />
      <Input label="WhatsApp / Telefone" placeholder="(11) 99999-9999"
        value={phone} onChange={e => setPhone(formatPhone(e.target.value))} required />
      <div className="form-group">
        <label className="form-label">Observações (opcional)</label>
        <textarea className="form-input" rows={2} value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Alguma preferência ou informação importante..."
          style={{ resize: 'vertical' }} />
      </div>
      {error && <p className="form-error">{error}</p>}
      <div style={{ display: 'flex', gap: 10 }}>
        <Button variant="ghost" onClick={onBack}>← Voltar</Button>
        <Button full onClick={onNext}>Continuar →</Button>
      </div>
    </div>
  )
}