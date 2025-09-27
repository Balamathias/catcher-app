import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemedColors } from '@/hooks/useThemedColors';
import RegisterItemWizard from '@/components/item/RegisterItemWizard';
import StackHeader from '@/components/header.stack';

const CreateItemScreen = () => {
  const { theme } = useThemedColors();
  return (
    <SafeAreaView className={`flex-1 ${theme} bg-background`} edges={['bottom']}>
      <StackHeader title="Register Item" />
      <RegisterItemWizard />
    </SafeAreaView>
  );
};

export default CreateItemScreen;
