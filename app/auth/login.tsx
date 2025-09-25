import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, Keyboard, ActivityIndicator } from 'react-native'
import React, { useState, useEffect } from 'react'
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring, 
  withDelay,
  withSequence,
  withRepeat,
  Easing,
} from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useColorScheme } from '@/hooks/useColorScheme'
import { useThemedColors } from '@/hooks/useThemedColors'
import { router } from 'expo-router'
import { useOAuth, useSignIn } from '@/services/auth-hooks'

interface LoginFormData {
  email: string
  password: string
}

const Login = () => {
  const colorScheme = useColorScheme()
  
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Partial<LoginFormData>>({})
  const [authError, setAuthError] = useState<string | null>(null)

  const { theme, colors } = useThemedColors()
  const { mutateAsync: signIn, isPending, error: signInError } = useSignIn()
  const { mutateAsync: performOAuthSignIn, isPending: isOAuthPending, error: oauthError } = useOAuth()

  const fadeIn = useSharedValue(0)
  const slideUp = useSharedValue(50)
  const logoScale = useSharedValue(0.8)
  const formScale = useSharedValue(0.95)
  const shake = useSharedValue(0)
  const spinner = useSharedValue(0)

  useEffect(() => {
    fadeIn.value = withTiming(1, { duration: 800 })
    slideUp.value = withTiming(0, { duration: 600 })
    logoScale.value = withDelay(200, withSpring(1, { damping: 15, stiffness: 200 }))
    formScale.value = withDelay(400, withSpring(1, { damping: 12, stiffness: 150 }))
  }, [])

  const containerStyle = useAnimatedStyle(() => ({
    opacity: fadeIn.value,
    transform: [{ translateY: slideUp.value }]
  }))

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }]
  }))

  const formStyle = useAnimatedStyle(() => ({
    transform: [{ scale: formScale.value }]
  }))

  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
    if (authError) {
      setAuthError(null)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginFormData> = {}

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const triggerShake = () => {
    shake.value = 0
    shake.value = withSequence(
      withTiming(-6, { duration: 50 }),
      withTiming(6, { duration: 50 }),
      withTiming(-4, { duration: 40 }),
      withTiming(4, { duration: 40 }),
      withTiming(0, { duration: 40 })
    )
  }

  const handleLogin = async () => {
    if (!validateForm()) {
      triggerShake()
      return
    }

    try {
      const payload = { ...formData, email: formData.email.trim().toLowerCase() }
      setAuthError(null)
      await signIn(payload)
      router.push('/(tabs)/home')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to sign in right now. Please try again.'
      setAuthError(message)
      triggerShake()
      console.error('Login failed:', error)
    } finally {
      // spinner will stop via effect
    }
  }

  const handleOAuthLogin = async () => {
    try {
      setAuthError(null)
      await performOAuthSignIn()
      router.push('/(tabs)/home')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to continue with Google right now. Please try again.'
      setAuthError(message)
      triggerShake()
      console.error('OAuth login failed:', error)
    }
  }

  const inputAnimatedStyle = (hasError: boolean) => useAnimatedStyle(() => ({
    borderWidth: withTiming(hasError ? 2 : 1, { duration: 200 })
  }))

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value }]
  }))

  const spinnerStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spinner.value}deg` }]
  }))

  useEffect(() => {
    if (isPending || isOAuthPending) {
      spinner.value = withRepeat(withTiming(360, { duration: 900, easing: Easing.linear }), -1, false)
    } else {
      spinner.value = 0
    }
  }, [isPending, isOAuthPending])

  useEffect(() => {
    if (signInError) {
      const message = signInError instanceof Error ? signInError.message : 'Unable to sign in right now. Please try again.'
      setAuthError(message)
    }
  }, [signInError])

  useEffect(() => {
    if (oauthError) {
      const message = oauthError instanceof Error ? oauthError.message : 'Unable to continue with Google right now. Please try again.'
      setAuthError(message)
    }
  }, [oauthError])

  return (
    <SafeAreaView className={`flex-1 ${theme} bg-background`}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ScrollView className="flex-1 bg-background" contentContainerClassName=' justify-center flex min-h-[98vh]'>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 mt-10"
          >
            <Animated.View 
              style={[containerStyle, shakeStyle]}
              className="flex-1 px-6 justify-center"
            >
            {/* Logo Section */}
            <Animated.View style={[logoStyle]} className="items-center mb-12">
              <View className="w-20 h-20 rounded-full justify-center items-center mb-6 shadow-xl border border-border/90">
                <Ionicons name="person-outline" color={colors.mutedForeground} size={40} />
              </View>
              <Text className="text-4xl font-bold text-foreground mb-2 tracking-tight">
                Welcome Back
              </Text>
              <Text className="text-base text-muted-foreground text-center leading-6 px-2">
                Secure your items & verify before you buy.
              </Text>
            </Animated.View>

            {/* Form Section */}
            <Animated.View style={formStyle}>
              {/* Email Input */}
              <View className="mb-5">
                <Text className="text-sm font-semibold text-foreground mb-2">
                  Email
                </Text>
                <Animated.View 
                  style={[inputAnimatedStyle(!!errors.email)]}
                  className={`rounded-xl flex-row items-center px-4 py-2.5 border ${
                    errors.email ? 'border-destructive/90' : 'border-border'
                  }`}
                >
                  <Ionicons name="mail-outline" size={20} color={colors.mutedForeground} />
                  <TextInput
                    value={formData.email}
                    onChangeText={(text) => handleInputChange('email', text)}
                    placeholder="Enter your email"
                    placeholderTextColor={colors.mutedForeground}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    className="flex-1 text-base text-foreground"
                  />
                </Animated.View>
                {errors.email && (
                  <Text className="text-xs text-destructive/60 mt-1 ml-1">
                    {errors.email}
                  </Text>
                )}
              </View>

              {/* Password Input */}
              <View className="mb-3">
                <Text className="text-sm font-semibold text-foreground mb-2">
                  Password
                </Text>
                <Animated.View 
                  style={[inputAnimatedStyle(!!errors.password)]}
                  className={`rounded-xl flex-row items-center px-4 py-2.5 border-border/90 ${
                    errors.password ? 'border-destructive/60' : 'border-border'
                  }`}
                >
                  <Ionicons name="lock-closed-outline" size={20} color={colors.mutedForeground} />
                  <TextInput
                    value={formData.password}
                    onChangeText={(text) => handleInputChange('password', text)}
                    placeholder="Enter your password"
                    placeholderTextColor={colors.mutedForeground}
                    secureTextEntry={!showPassword}
                    className="flex-1 text-base text-foreground"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    className="p-1"
                  >
                    <Ionicons 
                      name={showPassword ? "eye-off-outline" : "eye-outline"} 
                      size={20} 
                      color={colors.mutedForeground}
                    />
                  </TouchableOpacity>
                </Animated.View>
                {errors.password && (
                  <Text className="text-xs text-destructive/60 mt-1 ml-1">
                    {errors.password}
                  </Text>
                )}
              </View>

              {authError && (
                <View className="mb-5 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3">
                  <Text className="text-xs text-destructive font-medium">{authError}</Text>
                </View>
              )}

              {/* Login Button */}
              <TouchableOpacity
                onPress={handleLogin}
                disabled={isPending || isOAuthPending}
                className={`bg-primary rounded-xl h-14 justify-center items-center flex-row shadow-lg ${
                  (isPending || isOAuthPending) ? 'opacity-70' : 'opacity-100'
                }`}
                accessibilityRole="button"
                accessibilityLabel="Sign in to your account"
              >
                {(isPending || isOAuthPending) && (
                  <Animated.View className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full mr-3" style={spinnerStyle} />
                )}
                <Text className="text-base font-semibold text-primary-foreground">
                  {isPending || isOAuthPending ? 'Signing In...' : 'Sign In'}
                </Text>
              </TouchableOpacity>

              {/* OR Divider */}
              <View className="flex-row items-center my-8" accessibilityElementsHidden={isPending || isOAuthPending} importantForAccessibility="no-hide-descendants">
                <View className="flex-1 h-px bg-border" />
                <Text className="px-4 text-sm text-muted-foreground">or continue with</Text>
                <View className="flex-1 h-px bg-border" />
              </View>

              {/* Social Login Buttons */}
        <View className="flex-row justify-center gap-x-4 mb-6">
                {/* Google */}
                <TouchableOpacity
                  onPress={handleOAuthLogin}
                  disabled={isOAuthPending}
                  className={`w-14 h-14 bg-card border border-border rounded-xl justify-center items-center shadow-sm ${isOAuthPending ? 'opacity-60' : ''}`}
                  accessibilityLabel="Continue with Google"
                >
                  {isOAuthPending ? (
                    <ActivityIndicator size="small" color={colorScheme === 'dark' ? '#ffffff' : '#222222'} />
                  ) : (
                    <Ionicons name="logo-google" size={24} color="#4285F4" />
                  )}
                </TouchableOpacity>

                {/* GitHub */}
                <TouchableOpacity
                  onPress={() => console.log('GitHub login coming soon')}
                  disabled={isOAuthPending}
                  className="w-14 h-14 bg-card border border-border rounded-xl justify-center items-center shadow-sm"
                  accessibilityLabel="Continue with GitHub"
                >
                  <Ionicons name="logo-github" size={24} color={colorScheme === 'dark' ? '#FFFFFF' : '#24292e'} />
                </TouchableOpacity>

                {/* Twitter/X */}
                <TouchableOpacity
                  onPress={() => console.log('Twitter login coming soon')}
                  disabled={isOAuthPending}
                  className="w-14 h-14 bg-card border border-border rounded-xl justify-center items-center shadow-sm"
                  accessibilityLabel="Continue with Twitter"
                >
                  <Ionicons name="logo-twitter" size={24} color="#1DA1F2" />
                </TouchableOpacity>
              </View>

              {/* Forgot Password */}
              <TouchableOpacity className="items-center mt-2">
                <Text className="text-sm text-primary font-medium">
                  Forgot your password?
                </Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Sign Up Link */}
            <View className="flex-row justify-center items-center mt-12">
              <Text className="text-sm text-muted-foreground">
                Don't have an account?{' '}
              </Text>
              <TouchableOpacity onPress={() => router.push('/auth/register')}>
                <Text className="text-sm text-primary font-semibold">
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>

            <View className="mt-8 items-center hidden">
              <Text className="text-[11px] text-muted-foreground text-center leading-4 px-4">
                By continuing you agree to our Terms & Privacy. Protect ownership, prevent fraudulent resale.
              </Text>
            </View>
          </Animated.View>
          </KeyboardAvoidingView>
        </ScrollView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  )
}

export default Login