import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../services/supabase'
import type { PhotographerProfile } from '../types'

interface AuthContextType {
  user: User | null; profile: PhotographerProfile | null; loading: boolean
  isAuthenticated: boolean; hasProfile: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,    setUser]    = useState<User | null>(null)
  const [profile, setProfile] = useState<PhotographerProfile | null>(null)
  const [loading, setLoading] = useState(true)

  async function fetchProfileData(userId: string): Promise<PhotographerProfile | null> {
    try {
      const { data } = await supabase.from('photographer_profiles').select('*').eq('id', userId).maybeSingle()
      return data ?? null
    } catch { return null }
  }

  async function refreshProfile() {
    if (!user) return
    const p = await fetchProfileData(user.id)
    setProfile(p)
  }

  useEffect(() => {
    let mounted = true
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return
      if (session?.user) {
        setUser(session.user)
        const p = await fetchProfileData(session.user.id)
        if (mounted) setProfile(p)
      }
      if (mounted) setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') setUser(session?.user ?? null)
      else if (event === 'SIGNED_OUT') { setUser(null); setProfile(null) }
    })
    return () => { mounted = false; subscription.unsubscribe() }
  }, [])

  async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    if (data.session?.user) {
      setUser(data.session.user)
      const p = await fetchProfileData(data.session.user.id)
      setProfile(p)
    }
  }
  async function signUp(email: string, password: string) {
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
  }
  async function signOut() {
    setUser(null); setProfile(null)
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{
      user, profile, loading,
      isAuthenticated: !!user,
      hasProfile: !!profile?.display_name,
      signIn, signUp, signOut, refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}