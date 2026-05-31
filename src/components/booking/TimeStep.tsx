import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { formatTime } from '../../utils/formatters'

interface Props {
  slots:    string[]
  date:     Date
  onSelect: (slot: string) => void
  onBack:   () => void
}

export function TimeStep({ slots, date, onSelect, onBack }: Props) {
  return (
    <div>
      <h2 className="booking-step-title">Escolha o horário</h2>
      <p className="text-sm text-muted" style={{ marginBottom: 20 }}>
        {format(date, "EEEE, dd 'de' MMMM", { locale: ptBR })}
      </p>
      {slots.length === 0 ? (
        <p className="text-sm text-muted">Nenhum horário disponível para essa data.</p>
      ) : (
        <div className="booking-slots">
          {slots.map(slot => (
            <button key={slot} className="booking-slot-btn" onClick={() => onSelect(slot)}>
              {formatTime(slot)}
            </button>
          ))}
        </div>
      )}
      <button className="btn btn--ghost" style={{ marginTop: 20 }} onClick={onBack}>← Voltar</button>
    </div>
  )
}