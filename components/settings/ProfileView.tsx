import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useGetUserProfile, useUpdateProfile } from '@/services/api-hooks';
import { useSession } from '@/contexts/session-context';
import { useThemedColors } from '@/hooks/useThemedColors';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { uploadLocalImage } from '@/components/item/register/storage';
import type { Img } from '@/components/item/register/types';
import { supabase } from '@/lib/supabase';

const ProfileView = () => {
  const { colors } = useThemedColors();
  const { user } = useSession();
  const { data: profileData, isLoading } = useGetUserProfile();
  const { mutateAsync: updateProfile, isPending: isSaving } = useUpdateProfile();

  const [displayName, setDisplayName] = useState<string>('');
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState<boolean>(false);

  useEffect(() => {
    const p = profileData?.data;
    setDisplayName(p?.display_name || '');
    setAvatarUrl(p?.avatar_url || '');
    setPhone((user?.user_metadata as any)?.phone || (user as any)?.phone || '');
  }, [profileData?.data?.display_name, profileData?.data?.avatar_url, user?.user_metadata, user?.phone]);

  const pickAvatarFromGallery = async () => {
    try {
      // Request permissions on iOS; on Android it's handled by the library
      await ImagePicker.requestMediaLibraryPermissionsAsync();
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
        base64: true,
      });
      if (result.canceled) return;
      const asset = result.assets?.[0];
      if (!asset) return;
      setIsUploadingAvatar(true);
      const img: Img = {
        id: 'avatar',
        kind: 'file',
        uri: asset.uri,
        filename: (asset as any).fileName || null,
        base64: (asset as any).base64 || null,
      };
      const remoteUrl = await uploadLocalImage(img);
      setAvatarUrl(remoteUrl);
      Alert.alert('Avatar selected', 'Tap Save changes to update your profile.');
    } catch (e: any) {
      Alert.alert('Avatar selection failed', e?.message || 'Please try again');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

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
          <View className="w-24 h-24 rounded-full bg-primary/10 items-center justify-center mb-3 overflow-hidden">
            {avatarUrl ? (
              <Image
                source={{ uri: avatarUrl }}
                style={{ width: 96, height: 96, borderRadius: 48 }}
                contentFit="cover"
                transition={200}
              />
            ) : (
              <Ionicons name="person" size={48} color={colors.primary} />
            )}
          </View>
          <TouchableOpacity
            onPress={pickAvatarFromGallery}
            disabled={isUploadingAvatar}
            className={`px-3 py-1.5 rounded-full border ${isUploadingAvatar ? 'bg-muted/40' : 'bg-muted/20'}`}
          >
            <View className="flex-row items-center">
              {isUploadingAvatar && <ActivityIndicator size="small" color={colors.primary} />}
              <Text className={`text-xs ml-2 ${isUploadingAvatar ? 'text-muted-foreground' : 'text-foreground'}`}>
                {isUploadingAvatar ? 'Uploading…' : 'Change avatar'}
              </Text>
            </View>
          </TouchableOpacity>
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

          {/* Editable Name */}
          <View className="mb-4">
            <View className="flex-row items-center mb-2">
              <Ionicons name="person-outline" size={16} color={colors.mutedForeground} />
              <Text className="text-xs uppercase tracking-[1px] text-muted-foreground ml-2">
                Name
              </Text>
            </View>
            <View className="rounded-xl border border-border/90 px-4 py-2 bg-muted/10">
              <TextInput
                className="text-[15px] text-foreground"
                placeholder="Your name"
                placeholderTextColor={colors.mutedForeground}
                value={displayName}
                onChangeText={setDisplayName}
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* Avatar note */}
          {!!avatarUrl && (
            <View className="mb-4">
              <View className="flex-row items-center mb-2">
                <Ionicons name="image-outline" size={16} color={colors.mutedForeground} />
                <Text className="text-xs uppercase tracking-[1px] text-muted-foreground ml-2">
                  Avatar
                </Text>
              </View>
              <View className="rounded-xl border border-border/90 px-4 py-2 bg-muted/10">
                <Text className="text-[13px] text-muted-foreground">
                  Image stored securely. You can change it anytime.
                </Text>
              </View>
            </View>
          )}

          {/* Save button */}
          <TouchableOpacity
            disabled={isSaving}
            onPress={async () => {
              try {
                const payload: any = {};
                if (displayName !== (profile?.display_name || '')) payload.display_name = displayName.trim();
                if (avatarUrl !== (profile?.avatar_url || '')) payload.avatar_url = avatarUrl.trim();
                const phoneChanged = phone !== ((user?.user_metadata as any)?.phone || (user as any)?.phone || '');
                if (Object.keys(payload).length === 0) {
                  if (!phoneChanged) {
                    Alert.alert('Nothing to update', 'Your profile is already up to date.');
                    return;
                  }
                }
                // Perform updates
                // 1) Update profile table if needed
                if (Object.keys(payload).length > 0) {
                  const res = await updateProfile(payload);
                  if (res?.error) {
                    const err = res.error as any;
                    const msg = typeof err === 'string' ? err : (Array.isArray(err) ? 'Please try again' : (err?.message || 'Please try again'));
                    Alert.alert('Profile update failed', msg);
                    return;
                  }
                }
                // 2) Update phone in auth metadata if changed
                if (phoneChanged) {
                  const { error } = await supabase.auth.updateUser({ data: { phone: phone.trim() } });
                  if (error) {
                    Alert.alert('Phone update failed', error.message || 'Please try again');
                    return;
                  }
                }
                Alert.alert('Profile updated');
              } catch (e: any) {
                Alert.alert('Update failed', e?.message || 'Please try again');
              }
            }}
            className={`mt-1 rounded-xl px-4 py-3 ${isSaving ? 'bg-primary/50' : 'bg-primary'}`}
          >
            <View className="flex-row items-center justify-center">
              {isSaving && <ActivityIndicator size="small" color="#fff" />}
              <Text className={`text-white font-medium ${isSaving ? 'ml-2' : ''}`}>
                {isSaving ? 'Saving...' : 'Save changes'}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Editable Phone */}
          <View className="mb-4">
            <View className="flex-row items-center mb-2">
              <Ionicons name="call-outline" size={16} color={colors.mutedForeground} />
              <Text className="text-xs uppercase tracking-[1px] text-muted-foreground ml-2">
                Phone Number
              </Text>
            </View>
            <View className="rounded-xl border border-border/90 px-4 py-2 bg-muted/10">
              <TextInput
                className="text-[15px] text-foreground"
                placeholder="e.g. +2348000000000"
                placeholderTextColor={colors.mutedForeground}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                autoCapitalize="none"
              />
            </View>
          </View>
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
            You can edit your display name, avatar, and phone here. Email updates are managed by your account provider.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default ProfileView;
