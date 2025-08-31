import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemedColors } from '@/hooks/useThemedColors';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

const SearchScreen = () => {
  const { theme, colors } = useThemedColors();
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState<string | null>(null);
  const fade = useSharedValue(0);

  const resultStyle = useAnimatedStyle(() => ({ opacity: fade.value }));

  const handleSearch = () => {
    setSubmitted(query.trim());
    fade.value = 0;
    fade.value = withTiming(1, { duration: 450 });
    console.log('Prepared search query:', query.trim());
  };

  const statusBadge = (status: 'safe' | 'stolen' | 'unknown') => {
    const map = {
      safe: 'bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/30',
      stolen: 'bg-destructive/15 text-destructive border-destructive/40',
      unknown: 'bg-accent/40 text-muted-foreground border-border/50'
    };
    const label = status === 'safe' ? 'SAFE' : status === 'stolen' ? 'STOLEN' : 'UNKNOWN';
    return (
      <View className={`px-3 py-1 rounded-full border ${map[status]} mr-2 mb-2`}> 
        <Text className="text-[11px] tracking-wide font-semibold">{label}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView className={`flex-1 ${theme} bg-background`}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <View className="flex-1 px-6 pt-8">
          <Text className="text-2xl font-semibold text-foreground mb-2">Verify Item</Text>
          <Text className="text-sm text-muted-foreground mb-8">Enter a serial number to check its status.</Text>

          <View className="flex-row items-stretch mb-6">
            <View className="flex-1 bg-input rounded-xl border border-border/60 px-4 py-3 mr-3">
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Serial number"
                placeholderTextColor={colors.mutedForeground}
                className="text-foreground tracking-wide"
                autoCapitalize='characters'
              />
            </View>
            <TouchableOpacity
              onPress={handleSearch}
              disabled={!query.trim()}
              className={`px-5 rounded-xl justify-center bg-primary shadow-lg ${!query.trim() ? 'opacity-50' : 'opacity-100'}`}
            >
              <Text className="text-primary-foreground font-semibold">Check</Text>
            </TouchableOpacity>
          </View>

          {submitted && (
            <Animated.View style={resultStyle} className="mt-2">
              <Text className="text-sm text-muted-foreground mb-3">Sample statuses (placeholder preview):</Text>
              <View className="flex-row flex-wrap">
                {statusBadge('safe')}
                {statusBadge('stolen')}
                {statusBadge('unknown')}
              </View>
              <View className="mt-6 rounded-xl border border-dashed border-border/60 p-4 bg-accent/20">
                <Text className="text-[11px] text-muted-foreground leading-4">Real-time status lookup will be powered by backend verification against registered items.</Text>
              </View>
            </Animated.View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SearchScreen;
