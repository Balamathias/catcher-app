import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { Controller, type Control, type FieldErrors } from 'react-hook-form';
import type { FormValues, ThemedColors } from '../types';

interface StepBasicsProps {
  control: Control<FormValues>;
  errors: FieldErrors<FormValues>;
  colors: ThemedColors;
  onSerialChange: (value: string) => void;
}

export const StepBasics: React.FC<StepBasicsProps> = ({ control, errors, colors, onSerialChange }) => (
  <View>
    <Text className="text-xs font-medium text-muted-foreground mb-2">Item Name *</Text>
    <Controller
      control={control}
      name="name"
      rules={{ required: 'Item name is required', minLength: { value: 2, message: 'Too short' } }}
      render={({ field: { onChange, onBlur, value } }) => (
        <View className="rounded-xl border border-border/95 px-4 py-3 mb-2">
          <TextInput
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder="MacBook Pro"
            placeholderTextColor={colors.mutedForeground}
            className="text-foreground"
            autoCapitalize="words"
          />
        </View>
      )}
    />
    {errors.name && <Text className="text-[10px] text-rose-500 mb-4">{errors.name.message}</Text>}

    <Text className="text-xs font-medium text-muted-foreground mb-2">Serial Number *</Text>
    <Controller
      control={control}
      name="serial"
      rules={{
        required: 'Serial is required',
        minLength: { value: 4, message: 'Too short' },
        maxLength: { value: 40, message: 'Max 40 chars' },
        pattern: { value: /^[A-Z0-9-]*$/, message: 'Only letters, numbers, -' }
      }}
      render={({ field: { value } }) => (
        <View className="rounded-xl border border-border/95 px-4 py-3">
          <TextInput
            value={value}
            onChangeText={onSerialChange}
            placeholder="XXXX-YYYY-ZZZZ"
            placeholderTextColor={colors.mutedForeground}
            className="text-foreground tracking-wide"
            autoCapitalize="characters"
          />
        </View>
      )}
    />
    {errors.serial && <Text className="text-[10px] text-rose-500 mt-2">{errors.serial.message}</Text>}
  </View>
);
