import { supabase } from '@/lib/supabase'
import { Session, User } from '@supabase/supabase-js'
import { StatusBar } from 'expo-status-bar'
import React, { createContext, useContext, useEffect, useMemo, useState, useRef } from 'react'
import { Animated, Easing, StyleSheet, View, Text } from 'react-native'

const logo =  require('@/assets/logo/logo.png')

interface SessionContextType {
  session: Session | null
  user: User | null
  isLoading: boolean
}

const SessionContext = createContext<SessionContextType>({
  session: null,
  user: null,
  isLoading: true,
})

const AnimatedSplash = () => {
  const scale = useRef(new Animated.Value(0)).current
  const opacity = useRef(new Animated.Value(0)).current
  const rotate = useRef(new Animated.Value(0)).current
  const pulse = useRef(new Animated.Value(0)).current

  useEffect(() => {
    // Hide native splash as soon as our custom splash mounts
    let mounted = true
    import('expo-splash-screen')
      .then(mod => {
        if (!mounted) return
        mod.hideAsync().catch(() => {})
      })
      .catch(() => {})
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    // Intro animation
    Animated.parallel([
      Animated.timing(scale, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.back(1.6)),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(rotate, {
        toValue: 1,
        duration: 900,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Subtle idle pulse
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, {
            toValue: 1,
            duration: 1100,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(pulse, {
            toValue: 0,
            duration: 1100,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      )
      loop.start()
    })
  }, [scale, opacity, rotate, pulse])

  const rotateDeg = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['-8deg', '0deg'],
  })

  const pulseScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.12],
  })
  const pulseOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.15, 0.35],
  })

  return (
    <View style={styles.splashContainer}>
      <StatusBar style="dark" />
      <Animated.View
        style={[
          styles.pulseRing,
          {
            opacity: pulseOpacity,
            transform: [{ scale: pulseScale }],
          },
        ]}
      />
      <Animated.Image
        source={logo}
        style={[
          styles.logo,
          {
            opacity,
            transform: [{ scale }, { rotate: rotateDeg }],
          },
        ]}
        resizeMode="contain"
      />
      <Animated.Text style={[styles.brand, { opacity }]}>
        Catcher
      </Animated.Text>
    </View>
  )
}

export const SessionProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

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

  const contextValue = useMemo(() => ({
    session,
    user,
    isLoading,
  }), [session, user, isLoading])

  // Keep native splash until JS is ready, then we hide it inside AnimatedSplash
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

  // Ensure native splash is hidden if still visible
  useEffect(() => {
    if (splash) splash.hideAsync().catch(() => {})
  }, [splash])

  if (isLoading) return <AnimatedSplash />


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

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 140,
    height: 140,
  },
  brand: {
    marginTop: 16,
    fontSize: 22,
    fontWeight: '600',
    letterSpacing: 1.1,
    color: '#027d96',
  },
  pulseRing: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
  },
})
