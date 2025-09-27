import React, { useEffect, useRef, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { useThemedColors } from '@/hooks/useThemedColors';

export type PaystackSheetProps = {
  visible: boolean;
  authorizationUrl?: string;
  onClose: () => void;
  onCompleted?: (url: string) => void;
};

export const PaystackSheet: React.FC<PaystackSheetProps> = ({ visible, authorizationUrl, onClose, onCompleted }) => {
  const { colors } = useThemedColors();
  const [loading, setLoading] = useState(true);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-background">
        <View className="h-14 flex-row items-center justify-between px-4 border-b border-border/50 bg-card">
          <Text className="text-foreground font-semibold">Pay with Paystack</Text>
          <TouchableOpacity onPress={onClose}>
            <Text className="text-primary">Close</Text>
          </TouchableOpacity>
        </View>
        {!authorizationUrl ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : (
          <WebView
            source={{ uri: authorizationUrl }}
            onLoadEnd={() => setLoading(false)}
            onNavigationStateChange={(navState) => {
              // Allow parent to inspect final redirect URL if callback_url is set server-side
              if (onCompleted) {
                onCompleted(navState.url);
              }
            }}
            startInLoadingState
          />
        )}
      </View>
    </Modal>
  );
};
