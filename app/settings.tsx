import { View, Text } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import StackHeader from '@/components/header.stack'
import { useThemedColors } from '@/hooks/useThemedColors'

const SettingsScreen = () => {
  const { theme } = useThemedColors()
  return (
    <SafeAreaView edges={['bottom']} className={`flex-1 ${theme} items-center justify-center h-full bg-background`}>
      <StackHeader title="Settings" />
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-foreground">Settings Screen</Text>
      </View>
    </SafeAreaView>
  )
}

export default SettingsScreen