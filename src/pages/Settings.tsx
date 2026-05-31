import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../services/supabase'
import { Button } from '../components/ui/Button'
import { Input }  from '../components/ui/Input'
import { slugify } from '../utils/formatters'

export default function Settings() {
  const { profile, user, signOut, refreshProfile } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    display_name: profile?.display_name ?? '',
    slug:         profile?.slug         ?? '',
    bio:          profile?.bio          ?? '',
    instagram:    profile?.instagram    ?? '',
    pix_key:      profile?.pix_key      ?? '',
    pix_info:     profile?.pix_info     ?? '',
  })
  const [saving,  setSaving]  = useState(false)
  const [success, setSuccess] = useState(false)
  const [error,   setError]   = useState('')

  function set(field: string, value: string) {
    setForm(p => ({ ...p, [field]: value }))
    setSuccess(false)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!form.display_name.trim()) { setError('Nome é obrigatório.'); return }
    if (!form.slug.trim())         { setError('Link é obrigatório.'); return }
    setSaving(true); setError('')
    try {
      const { error: err } = await supabase
        .from('photographer_profiles')
        .update({
          display_name: form.display_name.trim(),
          slug:         slugify(form.slug),
          bio:          form.bio.trim()       || null,
          instagram:    form.instagram.trim() || null,
          pix_key:      form.pix_key.trim()   || null,
          pix_info:     form.pix_info.trim()  || null,
        })
        .eq('id', user!.id)
      if (err) throw err
      await refreshProfile()
      setSuccess(true)
    } catch (err: unknown) {
      setError((err as Error).message?.includes('unique') ? 'Esse link já está em uso.' : 'Erro ao salvar.')
    } finally { setSaving(false) }
  }

  const bookingUrl = form.slug ? `${window.location.origin}/book/${slugify(form.slug)}` : ''

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Configurações</h1>
        <p className="page-subtitle">Gerencie seu perfil e link de agendamento.</p>
      </div>

      <div className="settings-layout">
        <form onSubmit={handleSubmit} className="card">
          <p className="card-title" style={{ marginBottom: 20 }}>Perfil público</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Input label="Nome de exibição" value={form.display_name}
              onChange={e => set('display_name', e.target.value)} required />

            <Input label="Link personalizado" value={form.slug}
              onChange={e => set('slug', slugify(e.target.value))} mono
              hint={bookingUrl ? `Seu link: ${bookingUrl}` : ''} />

            <div className="form-group">
              <label className="form-label">Bio</label>
              <textarea className="form-input" rows={3} value={form.bio}
                onChange={e => set('bio', e.target.value)}
                style={{ resize: 'vertical' }} />
            </div>

            <Input label="Instagram" placeholder="@usuario"
              value={form.instagram} onChange={e => set('instagram', e.target.value)} />

            <div className="divider" />
            <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-offwhite)' }}>Pagamento</p>

            <Input label="Chave PIX"
              value={form.pix_key} onChange={e => set('pix_key', e.target.value)} />

            <Input label="Instrução de pagamento"
              placeholder="Banco Inter, em nome de..."
              value={form.pix_info} onChange={e => set('pix_info', e.target.value)} />

            {error   && <p className="form-error">{error}</p>}
            {success && <p className="text-sm" style={{ color: 'var(--color-success)', textAlign: 'center' }}>✓ Perfil atualizado!</p>}

            <Button type="submit" loading={saving} full>Salvar alterações</Button>
          </div>
        </form>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <p className="card-title" style={{ marginBottom: 12 }}>Conta</p>
            <p className="text-sm text-muted" style={{ marginBottom: 16 }}>
              Logado como <span style={{ color: 'var(--color-offwhite)' }}>{user?.email}</span>
            </p>
            <Button variant="ghost" full onClick={async () => { await signOut(); navigate('/') }}>
              Sair da conta
            </Button>
          </div>

          <div className="card" style={{ borderColor: 'rgba(224,92,92,0.3)' }}>
            <p className="card-title" style={{ color: 'var(--color-danger)', marginBottom: 8 }}>Zona de perigo</p>
            <p className="text-sm text-muted" style={{ marginBottom: 16 }}>
              Seus dados ficam salvos na nuvem. Pode entrar novamente a qualquer momento.
            </p>
            <Button variant="danger" full onClick={async () => { await signOut(); navigate('/') }}>
              Sair e encerrar sessão
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}