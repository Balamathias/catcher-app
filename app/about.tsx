import React from 'react';
import { View, Text, ScrollView, Pressable, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemedColors } from '@/hooks/useThemedColors';
import StackHeader from '@/components/header.stack';

const AboutScreen = () => {
  const { theme, colors } = useThemedColors();

  const InfoSection = ({ icon, title, content }: { icon: keyof typeof Ionicons.glyphMap; title: string; content: string }) => (
    <View className="mb-6">
      <View className="flex-row items-center mb-3">
        <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center mr-3">
          <Ionicons name={icon} size={20} color={colors.primary} />
        </View>
        <Text className="text-lg font-semibold text-foreground">
          {title}
        </Text>
      </View>
      <Text className="text-sm text-muted-foreground leading-6 pl-[52px]">
        {content}
      </Text>
    </View>
  );

  const ContactItem = ({ icon, label, value, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string; onPress?: () => void }) => (
    <Pressable
      onPress={onPress}
      className="flex-row items-center py-3 border-b border-border/30 active:opacity-60"
    >
      <Ionicons name={icon} size={20} color={colors.primary} />
      <View className="ml-3 flex-1">
        <Text className="text-xs text-muted-foreground">{label}</Text>
        <Text className="text-sm font-medium text-foreground mt-0.5">{value}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} />
    </Pressable>
  );

  return (
    <SafeAreaView edges={['bottom']} className={`flex-1 ${theme} bg-background`}>
      <StackHeader title="About Catcher" />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 py-6">
          {/* App Logo/Header */}
          <View className="items-center mb-8">
            <View className="w-24 h-24 rounded-3xl bg-primary/10 items-center justify-center mb-4">
              <Ionicons name="shield-checkmark" size={56} color={colors.primary} />
            </View>
            <Text className="text-3xl font-bold text-primary mb-2">
              Catcher
            </Text>
            <Text className="text-base text-muted-foreground mb-1">
              Protects What Matters Most
            </Text>
            <Text className="text-sm text-muted-foreground">
              Choose To Be Safe
            </Text>
            <View className="mt-3 px-4 py-1.5 rounded-full bg-muted/50">
              <Text className="text-xs text-muted-foreground">
                Version 1.0.0
              </Text>
            </View>
          </View>

          {/* Mission */}
          <InfoSection
            icon="rocket-outline"
            title="Our Mission"
            content="Catcher provides a trusted, global registry for valuables. We help you register, verify, and protect your belongings while creating transparency that deters theft and fraud."
          />

          {/* How It Works */}
          <InfoSection
            icon="bulb-outline"
            title="How It Works"
            content="Register your items with unique serial numbers to create an ownership record. Search the registry before purchasing to verify an item's status. Mark items as stolen to broadcast warnings publicly."
          />

          {/* Why Choose Us */}
          <InfoSection
            icon="star-outline"
            title="Why Choose Catcher"
            content="Fast, transparent, and secure. Our platform shrinks the market for stolen goods by making it easy for buyers to verify ownership and for victims to alert the community."
          />

          {/* Contact Information */}
          <View className="mt-4 mb-6">
            <Text className="text-lg font-semibold text-foreground mb-4">
              Get In Touch
            </Text>
            <View className="rounded-2xl border border-border/90 px-4 py-2 bg-muted/20">
              <ContactItem
                icon="mail-outline"
                label="Email Support"
                value="support@catcher.com.ng"
                onPress={() => Linking.openURL('mailto:support@catcher.com.ng')}
              />
              <ContactItem
                icon="globe-outline"
                label="Website"
                value="www.catcher.com.ng"
                onPress={() => Linking.openURL('https://www.catcher.com.ng')}
              />
              <ContactItem
                icon="logo-instagram"
                label="Instagram"
                value="@catchertechglobal"
                onPress={() => Linking.openURL('https://www.instagram.com/catchertechglobal')}
              />
            </View>
          </View>

          {/* Legal */}
          <View className="rounded-xl bg-blue-500/10 border border-blue-500/20 px-4 py-4">
            <View className="flex-row items-start">
              <Ionicons name="shield-outline" size={20} color={colors.primary} style={{ marginTop: 2 }} />
              <View className="ml-3 flex-1">
                <Text className="text-sm font-semibold text-foreground mb-1">
                  Privacy & Security
                </Text>
                <Text className="text-xs text-muted-foreground leading-5">
                  We take your privacy seriously. Your data is encrypted and protected according to industry standards.
                </Text>
              </View>
            </View>
          </View>

          {/* Copyright */}
          <Text className="text-xs text-center text-muted-foreground mt-8 mb-4">
            © {new Date().getFullYear()} Catcher. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AboutScreen;
