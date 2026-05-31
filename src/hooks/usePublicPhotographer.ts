import { useQuery } from '@tanstack/react-query'
import { supabase } from '../services/supabase'
import type { PhotographerProfile, Service, Availability, BlockedDate } from '../types'

export interface PublicPhotographerData {
  profile:      PhotographerProfile
  services:     Service[]
  availability: Availability[]
  blockedDates: BlockedDate[]
}

export function usePublicPhotographer(slug: string | undefined) {
  return useQuery({
    queryKey: ['public_photographer', slug],
    enabled: !!slug,
    queryFn: async (): Promise<PublicPhotographerData> => {
      // Busca perfil pelo slug
      const { data: profile, error: pe } = await supabase
        .from('photographer_profiles')
        .select('*')
        .eq('slug', slug!)
        .maybeSingle()

      if (pe) throw pe
      if (!profile) throw new Error('Fotógrafo não encontrado')

      // Busca serviços, disponibilidade e datas bloqueadas em paralelo
      const [svcRes, availRes, blockedRes] = await Promise.all([
        supabase.from('services').select('*').eq('photographer_id', profile.id).eq('active', true),
        supabase.from('availability').select('*').eq('photographer_id', profile.id),
        supabase.from('blocked_dates').select('*').eq('photographer_id', profile.id),
      ])

      return {
        profile,
        services:     (svcRes.data    ?? []) as Service[],
        availability: (availRes.data   ?? []) as Availability[],
        blockedDates: (blockedRes.data ?? []) as BlockedDate[],
      }
    },
  })
}