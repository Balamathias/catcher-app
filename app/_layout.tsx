import { Stack } from "expo-router";
import { StatusBar } from 'expo-status-bar';
import { useThemedColors } from "@/hooks/useThemedColors";
import '@/globals.css'

export default function RootLayout() {
  const { theme } = useThemedColors();
  return (
    <Stack>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="info" options={{ headerShown: false }} />
      <Stack.Screen name="auth/login" options={{ headerShown: false, presentation: 'modal' }} />
      <Stack.Screen name="auth/register" options={{ headerShown: false, presentation: 'modal' }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
