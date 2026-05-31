type Step = 'service' | 'date' | 'time' | 'client' | 'confirm'
const STEPS: Step[] = ['service', 'date', 'time', 'client', 'confirm']

interface Props { current: Step }

export function BookingProgress({ current }: Props) {
  const idx = STEPS.indexOf(current)
  return (
    <div className="booking-progress">
      {STEPS.map((_, i) => (
        <div key={i} className={`booking-step-dot ${i <= idx ? 'booking-step-dot--active' : ''}`} />
      ))}
    </div>
  )
}