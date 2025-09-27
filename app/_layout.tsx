import '@/globals.css'

import { Stack } from "expo-router";
import { StatusBar } from 'expo-status-bar';
import { useThemedColors } from "@/hooks/useThemedColors";
import { AppState } from 'react-native';

import { supabase } from '@/lib/supabase'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider, useSession } from '@/contexts/session-context';

const queryClient = new QueryClient();


export default function RootLayout() {

  const { theme } = useThemedColors();
  const { user } = useSession()

  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh()
    } else {
      supabase.auth.stopAutoRefresh()
    }
  });
  
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <SessionProvider>
          <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="info" options={{ headerShown: false }} />
            <Stack.Screen name="auth/login" options={{ headerShown: false, presentation: 'modal' }} />
            <Stack.Screen name="auth/register" options={{ headerShown: false, presentation: 'modal' }} />
            <Stack.Protected
              guard={!user}
            >
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="items" options={{ headerShown: false }} />
            </Stack.Protected>
          </Stack>
        </SessionProvider>
      </QueryClientProvider>
    </>
  );
}
