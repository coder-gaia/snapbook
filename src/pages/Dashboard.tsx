import { useAuth } from '../hooks/useAuth'
import { useBookings } from '../hooks/useBookings'
import { useServices } from '../hooks/useServices'
import { StatsCards } from '../components/dashboard/StatsCards'
import { UpcomingList } from '../components/dashboard/UpcomingList'
import { SmartAlerts } from '../components/dashboard/SmartAlerts'
import { PageSkeleton } from '../components/ui/Skeleton'
import { Button } from '../components/ui/Button'
import { Link } from 'lucide-react'

export default function Dashboard() {
  const { profile } = useAuth()
  const { data: bookings, isLoading: loadingB, updateStatus } = useBookings()
  const { data: services, isLoading: loadingS } = useServices()

  if (loadingB || loadingS) return <PageSkeleton />

  const bookingUrl = profile?.slug
    ? `${window.location.origin}/book/${profile.slug}`
    : null

  async function handleConfirm(id: string) {
    await updateStatus.mutateAsync({ id, status: 'confirmed' })
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">
          Olá, {profile?.display_name?.split(' ')[0]}!
        </h1>
        <p className="page-subtitle">Aqui está o resumo da sua agenda.</p>
      </div>

      <SmartAlerts bookings={bookings ?? []} />

      <StatsCards bookings={bookings ?? []} services={services ?? []} />

      {bookingUrl && (
        <div className="card card--gold" style={{ marginBottom: 20 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            <Link
              size={18}
              style={{ color: 'var(--color-gold)', flexShrink: 0 }}
            />

            <div style={{ flex: 1 }}>
              <p className="text-sm text-muted">
                Compartilhe com seus clientes
              </p>

              <p
                className="text-mono text-sm"
                style={{
                  color: 'var(--color-gold)',
                  marginTop: 2,
                }}
              >
                {bookingUrl}
              </p>
            </div>

            <Button
              size="sm"
              variant="secondary"
              onClick={() => navigator.clipboard.writeText(bookingUrl)}
            >
              Copiar link
            </Button>
          </div>
        </div>
      )}

      <UpcomingList
        bookings={bookings ?? []}
        onConfirm={handleConfirm}
      />
    </div>
  )
}