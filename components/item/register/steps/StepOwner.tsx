import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { Controller, type Control, type FieldErrors } from 'react-hook-form';
import type { FormValues, ThemedColors } from '../types';

interface StepOwnerProps {
  control: Control<FormValues>;
  errors: FieldErrors<FormValues>;
  colors: ThemedColors;
}

export const StepOwner: React.FC<StepOwnerProps> = ({ control, errors, colors }) => (
  <View>
    <Text className="text-xs font-medium text-muted-foreground mb-2">Owner Name (Optional)</Text>
    <Controller
      control={control}
      name="owner"
      render={({ field: { value, onChange } }) => (
        <View className="rounded-xl border border-border/90 px-4 py-3 mb-4">
          <TextInput
            value={value}
            onChangeText={onChange}
            placeholder="Jane Smith"
            placeholderTextColor={colors.mutedForeground}
            className="text-foreground"
          />
        </View>
      )}
    />

    <Text className="text-xs font-medium text-muted-foreground mb-2">Contact Information (Optional)</Text>
    <Controller
      control={control}
      name="contact"
      rules={{ maxLength: { value: 120, message: 'Too long' } }}
      render={({ field: { value, onChange } }) => (
        <View className="rounded-xl border border-border/90 px-4 py-3">
          <TextInput
            value={value}
            onChangeText={onChange}
            placeholder="Email or phone number"
            placeholderTextColor={colors.mutedForeground}
            className="text-foreground"
            keyboardType="email-address"
          />
        </View>
      )}
    />
    {errors.contact && <Text className="text-[10px] text-rose-500 mt-2">{errors.contact.message}</Text>}
  </View>
);
