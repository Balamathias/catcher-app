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
    <Text className="text-xs font-medium text-muted-foreground mb-2">Owner Name</Text>
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

    <Text className="text-xs font-medium text-muted-foreground mb-2">Email</Text>
    <Controller
      control={control}
      name="email"
      rules={{ maxLength: { value: 120, message: 'Too long' } }}
      render={({ field: { value, onChange } }) => (
        <View className="rounded-xl border border-border/90 px-4 py-3">
          <TextInput
            value={value}
            onChangeText={onChange}
            placeholder="Email and phone number"
            placeholderTextColor={colors.mutedForeground}
            className="text-foreground"
            keyboardType="email-address"
          />
        </View>
      )}
    />
    {errors.email && <Text className="text-[10px] text-rose-500 mt-2">{errors.email.message}</Text>}

    <Text className="text-xs font-medium text-muted-foreground mb-2 mt-4">Phone Number</Text>
    <Controller
      control={control}
      name="phone"
      render={({ field: { value, onChange } }) => (
        <View className="rounded-xl border border-border/90 px-4 py-3">
          <TextInput
            value={value}
            onChangeText={onChange}
            placeholder="Phone Number"
            placeholderTextColor={colors.mutedForeground}
            className="text-foreground"
            keyboardType="phone-pad"
          />
        </View>
      )}
    />
    {errors.phone && <Text className="text-[10px] text-rose-500 mt-2">{errors.phone.message}</Text>}
  </View>
);
