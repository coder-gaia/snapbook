import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../services/supabase'
import { useAuth } from './useAuth'
import type { Availability, BlockedDate } from '../types'

export function useAvailability() {
  const { user } = useAuth()
  const qc = useQueryClient()

  const availQuery = useQuery({
    queryKey: ['availability', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('availability')
        .select('*')
        .eq('photographer_id', user!.id)
        .order('day_of_week')
      if (error) throw error
      return data as Availability[]
    },
  })

  const blockedQuery = useQuery({
    queryKey: ['blocked_dates', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blocked_dates')
        .select('*')
        .eq('photographer_id', user!.id)
        .order('blocked_date')
      if (error) throw error
      return data as BlockedDate[]
    },
  })

  // Salva a disponibilidade semanal completa (delete + insert)
  const saveAvailability = useMutation({
    mutationFn: async (rows: { day_of_week: number; start_time: string; end_time: string }[]) => {
      await supabase.from('availability').delete().eq('photographer_id', user!.id)
      if (rows.length === 0) return
      const { error } = await supabase.from('availability').insert(
        rows.map(r => ({ ...r, photographer_id: user!.id }))
      )
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['availability'] }),
  })

  const addBlocked = useMutation({
    mutationFn: async ({ date, reason }: { date: string; reason?: string }) => {
      const { error } = await supabase.from('blocked_dates').insert({
        photographer_id: user!.id, blocked_date: date, reason: reason || null,
      })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['blocked_dates'] }),
  })

  const removeBlocked = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('blocked_dates').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['blocked_dates'] }),
  })

  return { availQuery, blockedQuery, saveAvailability, addBlocked, removeBlocked }
}