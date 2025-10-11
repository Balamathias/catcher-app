import React, { useState } from 'react';
import { View, Text, Modal, Pressable, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemedColors } from '@/hooks/useThemedColors';
import { useDeleteAccount } from '@/services/api-hooks';
import { router } from 'expo-router';

interface AccountDeletionFlowProps {
  visible: boolean;
  onClose: () => void;
}

type DeletionStep = 'warning' | 'confirmation' | 'final';

const AccountDeletionFlow: React.FC<AccountDeletionFlowProps> = ({ visible, onClose }) => {
  const { colors, theme } = useThemedColors();
  const [step, setStep] = useState<DeletionStep>('warning');
  const [confirmText, setConfirmText] = useState('');
  const [reason, setReason] = useState('');
  const deleteAccountMutation = useDeleteAccount();

  const handleClose = () => {
    setStep('warning');
    setConfirmText('');
    setReason('');
    onClose();
  };

  const handleDelete = async () => {
    try {
      const result = await deleteAccountMutation.mutateAsync({ reason });
      if (result.data || result.status === 200) {
        handleClose();
        router.replace('/auth/login');
      }
    } catch (error) {
      console.error('Account deletion error:', error);
    }
  };

  const renderWarningStep = () => (
    <View className="p-6">
      {/* Icon */}
      <View className="items-center mb-4">
        <View className="w-20 h-20 rounded-full bg-red-500/10 items-center justify-center">
          <Ionicons name="warning" size={40} color={colors.destructive || '#ef4444'} />
        </View>
      </View>

      {/* Title */}
      <Text className="text-2xl font-bold text-foreground text-center mb-3">
        Delete Account?
      </Text>

      {/* Warning Message */}
      <Text className="text-sm text-muted-foreground text-center mb-6 leading-5">
        This action is permanent and cannot be undone. Please review what will happen:
      </Text>

      {/* Consequences List */}
      <View className="rounded-2xl bg-red-500/5 border border-red-500/20 p-4 mb-6">
        <View className="gap-y-3">
          {[
            'All your registered items will be permanently deleted',
            'Your ownership records will be removed from the registry',
            'Payment history and credits will be deleted',
            'You will lose access to all app features immediately',
            'This action cannot be reversed or recovered'
          ].map((item, index) => (
            <View key={index} className="flex-row items-start">
              <Ionicons name="close-circle" size={18} color={colors.destructive || '#ef4444'} style={{ marginTop: 2 }} />
              <Text className="text-sm text-foreground ml-2 flex-1 leading-5">
                {item}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Actions */}
      <View className="gap-y-3">
        <Pressable
          onPress={() => setStep('confirmation')}
          className="rounded-xl bg-red-500 py-4 items-center active:opacity-80"
        >
          <Text className="text-base font-semibold text-white">
            I Understand, Continue
          </Text>
        </Pressable>

        <Pressable
          onPress={handleClose}
          className="rounded-xl border border-border/90 py-4 items-center active:opacity-60"
        >
          <Text className="text-base font-medium text-foreground">
            Cancel
          </Text>
        </Pressable>
      </View>
    </View>
  );

  const renderConfirmationStep = () => (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      <View className="p-6">
        {/* Icon */}
        <View className="items-center mb-4">
          <View className="w-16 h-16 rounded-full bg-red-500/10 items-center justify-center">
            <Ionicons name="shield-checkmark" size={28} color={colors.destructive || '#ef4444'} />
          </View>
        </View>

        {/* Title */}
        <Text className="text-xl font-semibold text-foreground text-center mb-2">
          Verify It's You
        </Text>

        <Text className="text-sm text-muted-foreground text-center mb-6 leading-5">
          To confirm this action, please type{' '}
          <Text className="font-bold text-foreground">DELETE</Text> below
        </Text>

        {/* Reason Input */}
        <View className="mb-4">
          <Text className="text-xs uppercase tracking-[1px] text-muted-foreground mb-2">
            Reason for Leaving (Optional)
          </Text>
          <View className="rounded-xl border border-border/90 px-4 py-3 bg-muted/20">
            <TextInput
              value={reason}
              onChangeText={setReason}
              placeholder="Help us improve..."
              placeholderTextColor={colors.mutedForeground}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              className="text-foreground min-h-[60px]"
            />
          </View>
        </View>

        {/* Confirmation Input */}
        <View className="mb-6">
          <Text className="text-xs uppercase tracking-[1px] text-muted-foreground mb-2">
            Type DELETE to Confirm *
          </Text>
          <View className={`rounded-xl border ${confirmText === 'DELETE' ? 'border-red-500' : 'border-border/90'} px-4 py-3`}>
            <TextInput
              value={confirmText}
              onChangeText={setConfirmText}
              placeholder="DELETE"
              placeholderTextColor={colors.mutedForeground}
              autoCapitalize="characters"
              className="text-foreground text-base"
            />
          </View>
        </View>

        {/* Actions */}
        <View className="gap-y-3">
          <Pressable
            onPress={() => setStep('final')}
            disabled={confirmText !== 'DELETE'}
            className={`rounded-xl py-4 items-center ${confirmText === 'DELETE' ? 'bg-red-500' : 'bg-muted/50'}`}
          >
            <Text className={`text-base font-semibold ${confirmText === 'DELETE' ? 'text-white' : 'text-muted-foreground'}`}>
              Continue to Final Step
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setStep('warning')}
            className="rounded-xl border border-border/90 py-4 items-center active:opacity-60"
          >
            <Text className="text-base font-medium text-foreground">
              Go Back
            </Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );

  const renderFinalStep = () => (
    <View className="p-6">
      {/* Icon */}
      <View className="items-center mb-4">
        <View className="w-20 h-20 rounded-full bg-red-500/10 items-center justify-center">
          <Ionicons name="trash" size={36} color={colors.destructive || '#ef4444'} />
        </View>
      </View>

      {/* Title */}
      <Text className="text-2xl font-bold text-foreground text-center mb-3">
        Final Confirmation
      </Text>

      {/* Final Message */}
      <Text className="text-sm text-muted-foreground text-center mb-6 leading-5">
        This is your last chance to cancel. Once you proceed, your account and all associated data will be permanently deleted.
      </Text>

      {/* Final Warning Box */}
      <View className="rounded-2xl bg-red-500/10 border-2 border-red-500/30 p-5 mb-6">
        <View className="flex-row items-center justify-center mb-2">
          <Ionicons name="alert-circle" size={24} color={colors.destructive || '#ef4444'} />
          <Text className="text-lg font-bold text-foreground ml-2">
            No Going Back
          </Text>
        </View>
        <Text className="text-sm text-center text-foreground/80 leading-5">
          Your account will be deleted immediately and cannot be recovered.
        </Text>
      </View>

      {/* Actions */}
      <View className="gap-y-3">
        <Pressable
          onPress={handleDelete}
          disabled={deleteAccountMutation.isPending}
          className="rounded-xl bg-red-600 py-4 items-center active:opacity-80"
        >
          {deleteAccountMutation.isPending ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-base font-bold text-white">
              Delete My Account Permanently
            </Text>
          )}
        </Pressable>

        <Pressable
          onPress={handleClose}
          disabled={deleteAccountMutation.isPending}
          className="rounded-xl border-2 border-primary py-4 items-center active:opacity-60"
        >
          <Text className="text-base font-semibold text-primary">
            Cancel & Keep My Account
          </Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <View>
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={handleClose}
      >
        <View className="flex-1 bg-black/60 items-center justify-center px-6">
          <View className={`${theme} bg-background rounded-3xl w-full max-w-md shadow-2xl max-h-[90%]`}>
            {step === 'warning' && renderWarningStep()}
            {step === 'confirmation' && renderConfirmationStep()}
            {step === 'final' && renderFinalStep()}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default AccountDeletionFlow;
