import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import StackHeader from '@/components/header.stack';
import { useThemedColors } from '@/hooks/useThemedColors';
import ProfileView from '@/components/settings/ProfileView';
import LogoutModal from '@/components/settings/LogoutModal';
import AccountDeletionFlow from '@/components/settings/AccountDeletionFlow';

type SettingsSection = 'menu' | 'profile';

const SettingsScreen = () => {
  const { theme, colors } = useThemedColors();
  const [activeSection, setActiveSection] = useState<SettingsSection>('menu');
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const MenuItem = ({
    icon,
    label,
    description,
    onPress,
    danger,
    showChevron = true,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    description?: string;
    onPress: () => void;
    danger?: boolean;
    showChevron?: boolean;
  }) => (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center py-4 px-5 border-b border-border/30 active:bg-muted/30 ${danger ? 'bg-red-500/5' : 'bg-background'
        }`}
    >
      <View
        className={`w-10 h-10 rounded-full ${danger ? 'bg-red-500/10' : 'bg-primary/10'
          } items-center justify-center mr-4`}
      >
        <Ionicons
          name={icon}
          size={20}
          color={danger ? (colors.destructive || '#ef4444') : colors.primary}
        />
      </View>
      <View className="flex-1">
        <Text className={`text-base font-medium ${danger ? 'text-red-600' : 'text-foreground'}`}>
          {label}
        </Text>
        {description && (
          <Text className="text-xs text-muted-foreground mt-0.5">{description}</Text>
        )}
      </View>
      {showChevron && (
        <Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} />
      )}
    </Pressable>
  );

  const SectionHeader = ({ title }: { title: string }) => (
    <View className="px-5 py-3 bg-muted/30">
      <Text className="text-xs uppercase tracking-[1.5px] text-muted-foreground font-medium">
        {title}
      </Text>
    </View>
  );

  if (activeSection === 'profile') {
    return (
      <SafeAreaView edges={['bottom']} className={`flex-1 ${theme} bg-background`}>
        <StackHeader
          title="My Profile"
          onBackPress={() => setActiveSection('menu')}
        />
        <ProfileView />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['bottom']} className={`flex-1 ${theme} bg-background`}>
      <StackHeader title="Settings" />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Account Section */}
        <SectionHeader title="Account" />
        <View className="rounded-2xl overflow-hidden mx-4 my-3 border border-border/50">
          <MenuItem
            icon="person-outline"
            label="My Profile"
            description="View your account information"
            onPress={() => setActiveSection('profile')}
          />
          <MenuItem
            icon="notifications-outline"
            label="Notifications"
            description="Manage notification preferences"
            onPress={() => {
              // TODO: Navigate to notifications settings
            }}
          />
        </View>

        {/* App Information */}
        <SectionHeader title="Information" />
        <View className="rounded-2xl overflow-hidden mx-4 my-3 border border-border/50">
          <MenuItem
            icon="information-circle-outline"
            label="About Catcher"
            description="Learn more about our app"
            onPress={() => router.push('/about')}
          />
          <MenuItem
            icon="shield-outline"
            label="Privacy Policy"
            description="How we protect your data"
            onPress={() => router.push('/privacy')}
          />
          <MenuItem
            icon="help-circle-outline"
            label="Help & Support"
            description="Get assistance and FAQs"
            onPress={() => {
              // TODO: Navigate to help center
            }}
          />
        </View>

        {/* Actions Section */}
        <SectionHeader title="Actions" />
        <View className="rounded-2xl overflow-hidden mx-4 my-3 border border-border/50">
          <MenuItem
            icon="log-out-outline"
            label="Log Out"
            description="Sign out of your account"
            onPress={() => setLogoutModalVisible(true)}
            showChevron={false}
          />
          <MenuItem
            icon="trash-outline"
            label="Delete Account"
            description="Permanently remove your account"
            onPress={() => setDeleteModalVisible(true)}
            danger
            showChevron={false}
          />
        </View>

        {/* App Version */}
        <View className="px-5 py-6 items-center">
          <View className="w-16 h-16 rounded-2xl bg-primary/10 items-center justify-center mb-3">
            <Ionicons name="shield-checkmark" size={32} color={colors.primary} />
          </View>
          <Text className="text-lg font-semibold text-foreground mb-1">Catcher</Text>
          <Text className="text-xs text-muted-foreground mb-1">Version 1.0.0</Text>
          <Text className="text-xs text-muted-foreground text-center leading-5 px-8">
            Protects What Matters Most
          </Text>
        </View>
      </ScrollView>

      {/* Modals */}
      <LogoutModal
        visible={logoutModalVisible}
        onClose={() => setLogoutModalVisible(false)}
      />
      <AccountDeletionFlow
        visible={deleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
      />
    </SafeAreaView>
  );
};

export default SettingsScreen;
