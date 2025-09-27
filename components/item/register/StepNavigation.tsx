import React from 'react';
import { View, Pressable, Text } from 'react-native';
import type { WizardStep } from './types';

interface StepNavigationProps {
  step: WizardStep;
  canProceed: boolean;
  submitting: boolean;
  onBack: () => void;
  onNext: () => void;
}

export const StepNavigation: React.FC<StepNavigationProps> = ({ step, canProceed, submitting, onBack, onNext }) => (
  <View className="flex-row mt-12 mb-2 items-center">
    <Pressable
      disabled={step === 0 || submitting}
      onPress={onBack}
      className={`px-4 py-3 rounded-xl border border-border ${(step === 0 || submitting) ? 'opacity-40' : 'active:bg-muted/60'}`}
    >
      <Text className="text-sm text-foreground">Back</Text>
    </Pressable>

    {step < 4 && (
      <Pressable
        disabled={!canProceed || submitting}
        onPress={onNext}
        className={`flex-1 ml-4 py-4 rounded-xl items-center ${(!canProceed || submitting) ? 'bg-muted' : 'bg-primary shadow-lg'}`}
      >
        <Text className={`text-base font-semibold ${(!canProceed || submitting) ? 'text-muted-foreground' : 'text-primary-foreground'}`}>
          Next
        </Text>
      </Pressable>
    )}
  </View>
);
