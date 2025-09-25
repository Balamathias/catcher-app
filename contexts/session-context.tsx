import { supabase } from '@/lib/supabase'
import { AppConfig, ListDataPlans, TVData, WalletBalance } from '@/services/api'
import { useGetAppConfig, useGetBeneficiaries, useGetLatestTransactions, useGetUserProfile, useGetWalletBalance, useListDataPlans, useListElectricityServices, useListTVServices } from '@/services/api-hooks'
import { Tables } from '@/types/supabase'
import { Session, User } from '@supabase/supabase-js'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { Text } from 'react-native'
// import SplashScreen from './splash-screen'

interface SessionContextType {
  session: Session | null
  user: User | null
  isLoading: boolean,
}

const SessionContext = createContext<SessionContextType>({
  session: null,
  user: null,
  isLoading: true,
})

export const SessionProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  const shouldFetchUserData = !!user;

  useEffect(() => {
    const initializeSession = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession()
        setSession(currentSession)
        setUser(currentSession?.user ?? null)
      } catch (error) {
        console.error('Error initializing session:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, currentSession) => {
      setSession(currentSession)
      setUser(currentSession?.user ?? null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    session, 
    user, 
    isLoading
  }), [
    session,
    user,
    isLoading,
  ]);

  const [splash, setSplash] = useState<null | typeof import('expo-splash-screen')>(null)

  useEffect(() => {
    let mounted = true
    import('expo-splash-screen')
      .then(mod => {
        if (!mounted) return
        setSplash(mod)
        mod.preventAutoHideAsync().catch(() => {})
      })
      .catch(() => {})
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    if (!isLoading && splash) {
      splash.hideAsync().catch(() => {})
    }
  }, [isLoading, splash])

  if (isLoading) return <Text>Loading...</Text>

  return (
    <SessionContext.Provider value={contextValue}>
      {children}
    </SessionContext.Provider>
  )
}

export const useSession = () => {
  const context = useContext(SessionContext)
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider')
  }
  return context
}

export const useAuth = () => {
  const { session, user, isLoading } = useSession()
  return { session, user, isLoading }
}
