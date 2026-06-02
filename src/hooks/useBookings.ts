import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../services/supabase'
import { useAuth } from './useAuth'
import type { Booking } from '../types'

export function useBookings() {
  const { user } = useAuth()
  const qc = useQueryClient()

  const query = useQuery({
    queryKey: ['bookings', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, service:services(id, name, duration_min, price)')
        .eq('photographer_id', user!.id)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true })
      if (error) throw error
      return data as Booking[]
    },
  })

  const updateNotes = useMutation({
  mutationFn: async ({
    id,
    notes,
  }: {
    id: string
    notes: string
  }) => {
    const { error } = await supabase
      .from('bookings')
      .update({
        photographer_notes: notes,
      })
      .eq('id', id)

    if (error) throw error
  },

  onSuccess: () =>
    qc.invalidateQueries({
      queryKey: ['bookings'],
    }),
})

  const updateStatus = useMutation({
    mutationFn: async ({ id, status, notes }: {
      id: string
      status: Booking['status']
      notes?: string
    }) => {
      const { error } = await supabase
        .from('bookings')
        .update({ status, ...(notes !== undefined ? { photographer_notes: notes } : {}) })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bookings'] }),
  })

  return { ...query, updateStatus, updateNotes }
}

// Hook separado para a página pública — busca por slug sem auth
export function usePublicBookings(photographerId: string | undefined) {
  return useQuery({
    queryKey: ['public_bookings', photographerId],
    enabled: !!photographerId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('id, date, start_time, end_time, status, service_id')
        .eq('photographer_id', photographerId!)
        .neq('status', 'cancelled')
      if (error) throw error
      return data as Pick<Booking, 'id' | 'date' | 'start_time' | 'end_time' | 'status' | 'service_id'>[]
    },
  })
}