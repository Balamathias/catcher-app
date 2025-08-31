import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemedColors } from '@/hooks/useThemedColors';

const HomeScreen = () => {
  const { theme } = useThemedColors();
  return (
    <SafeAreaView className={`flex-1 ${theme} bg-background`}>
      <View className="flex-1 px-6 pt-8">
        <Text className="text-4xl font-semibold text-foreground mb-2">Dashboard</Text>
        <Text className="text-sm text-muted-foreground mb-6">Quick glance at your registered items & status.</Text>
        <View className="rounded-xl border border-border/60 bg-card p-5 mb-4">
          <Text className="text-sm text-muted-foreground mb-1">Registered Items</Text>
          <Text className="text-foreground text-xl font-semibold">0</Text>
        </View>
        <View className="rounded-xl border border-border/60 bg-card p-5 mb-4">
          <Text className="text-sm text-muted-foreground mb-1">Stolen Alerts</Text>
          <Text className="text-foreground text-xl font-semibold">0</Text>
        </View>
        <View className="rounded-xl border border-dashed border-border/60 bg-accent/30 p-5">
          <Text className="text-sm text-muted-foreground mb-2">Get started by adding your first valuable.</Text>
          <Text className="text-primary font-medium">Tap the + button below.</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;
