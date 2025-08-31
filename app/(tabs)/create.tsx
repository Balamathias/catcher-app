import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemedColors } from '@/hooks/useThemedColors';
import RegisterItemWizard from '@/components/item/RegisterItemWizard';

const CreateItemScreen = () => {
  const { theme } = useThemedColors();
  return (
    <SafeAreaView className={`flex-1 ${theme} bg-background`}>
      <RegisterItemWizard />
    </SafeAreaView>
  );
};

export default CreateItemScreen;
