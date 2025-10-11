import React, { useState } from 'react';
import { View, Text, Modal, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemedColors } from '@/hooks/useThemedColors';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';

interface LogoutModalProps {
  visible: boolean;
  onClose: () => void;
}

const LogoutModal: React.FC<LogoutModalProps> = ({ visible, onClose }) => {
  const { colors, theme } = useThemedColors();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await supabase.auth.signOut();
      onClose();
      // Navigation will be handled by the session context
      router.replace('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 items-center justify-center px-6">
        <View className={`${theme} bg-background rounded-3xl p-6 w-full max-w-sm shadow-2xl`}>
          {/* Icon */}
          <View className="items-center mb-4">
            <View className="w-16 h-16 rounded-full bg-amber-500/10 items-center justify-center">
              <Ionicons name="log-out-outline" size={32} color={'#f59e0b'} />
            </View>
          </View>

          {/* Title */}
          <Text className="text-xl font-semibold text-foreground text-center mb-2">
            Log Out
          </Text>

          {/* Message */}
          <Text className="text-sm text-muted-foreground text-center mb-6 leading-5">
            Are you sure you want to log out? You'll need to sign in again to access your items and registry.
          </Text>

          {/* Actions */}
          <View className="gap-y-3">
            <Pressable
              onPress={handleLogout}
              disabled={isLoggingOut}
              className="rounded-xl bg-amber-500 py-4 items-center active:opacity-80"
            >
              {isLoggingOut ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-base font-semibold text-white">
                  Yes, Log Out
                </Text>
              )}
            </Pressable>

            <Pressable
              onPress={onClose}
              disabled={isLoggingOut}
              className="rounded-xl border border-border/90 py-4 items-center active:opacity-60"
            >
              <Text className="text-base font-medium text-foreground">
                Cancel
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default LogoutModal;
