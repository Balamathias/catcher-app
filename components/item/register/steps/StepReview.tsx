import React from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import type { FormValues, ThemedColors } from '../types';
import { REG_FEE } from '../constants';

interface StepReviewProps {
  values: FormValues;
  onSubmit: () => void;
  submitting: boolean;
  colors: ThemedColors;
}

export const StepReview: React.FC<StepReviewProps> = ({ values, onSubmit, submitting, colors }) => (
  <View>
    <Text className="text-base font-semibold text-foreground mb-4">Review Details</Text>
    <View className="rounded-xl border border-border/60 bg-card p-4 mb-5">
      {([
        ['Item Name', values.name],
        ['Serial', values.serial],
        ['Category', values.category],
        ['Status', values.status],
        ['Owner', values.owner || '—'],
        ['Contact', values.contact || '—'],
        ['Images', values.images.length.toString()]
      ] as [string, string][]) .map(([label, val]) => (
        <View key={label} className="flex-row justify-between mb-2">
          <Text className="text-[11px] text-muted-foreground mr-3" numberOfLines={1}>{label}</Text>
          <Text className="text-[11px] font-medium text-foreground flex-1 text-right" numberOfLines={2}>{val}</Text>
        </View>
      ))}
    </View>

    <View className="rounded-xl border border-primary/40 bg-primary/5 p-4 mb-6">
      <Text className="text-xs text-primary font-medium mb-1">Payment Summary</Text>
      <View className="flex-row justify-between items-center">
        <Text className="text-sm text-muted-foreground">Registration Fee</Text>
        <Text className="text-base font-semibold text-foreground">₦{REG_FEE.toLocaleString()}</Text>
      </View>
    </View>

    <Pressable
      onPress={onSubmit}
      disabled={!values.name.trim() || !values.serial.trim() || submitting}
      className={`h-14 rounded-xl flex-row items-center justify-center shadow-lg ${(values.name.trim() && values.serial.trim() && !submitting) ? 'bg-primary' : 'bg-muted'}`}
    >
      {submitting && <ActivityIndicator size="small" color={colors.primaryForeground} style={{ marginRight: 8 }} />}
      <Text className={`font-semibold text-base ${(values.name.trim() && values.serial.trim() && !submitting) ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
        Proceed to Payment (₦{REG_FEE.toLocaleString()})
      </Text>
    </Pressable>

    <View className="mt-6 rounded-xl border border-dashed border-border/60 p-4 bg-accent/20">
      <Text className="text-[11px] text-muted-foreground leading-4">
        Serials will be hashed before storage (future implementation) to enhance privacy while enabling public verification.
      </Text>
    </View>
  </View>
);
