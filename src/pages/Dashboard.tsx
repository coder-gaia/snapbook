import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useBookings } from '../hooks/useBookings'
import { useServices } from '../hooks/useServices'
import { StatsCards } from '../components/dashboard/StatsCards'
import { UpcomingList } from '../components/dashboard/UpcomingList'
import { PageSkeleton } from '../components/ui/Skeleton'
import { Button } from '../components/ui/Button'
import { AlertCircle, Link } from 'lucide-react'

export default function Dashboard() {
  const { profile }  = useAuth()
  const navigate     = useNavigate()
  const { data: bookings, isLoading: loadingB, updateStatus } = useBookings()
  const { data: services, isLoading: loadingS } = useServices()

  if (loadingB || loadingS) return <PageSkeleton />

  const pending    = bookings?.filter(b => b.status === 'pending_payment') ?? []
  const bookingUrl = profile?.slug ? `${window.location.origin}/book/${profile.slug}` : null

  async function handleConfirm(id: string) {
    await updateStatus.mutateAsync({ id, status: 'confirmed' })
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">
          Olá, {profile?.display_name?.split(' ')[0]} 👋
        </h1>
        <p className="page-subtitle">Aqui está o resumo da sua agenda.</p>
      </div>

      {pending.length > 0 && (
        <div className="dash-alert">
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>
            {pending.length} agendamento{pending.length > 1 ? 's' : ''} aguardando confirmação de pagamento.
          </span>
          <Button size="sm" variant="secondary" onClick={() => navigate('/app/agenda')}>
            Ver agenda
          </Button>
        </div>
      )}

      <StatsCards bookings={bookings ?? []} services={services ?? []} />

      {bookingUrl && (
        <div className="card card--gold" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <Link size={18} style={{ color: 'var(--color-gold)', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <p className="text-sm text-muted">Compartilhe esse link com seus clientes</p>
              <p className="text-mono text-sm" style={{ color: 'var(--color-gold)', marginTop: 2 }}>
                {bookingUrl}
              </p>
            </div>
            <Button size="sm" variant="secondary"
              onClick={() => navigator.clipboard.writeText(bookingUrl)}>
              Copiar link
            </Button>
          </div>
        </div>
      )}

      <UpcomingList bookings={bookings ?? []} onConfirm={handleConfirm} />
    </div>
  )
}