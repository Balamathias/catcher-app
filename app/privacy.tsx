import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemedColors } from '@/hooks/useThemedColors';
import StackHeader from '@/components/header.stack';

const PrivacyPolicyScreen = () => {
  const { theme, colors } = useThemedColors();

  const Section = ({ title, content }: { title: string; content: string | string[] }) => (
    <View className="mb-6">
      <Text className="text-lg font-semibold text-foreground mb-3">
        {title}
      </Text>
      {Array.isArray(content) ? (
        <View>
          {content.map((paragraph, index) => (
            <Text key={index} className="text-sm text-muted-foreground leading-6 mb-3">
              {paragraph}
            </Text>
          ))}
        </View>
      ) : (
        <Text className="text-sm text-muted-foreground leading-6">
          {content}
        </Text>
      )}
    </View>
  );

  const ListItem = ({ text }: { text: string }) => (
    <View className="flex-row items-start mb-2 ml-4">
      <View className="w-1.5 h-1.5 rounded-full bg-primary mt-2 mr-3" />
      <Text className="text-sm text-muted-foreground leading-6 flex-1">
        {text}
      </Text>
    </View>
  );

  return (
    <SafeAreaView edges={['bottom']} className={`flex-1 ${theme} bg-background`}>
      <StackHeader title="Privacy Policy" />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 py-6">
          {/* Header */}
          <View className="mb-6 rounded-2xl bg-primary/10 border border-primary/20 p-5">
            <View className="flex-row items-center mb-2">
              <Ionicons name="shield-checkmark" size={24} color={colors.primary} />
              <Text className="text-lg font-bold text-foreground ml-2">
                Your Privacy Matters
              </Text>
            </View>
            <Text className="text-sm text-muted-foreground leading-5">
              Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </Text>
          </View>

          {/* Introduction */}
          <Section
            title="Introduction"
            content="Catcher ('we', 'our', or 'us') is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and services."
          />

          {/* Information We Collect */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-foreground mb-3">
              Information We Collect
            </Text>
            <Text className="text-sm text-muted-foreground leading-6 mb-3">
              We collect information that you provide directly to us:
            </Text>
            <ListItem text="Account information (email, name, phone number)" />
            <ListItem text="Item details (serial numbers, descriptions, photos)" />
            <ListItem text="Payment information (processed securely by Paystack)" />
            <ListItem text="Usage data and analytics" />
            <ListItem text="Device information and IP addresses" />
          </View>

          {/* How We Use Your Information */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-foreground mb-3">
              How We Use Your Information
            </Text>
            <ListItem text="To provide, maintain, and improve our services" />
            <ListItem text="To process transactions and send transaction notifications" />
            <ListItem text="To verify item ownership and prevent fraud" />
            <ListItem text="To respond to your requests and provide customer support" />
            <ListItem text="To send you technical notices and security alerts" />
            <ListItem text="To analyze usage patterns and improve user experience" />
          </View>

          {/* Information Sharing */}
          <Section
            title="Information Sharing"
            content={[
              "We do not sell your personal information. We may share your information only in these circumstances:",
              "• With service providers who assist in operating our platform (e.g., payment processors, hosting providers)",
              "• When required by law or to respond to legal processes",
              "• To protect our rights, safety, and the security of our users",
              "• With your explicit consent"
            ]}
          />

          {/* Public Registry */}
          <View className="mb-6 rounded-xl bg-amber-500/10 border border-amber-500/20 px-4 py-4">
            <View className="flex-row items-start">
              <Ionicons name="eye-outline" size={20} color={colors.amber || '#f59e0b'} style={{ marginTop: 2 }} />
              <View className="ml-3 flex-1">
                <Text className="text-sm font-semibold text-foreground mb-1">
                  Public Registry Information
                </Text>
                <Text className="text-xs text-muted-foreground leading-5">
                  Item serial numbers, status, and optional ownership details you provide are publicly searchable in our registry. This is essential for theft prevention and buyer protection.
                </Text>
              </View>
            </View>
          </View>

          {/* Data Security */}
          <Section
            title="Data Security"
            content="We implement industry-standard security measures to protect your personal information, including encryption, secure servers, and regular security audits. However, no method of transmission over the Internet is 100% secure."
          />

          {/* Your Rights */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-foreground mb-3">
              Your Rights
            </Text>
            <ListItem text="Access and review your personal information" />
            <ListItem text="Request correction of inaccurate data" />
            <ListItem text="Request deletion of your account and data" />
            <ListItem text="Opt-out of marketing communications" />
            <ListItem text="Export your data in a portable format" />
          </View>

          {/* Data Retention */}
          <Section
            title="Data Retention"
            content="We retain your information for as long as your account is active or as needed to provide services. If you delete your account, we will delete your personal information, except where we are required to retain it for legal compliance."
          />

          {/* Children's Privacy */}
          <Section
            title="Children's Privacy"
            content="Our service is not intended for users under 13 years of age. We do not knowingly collect personal information from children under 13."
          />

          {/* Changes to This Policy */}
          <Section
            title="Changes to This Policy"
            content="We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy in the app and updating the 'Last updated' date."
          />

          {/* Contact Us */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-foreground mb-3">
              Contact Us
            </Text>
            <Text className="text-sm text-muted-foreground leading-6 mb-3">
              If you have questions about this Privacy Policy, please contact us:
            </Text>
            <View className="rounded-xl border border-border/90 px-4 py-3 bg-muted/20">
              <Text className="text-sm text-foreground mb-1">Email: support@catcher.com.ng</Text>
              <Text className="text-sm text-foreground">Website: www.catcher.com.ng</Text>
            </View>
          </View>

          {/* Footer */}
          <View className="rounded-xl bg-blue-500/10 border border-blue-500/20 px-4 py-4 mb-4">
            <Text className="text-xs text-center text-foreground/80 leading-5">
              By using Catcher, you acknowledge that you have read and understood this Privacy Policy.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PrivacyPolicyScreen;
