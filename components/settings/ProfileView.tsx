import React from 'react';
import { View, Text, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useGetUserProfile } from '@/services/api-hooks';
import { useSession } from '@/contexts/session-context';
import { useThemedColors } from '@/hooks/useThemedColors';

const ProfileView = () => {
  const { colors } = useThemedColors();
  const { user } = useSession();
  const { data: profileData, isLoading } = useGetUserProfile();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center py-12">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text className="text-sm text-muted-foreground mt-4">Loading profile...</Text>
      </View>
    );
  }

  const profile = profileData?.data;

  const ProfileField = ({
    icon,
    label,
    value
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    value?: string | null;
  }) => (
    <View className="mb-4">
      <View className="flex-row items-center mb-2">
        <Ionicons name={icon} size={16} color={colors.mutedForeground} />
        <Text className="text-xs uppercase tracking-[1px] text-muted-foreground ml-2">
          {label}
        </Text>
      </View>
      <View className="rounded-xl border border-border/90 px-4 py-3 bg-muted/20">
        <Text className="text-[15px] text-foreground">
          {value || 'Not provided'}
        </Text>
      </View>
    </View>
  );

  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      <View className="px-6 py-6">
        {/* Profile Header */}
        <View className="items-center mb-8">
          <View className="w-24 h-24 rounded-full bg-primary/10 items-center justify-center mb-4">
            <Ionicons name="person" size={48} color={colors.primary} />
          </View>
          <Text className="text-2xl font-semibold text-foreground mb-1">
            {profile?.display_name || user?.email?.split('@')[0] || 'User'}
          </Text>
          <Text className="text-sm text-muted-foreground">
            Member since {new Date(user?.created_at || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </Text>
        </View>

        {/* Profile Fields */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-foreground mb-4">
            Account Information
          </Text>

          <ProfileField
            icon="mail-outline"
            label="Email Address"
            value={user?.email}
          />

          <ProfileField
            icon="person-outline"
            label="Name"
            value={profile?.display_name || user?.user_metadata?.full_name || user?.user_metadata?.display_name}
          />

          <ProfileField
            icon="call-outline"
            label="Phone Number"
            value={user?.user_metadata?.phone || user?.phone}
          />
        </View>

        {/* Account Details */}
        <View className="rounded-2xl bg-muted/30 px-4 py-4 mb-4">
          <Text className="text-xs uppercase tracking-[1.5px] text-muted-foreground mb-3">
            Account Details
          </Text>
          <View className="space-y-2">
            <View className="flex-row justify-between py-2">
              <Text className="text-sm text-muted-foreground">User ID</Text>
              <Text className="text-sm font-medium text-foreground">
                {user?.id?.substring(0, 8)}...
              </Text>
            </View>
            <View className="border-t border-border/30" />
            <View className="flex-row justify-between py-2">
              <Text className="text-sm text-muted-foreground">Email Verified</Text>
              <View className="flex-row items-center">
                <Ionicons
                  name={user?.email_confirmed_at ? "checkmark-circle" : "close-circle"}
                  size={16}
                  color={user?.email_confirmed_at ? "#4ade80" : colors.mutedForeground}
                />
                <Text className={`text-sm font-medium ml-1 ${user?.email_confirmed_at ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                  {user?.email_confirmed_at ? 'Yes' : 'No'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Info Note */}
        <View className="rounded-xl bg-blue-500/10 border border-blue-500/20 px-4 py-3 flex-row">
          <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
          <Text className="text-xs text-foreground/80 ml-2 flex-1">
            To update your profile information, please contact support or update from your account settings.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default ProfileView;
