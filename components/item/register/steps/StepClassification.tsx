import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { type Control, useWatch } from 'react-hook-form';
import type { FormValues } from '../types';
import { CATEGORIES, STATUSES } from '../constants';

interface StepClassificationProps {
  control: Control<FormValues>;
  onCategoryChange: (value: FormValues['category']) => void;
  onStatusChange: (value: FormValues['status']) => void;
}

const PillSelect: React.FC<{ options: readonly string[]; value: string; onChange: (v: string) => void }> = ({ options, value, onChange }) => (
  <View className="flex-row flex-wrap -mr-2">
    {options.map(option => {
      const active = option === value;
      return (
        <Pressable
          key={option}
          onPress={() => onChange(option)}
          className={`px-4 py-2 rounded-full border mr-2 mb-2 ${active ? 'bg-primary border-primary' : 'bg-muted/40 border-border/60'}`}
        >
          <Text className={`text-xs font-medium ${active ? 'text-primary-foreground' : 'text-muted-foreground'}`}>{option}</Text>
        </Pressable>
      );
    })}
  </View>
);

const Segmented: React.FC<{ options: readonly string[]; value: string; onChange: (v: string) => void }> = ({ options, value, onChange }) => (
  <View className="flex-row rounded-xl p-1 bg-muted/50 border border-border/60">
    {options.map(option => {
      const active = option === value;
      return (
        <Pressable
          key={option}
          onPress={() => onChange(option)}
          className={`flex-1 py-2 rounded-lg items-center ${active ? 'bg-primary shadow-sm' : ''}`}
        >
          <Text className={`text-[11px] font-medium ${active ? 'text-white dark:text-black' : 'text-muted-foreground'}`}>{option}</Text>
        </Pressable>
      );
    })}
  </View>
);

export const StepClassification: React.FC<StepClassificationProps> = ({ control, onCategoryChange, onStatusChange }) => {
  const category = useWatch({ control, name: 'category' });
  const status = useWatch({ control, name: 'status' });

  return (
    <View>
      <Text className="text-xs font-medium text-muted-foreground mb-2">Category</Text>
      <PillSelect options={CATEGORIES} value={category} onChange={value => onCategoryChange(value as FormValues['category'])} />
      <View className="h-4" />
      <Text className="text-xs font-medium text-muted-foreground mb-2">Status</Text>
      <Segmented options={STATUSES} value={status} onChange={value => onStatusChange(value as FormValues['status'])} />
    </View>
  );
};
