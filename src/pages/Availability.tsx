import { useState, useEffect } from 'react'
import { useAvailability } from '../hooks/useAvailability'
import { Button } from '../components/ui/Button'
import { Skeleton } from '../components/ui/Skeleton'
import { formatDateShort, DAY_NAMES } from '../utils/formatters'
import { Trash2 } from 'lucide-react'

const DEFAULT_SCHEDULE = DAY_NAMES.map((_, i) => ({
  day: i, active: i >= 1 && i <= 5, start: '09:00', end: '18:00',
}))

export default function Availability() {
  const { availQuery, blockedQuery, saveAvailability, addBlocked, removeBlocked } = useAvailability()
  const [schedule, setSchedule] = useState(DEFAULT_SCHEDULE)
  const [newBlock, setNewBlock] = useState('')
  const [saving, setSaving]     = useState(false)
  const [saved, setSaved]       = useState(false)

  // Sincroniza com dados do banco ao carregar
  useEffect(() => {
    if (!availQuery.data) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSchedule(DEFAULT_SCHEDULE.map(def => {
      const row = availQuery.data.find(a => a.day_of_week === def.day)
      if (!row) return def
      return { ...def, active: true, start: row.start_time.slice(0,5), end: row.end_time.slice(0,5) }
    }))
  }, [availQuery.data])

  function toggle(day: number) {
    setSchedule(p => p.map(s => s.day === day ? { ...s, active: !s.active } : s))
    setSaved(false)
  }

  function setTime(day: number, field: 'start' | 'end', value: string) {
    setSchedule(p => p.map(s => s.day === day ? { ...s, [field]: value } : s))
    setSaved(false)
  }

  async function handleSave() {
    setSaving(true)
    try {
      await saveAvailability.mutateAsync(
        schedule.filter(s => s.active).map(s => ({
          day_of_week: s.day, start_time: s.start, end_time: s.end,
        }))
      )
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch { /* empty */ }
    finally { setSaving(false) }
  }

  async function handleAddBlock() {
    if (!newBlock) return
    await addBlocked.mutateAsync({ date: newBlock })
    setNewBlock('')
  }

  if (availQuery.isLoading) return (
    <div>
      <div className="page-header"><Skeleton width="200px" height={30} /></div>
      <div className="card"><Skeleton height={280} /></div>
    </div>
  )

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Disponibilidade</h1>
        <p className="page-subtitle">Configure seus dias e horários de atendimento.</p>
      </div>

      {/* Horários semanais */}
      <div className="card" style={{ marginBottom: 20 }}>
        <p className="card-title" style={{ marginBottom: 16 }}>Horários semanais</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {schedule.map(s => (
            <div key={s.day} className={`avail-row ${s.active ? 'avail-row--active' : ''}`}>
              <button type="button" className="avail-day-toggle" onClick={() => toggle(s.day)}>
                <span className={`avail-check ${s.active ? 'avail-check--on' : ''}`}>{s.active ? '✓' : ''}</span>
                <span className="avail-day-name">{DAY_NAMES[s.day]}</span>
              </button>
              {s.active ? (
                <div className="avail-times">
                  <input type="time" className="form-input form-input--mono"
                    style={{ width: 110 }} value={s.start}
                    onChange={e => setTime(s.day, 'start', e.target.value)} />
                  <span className="text-muted text-sm">até</span>
                  <input type="time" className="form-input form-input--mono"
                    style={{ width: 110 }} value={s.end}
                    onChange={e => setTime(s.day, 'end', e.target.value)} />
                </div>
              ) : (
                <span className="text-sm text-muted">Indisponível</span>
              )}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 20 }}>
          <Button loading={saving} onClick={handleSave}>Salvar horários</Button>
          {saved && <span className="text-sm" style={{ color: 'var(--color-success)' }}>✓ Salvo!</span>}
        </div>
      </div>

      {/* Datas bloqueadas */}
      <div className="card">
        <p className="card-title" style={{ marginBottom: 16 }}>Datas bloqueadas</p>
        <p className="text-sm text-muted" style={{ marginBottom: 16 }}>
          Adicione datas em que você não vai atender (feriados, viagens, etc.)
        </p>

        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          <input type="date" className="form-input" style={{ width: 'auto' }}
            value={newBlock} onChange={e => setNewBlock(e.target.value)} />
          <Button onClick={handleAddBlock} disabled={!newBlock} loading={addBlocked.isPending}>
            Bloquear data
          </Button>
        </div>

        {!blockedQuery.data?.length ? (
          <p className="text-sm text-muted">Nenhuma data bloqueada.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {blockedQuery.data.map(b => (
              <div key={b.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--color-surface-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                <span className="text-mono text-sm">{formatDateShort(b.blocked_date)}</span>
                {b.reason && <span className="text-sm text-muted">{b.reason}</span>}
                <button className="btn btn--ghost btn--icon btn--sm" onClick={() => removeBlocked.mutate(b.id)}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}