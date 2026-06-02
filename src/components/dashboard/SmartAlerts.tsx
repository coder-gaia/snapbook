import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { differenceInHours, parseISO } from 'date-fns'
import { AlertCircle, Clock, X } from 'lucide-react'
import type { Booking } from '../../types'

interface Alert {
  id: string
  type: 'danger' | 'warning'
  message: string
  action?: {
    label: string
    to: string
  }
}

interface Props {
  bookings: Booking[]
}

export function SmartAlerts({ bookings }: Props) {
  const navigate = useNavigate()
  const [dismissed, setDismissed] = useState<string[]>([])

  const alerts = useMemo<Alert[]>(() => {
    const list: Alert[] = []
    const now = new Date()

    // Agendamentos pendentes há mais de 24h
    const oldPending = bookings.filter((b) => {
      if (b.status !== 'pending_payment') return false

      const hoursWaiting = differenceInHours(
        now,
        parseISO(b.created_at)
      )

      return hoursWaiting >= 24
    })

    if (oldPending.length > 0) {
      list.push({
        id: 'old-pending',
        type: 'danger',
        message: `${oldPending.length} agendamento${
          oldPending.length > 1 ? 's' : ''
        } aguarda${oldPending.length > 1 ? 'm' : ''} confirmação há mais de 24h. Verifique se o pagamento foi recebido.`,
        action: {
          label: 'Ver agenda',
          to: '/app/agenda',
        },
      })
    }

    // Agendamentos pendentes recentes (menos de 24h)
    const recentPending = bookings.filter((b) => {
      if (b.status !== 'pending_payment') return false

      const hoursWaiting = differenceInHours(
        now,
        parseISO(b.created_at)
      )

      return hoursWaiting < 24
    })

    if (recentPending.length > 0) {
      list.push({
        id: 'recent-pending',
        type: 'warning',
        message: `${recentPending.length} novo${
          recentPending.length > 1 ? 's' : ''
        } agendamento${
          recentPending.length > 1 ? 's' : ''
        } aguardando confirmação de pagamento.`,
        action: {
          label: 'Confirmar',
          to: '/app/agenda',
        },
      })
    }

    return list
  }, [bookings])

  const visible = alerts.filter(
    (alert) => !dismissed.includes(alert.id)
  )

  if (!visible.length) return null

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        marginBottom: 20,
      }}
    >
      <AnimatePresence>
        {visible.map((alert) => (
          <motion.div
            key={alert.id}
            className={`smart-alert smart-alert--${alert.type}`}
            initial={{
              opacity: 0,
              y: -8,
              height: 0,
            }}
            animate={{
              opacity: 1,
              y: 0,
              height: 'auto',
            }}
            exit={{
              opacity: 0,
              y: -8,
              height: 0,
            }}
            transition={{ duration: 0.2 }}
          >
            {alert.type === 'danger' ? (
              <AlertCircle
                size={16}
                style={{ flexShrink: 0 }}
              />
            ) : (
              <Clock
                size={16}
                style={{ flexShrink: 0 }}
              />
            )}

            <span className="smart-alert-msg">
              {alert.message}
            </span>

            <div
              style={{
                display: 'flex',
                gap: 8,
                alignItems: 'center',
                flexShrink: 0,
              }}
            >
              {alert.action && (
                <button
                  className="smart-alert-action"
                  onClick={() => navigate(alert.action!.to)}
                >
                  {alert.action.label}
                </button>
              )}

              <button
                className="smart-alert-close"
                onClick={() =>
                  setDismissed((prev) => [
                    ...prev,
                    alert.id,
                  ])
                }
                aria-label="Fechar"
              >
                <X size={14} />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}