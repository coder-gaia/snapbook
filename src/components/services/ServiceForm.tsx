import { useState, type FormEvent } from 'react'
import { Button } from '../ui/Button'
import { Input }  from '../ui/Input'
import type { ServiceFormData } from '../../types'

interface Props {
  onSubmit: (data: ServiceFormData) => Promise<void>
  onCancel: () => void
}

export function ServiceForm({ onSubmit, onCancel }: Props) {
  const [form, setForm] = useState<ServiceFormData>({
    name: '', description: '', duration_min: '60', price: '', deposit: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  function set(field: keyof ServiceFormData, value: string) {
    setForm(p => ({ ...p, [field]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!form.name.trim())  { setError('Nome é obrigatório.'); return }
    if (!form.price)        { setError('Preço é obrigatório.'); return }
    setLoading(true)
    try { await onSubmit(form) }
    catch { setError('Erro ao salvar serviço.') }
    finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Input label="Nome do serviço" placeholder="Ensaio Externo"
        value={form.name} onChange={e => set('name', e.target.value)} required />

      <div className="form-group">
        <label className="form-label">Descrição</label>
        <textarea className="form-input" rows={2} placeholder="Breve descrição do serviço..."
          value={form.description} onChange={e => set('description', e.target.value)}
          style={{ resize: 'vertical' }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="form-group">
          <label className="form-label">Duração</label>
          <select className="form-input" value={form.duration_min}
            onChange={e => set('duration_min', e.target.value)}>
            {[30,60,90,120,150,180,240].map(d => (
              <option key={d} value={d}>{d >= 60 ? `${d/60}h${d%60 ? `${d%60}min` : ''}` : `${d}min`}</option>
            ))}
          </select>
        </div>
        <Input label="Preço (R$)" type="number" step="0.01" placeholder="350"
          value={form.price} onChange={e => set('price', e.target.value)} mono required />
      </div>

      <Input label="Valor do sinal (R$)" type="number" step="0.01" placeholder="100"
        value={form.deposit} onChange={e => set('deposit', e.target.value)} mono
        hint="Valor que o cliente paga para confirmar o agendamento" />

      {error && <p className="form-error">{error}</p>}

      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" loading={loading}>Salvar serviço</Button>
      </div>
    </form>
  )
}