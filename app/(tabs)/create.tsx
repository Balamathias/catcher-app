import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemedColors } from '@/hooks/useThemedColors';
import Animated, { useSharedValue, withSpring, useAnimatedStyle } from 'react-native-reanimated';

const CreateItemScreen = () => {
  const { theme, colors } = useThemedColors();
  const [serial, setSerial] = useState('');
  const [name, setName] = useState('');
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handleAdd = () => {
    scale.value = 0.96;
    scale.value = withSpring(1, { damping: 12, stiffness: 180 });
    console.log('Prepared item payload:', { name: name.trim(), serial: serial.trim() });
  };

  return (
    <SafeAreaView className={`flex-1 ${theme} bg-background`}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <View className="flex-1 px-6 pt-8">
          <Text className="text-2xl font-semibold text-foreground mb-2">Register Item</Text>
          <Text className="text-sm text-muted-foreground mb-8">Add a device or valuable to establish provenance.</Text>

          <View className="mb-5">
            <Text className="text-xs font-medium text-muted-foreground mb-2">Item Name</Text>
            <View className="bg-input rounded-xl border border-border/60 px-4 py-3">
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="e.g. MacBook Pro 14"
                placeholderTextColor={colors.mutedForeground}
                className="text-foreground"
                autoCapitalize='words'
              />
            </View>
          </View>

          <View className="mb-8">
            <Text className="text-xs font-medium text-muted-foreground mb-2">Serial Number</Text>
            <View className="bg-input rounded-xl border border-border/60 px-4 py-3">
              <TextInput
                value={serial}
                onChangeText={setSerial}
                placeholder="Enter serial"
                placeholderTextColor={colors.mutedForeground}
                className="text-foreground tracking-wide"
                autoCapitalize='characters'
              />
            </View>
          </View>

          <Animated.View style={animatedStyle}>
            <TouchableOpacity
              onPress={handleAdd}
              disabled={!serial.trim() || !name.trim()}
              className={`h-14 rounded-xl justify-center items-center bg-primary shadow-lg ${(!serial.trim() || !name.trim()) ? 'opacity-50' : 'opacity-100'}`}
            >
              <Text className="text-primary-foreground font-semibold text-base">Save Item</Text>
            </TouchableOpacity>
          </Animated.View>

          <View className="mt-8 rounded-xl border border-dashed border-border/60 p-4 bg-accent/20">
            <Text className="text-[11px] text-muted-foreground leading-4">We hash serials before storage (future implementation) to enhance privacy while enabling verification.</Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CreateItemScreen;
