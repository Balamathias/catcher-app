import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemedColors } from '@/hooks/useThemedColors';

const SectionTitle: React.FC<{ icon: keyof typeof Ionicons.glyphMap; title: string; }>=({icon,title})=> {
  const { colors } = useThemedColors();
  return (
    <View className="flex-row items-center mb-4">
        <View className="w-9 h-9 rounded-full bg-primary/10 items-center justify-center mr-3">
            <Ionicons name={icon} size={16} className="text-primary" color={colors.mutedForeground} />
        </View>
        <Text className="text-xl font-semibold tracking-tight text-foreground">{title}</Text>
    </View>
    );
}

const Card: React.FC<{children: React.ReactNode; className?: string;}> = ({children,className=''}) => (
  <View className={`rounded-xl border border-border bg-card p-4 mb-4 ${className}`}>{children}</View>
);

const Bullet: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <View className="flex-row mb-2">
    <Text className="text-primary mr-2">•</Text>
    <Text className="flex-1 text-sm text-muted-foreground leading-5">{children}</Text>
  </View>
);

const InfoScreen: React.FC = () => {
  const { theme } = useThemedColors();

  return (
    <SafeAreaView className={`flex-1 ${theme} bg-background`}>
      <View className="flex-row items-center justify-between px-5 pt-2 pb-3 border-b border-border/60">
        <Pressable accessibilityRole="button" onPress={() => router.back()} className="px-3 py-2 -ml-2 rounded-lg active:bg-muted/60">
          <Ionicons name="chevron-back" size={22} color="#888" />
        </Pressable>
        <Text className="text-base font-medium text-muted-foreground">Learn More</Text>
        <Pressable accessibilityRole="button" onPress={() => router.replace('/auth/login')} className="px-3 py-2 rounded-lg active:bg-muted/60">
          <Text className="text-xs font-medium text-primary">Login</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40, paddingTop: 16 }} showsVerticalScrollIndicator={false}>
        {/* How It Works */}
        <SectionTitle icon="construct-outline" title="How It Works" />
        <Card>
          <Text className="text-base font-semibold text-foreground mb-1">Register Your Items</Text>
          <Text className="text-sm text-muted-foreground leading-5">Add your valuable items with serial numbers to create a secure record in our registry.</Text>
        </Card>
        <Card>
          <Text className="text-base font-semibold text-foreground mb-1">Mark if Stolen</Text>
          <Text className="text-sm text-muted-foreground leading-5">Should the worst happen, easily update your item's status to notify potential buyers.</Text>
        </Card>
        <Card className="mb-6">
          <Text className="text-base font-semibold text-foreground mb-1">Verify Before Buying</Text>
            <Text className="text-sm text-muted-foreground leading-5">Potential buyers can check serial numbers against our registry before purchasing.</Text>
        </Card>

        {/* Status */}
        <SectionTitle icon="information-circle-outline" title="Understanding Item Status" />
        <Card>
          <View className="flex-row items-center mb-1">
            <View className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2" />
            <Text className="text-sm font-semibold text-foreground">Not Stolen</Text>
          </View>
          <Text className="text-sm text-muted-foreground leading-5">The item is registered and has not been reported stolen.</Text>
        </Card>
        <Card>
          <View className="flex-row items-center mb-1">
            <View className="w-2.5 h-2.5 rounded-full bg-rose-500 mr-2" />
            <Text className="text-sm font-semibold text-foreground">Stolen</Text>
          </View>
          <Text className="text-sm text-muted-foreground leading-5">The item has been reported as stolen by its registered owner.</Text>
        </Card>
        <Card className="mb-6">
          <View className="flex-row items-center mb-1">
            <View className="w-2.5 h-2.5 rounded-full bg-amber-500 mr-2" />
            <Text className="text-sm font-semibold text-foreground">Unknown</Text>
          </View>
          <Text className="text-sm text-muted-foreground leading-5">The item is not found in our registry or status cannot be determined.</Text>
        </Card>

        {/* Pricing */}
        <SectionTitle icon="pricetags-outline" title="Simple, Transparent Pricing" />
        <Text className="text-sm text-muted-foreground mb-4 leading-5">Choose the plan that works best for you. Secure your items with our affordable registry service.</Text>

        <View className="mb-5">
          <View className="absolute -top-2 left-4 bg-primary/90 px-2 py-1 rounded-full z-10 shadow-sm">
            <Text className="text-[10px] font-semibold text-primary-foreground uppercase">Popular</Text>
          </View>
          <Card className="pt-6">
            <Text className="text-lg font-semibold text-foreground mb-1">Individual Plan</Text>
            <Text className="text-xs uppercase tracking-wide text-muted-foreground mb-3">Perfect for personal use and small collections</Text>
            <Text className="text-2xl font-bold text-foreground mb-1">₦5,000<Text className="text-xs font-medium text-muted-foreground"> per item</Text></Text>
            <View className="mt-3 mb-4">
              <Bullet>Secure item registration</Bullet>
              <Bullet>Real-time status updates</Bullet>
              <Bullet>Public registry verification</Bullet>
              <Bullet>Theft reporting system</Bullet>
              <Bullet>24/7 registry access</Bullet>
            </View>
            <Pressable onPress={()=>router.replace('/auth/register')} className="w-full rounded-lg bg-primary py-3 items-center">
              <Text className="text-sm font-semibold text-primary-foreground">Get Started</Text>
            </Pressable>
          </Card>
        </View>

        <Card>
          <Text className="text-lg font-semibold text-foreground mb-1">Corporate Plan</Text>
          <Text className="text-xs uppercase tracking-wide text-muted-foreground mb-3">Tailored solutions for businesses and organizations</Text>
          <Text className="text-2xl font-bold text-foreground mb-1">Custom<Text className="text-xs font-medium text-muted-foreground"> pricing</Text></Text>
          <View className="mt-3 mb-4">
            <Bullet>Everything in Individual Plan</Bullet>
            <Bullet>Bulk item registration</Bullet>
            <Bullet>Advanced analytics & reporting</Bullet>
            <Bullet>API access & integrations</Bullet>
            <Bullet>Dedicated account manager</Bullet>
            <Bullet>Priority support</Bullet>
          </View>
          <Pressable onPress={()=>router.replace('/auth/register?plan=corporate')} className="w-full rounded-lg border border-muted py-3 items-center">
            <Text className="text-sm font-semibold text-primary">Contact Us</Text>
          </Pressable>
        </Card>

        <View className="mt-10 mb-6 items-center">
          <Pressable onPress={()=>router.replace('/auth/login')} className="px-5 py-2 rounded-lg bg-muted">
            <Text className="text-xs font-medium text-muted-foreground">Already have an account? Login</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default InfoScreen;
