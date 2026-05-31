import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../services/supabase'
import { useAuth } from './useAuth'
import type { Service, ServiceFormData } from '../types'

export function useServices() {
  const { user } = useAuth()
  const qc = useQueryClient()

  const query = useQuery({
    queryKey: ['services', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('photographer_id', user!.id)
        .order('created_at')
      if (error) throw error
      return data as Service[]
    },
  })

  const create = useMutation({
    mutationFn: async (form: ServiceFormData) => {
      const { error } = await supabase.from('services').insert({
        photographer_id: user!.id,
        name:         form.name,
        description:  form.description || null,
        duration_min: parseInt(form.duration_min),
        price:        parseFloat(form.price),
        deposit:      form.deposit ? parseFloat(form.deposit) : null,
        active:       true,
      })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['services'] }),
  })

  const toggle = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase.from('services').update({ active }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['services'] }),
  })

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('services').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['services'] }),
  })

  return { ...query, create, toggle, remove }
}