import React from 'react';
import { View } from 'react-native';
import type { WizardStep } from './types';

interface ProgressDotsProps {
  step: WizardStep;
  total?: number;
}

export const ProgressDots: React.FC<ProgressDotsProps> = ({ step, total = 5 }) => (
  <View className="flex-row mb-8 self-center">
    {Array.from({ length: total }).map((_, index) => (
      <View
        key={index}
        className={`h-2 rounded-full mx-1 ${index === step ? 'bg-primary' : 'bg-muted'}`}
        style={{ width: index === step ? 28 : 8 }}
      />
    ))}
  </View>
);
