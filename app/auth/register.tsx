import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, Keyboard } from 'react-native'
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
import { StatusBar } from 'expo-status-bar'
import { router } from 'expo-router'

interface RegisterFormData {
  displayName: string
  email: string
  password: string
  confirmPassword: string
}

const Register = () => {
  const colorScheme = useColorScheme()
  
  const [formData, setFormData] = useState<RegisterFormData>({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Partial<RegisterFormData>>({})

  const { theme, colors } = useThemedColors()

  // Animation values
  const fadeIn = useSharedValue(0)
  const slideUp = useSharedValue(50)
  const logoScale = useSharedValue(0.8)
  const formScale = useSharedValue(0.95)
  const shake = useSharedValue(0)
  const spinner = useSharedValue(0)

  useEffect(() => {
    // Entrance animations
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

  const handleInputChange = (field: keyof RegisterFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<RegisterFormData> = {}

    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Display name is required'
    } else if (formData.displayName.trim().length < 2) {
      newErrors.displayName = 'Display name must be at least 2 characters'
    }

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

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
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

  const handleRegister = async () => {
    if (!validateForm()) {
      triggerShake()
      return
    }
    setIsLoading(true)
    spinner.value = withRepeat(withTiming(360, { duration: 900, easing: Easing.linear }), -1, false)
    try {
      const payload = {
        displayName: formData.displayName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password
      }
      console.log('Registration payload prepared:', payload)
      await new Promise(resolve => setTimeout(resolve, 1500))
      console.log('Registration successful!')
    } catch (error) {
      console.error('Registration failed:', error)
    } finally {
      setIsLoading(false)
      spinner.value = 0
    }
  }

  const inputAnimatedStyle = (hasError: boolean) => useAnimatedStyle(() => ({
    borderWidth: withTiming(hasError ? 2 : 1, { duration: 200 })
  }))
  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }))
  const spinnerStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${spinner.value}deg` }] }))

  return (
    <SafeAreaView className={`flex-1 ${theme} bg-background`}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ScrollView className="flex-1 bg-background" contentContainerClassName='justify-center flex min-h-[98vh]'>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 mt-10"
          >
            <Animated.View 
              style={[containerStyle, shakeStyle]}
              className="flex-1 px-6 justify-center py-8"
            >
            {/* Logo Section */}
            <Animated.View style={[logoStyle]} className="items-center mb-8">
              <View className="w-20 h-20 rounded-full  justify-center items-center mb-6 shadow-xl border border-border/60">
                <Ionicons name="person-add-outline" color={colors.mutedForeground} size={40} />
              </View>
              <Text className="text-4xl font-bold text-foreground mb-2 tracking-tight">
                Create Account
              </Text>
              <Text className="text-base text-muted-foreground text-center leading-6 px-2">
                Build a trusted record. Deter theft. Verify before trading.
              </Text>
            </Animated.View>

            {/* Form Section */}
            <Animated.View style={formStyle}>
              {/* Display Name Input */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-foreground mb-2">
                  Display Name
                </Text>
                <Animated.View 
                  style={[inputAnimatedStyle(!!errors.displayName)]}
                  className={` rounded-xl flex-row items-center px-4 py-2.5 border ${
                    errors.displayName ? 'border-destructive/60' : 'border-border'
                  }`}
                >
                  <Ionicons name="person-outline" size={20} color={colors.mutedForeground} />
                  <TextInput
                    value={formData.displayName}
                    onChangeText={(text) => handleInputChange('displayName', text)}
                    placeholder="Enter your display name"
                    placeholderTextColor={colors.mutedForeground}
                    autoCapitalize="words"
                    autoCorrect={false}
                    className="flex-1 text-base text-foreground ml-3"
                  />
                </Animated.View>
                {errors.displayName && (
                  <Text className="text-xs text-destructive/60 mt-1 ml-1">
                    {errors.displayName}
                  </Text>
                )}
              </View>

              {/* Email Input */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-foreground mb-2">
                  Email
                </Text>
                <Animated.View 
                  style={[inputAnimatedStyle(!!errors.email)]}
                  className={` rounded-xl flex-row items-center px-4 py-2.5 border ${
                    errors.email ? 'border-destructive/60' : 'border-border'
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
                    className="flex-1 text-base text-foreground ml-3"
                  />
                </Animated.View>
                {errors.email && (
                  <Text className="text-xs text-destructive/60 mt-1 ml-1">
                    {errors.email}
                  </Text>
                )}
              </View>

              {/* Password Input */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-foreground mb-2">
                  Password
                </Text>
                <Animated.View 
                  style={[inputAnimatedStyle(!!errors.password)]}
                  className={` rounded-xl flex-row items-center px-4 py-2.5 border ${
                    errors.password ? 'border-destructive/60' : 'border-border'
                  }`}
                >
                  <Ionicons name="lock-closed-outline" size={20} color={colors.mutedForeground} />
                  <TextInput
                    value={formData.password}
                    onChangeText={(text) => handleInputChange('password', text)}
                    placeholder="Create a password"
                    placeholderTextColor={colors.mutedForeground}
                    secureTextEntry={!showPassword}
                    className="flex-1 text-base text-foreground ml-3"
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

              {/* Confirm Password Input */}
              <View className="mb-6">
                <Text className="text-sm font-semibold text-foreground mb-2">
                  Confirm Password
                </Text>
                <Animated.View 
                  style={[inputAnimatedStyle(!!errors.confirmPassword)]}
                  className={` rounded-xl flex-row items-center px-4 py-2.5 border ${
                    errors.confirmPassword ? 'border-destructive/60' : 'border-border'
                  }`}
                >
                  <Ionicons name="lock-closed-outline" size={20} color={colors.mutedForeground} />
                  <TextInput
                    value={formData.confirmPassword}
                    onChangeText={(text) => handleInputChange('confirmPassword', text)}
                    placeholder="Confirm your password"
                    placeholderTextColor={colors.mutedForeground}
                    secureTextEntry={!showConfirmPassword}
                    className="flex-1 text-base text-foreground ml-3"
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="p-1"
                  >
                    <Ionicons 
                      name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                      size={20} 
                      color={colors.mutedForeground}
                    />
                  </TouchableOpacity>
                </Animated.View>
                {errors.confirmPassword && (
                  <Text className="text-xs text-destructive/60 mt-1 ml-1">
                    {errors.confirmPassword}
                  </Text>
                )}
              </View>

              {/* Register Button */}
              <TouchableOpacity
                onPress={handleRegister}
                disabled={isLoading}
                className={`bg-primary rounded-xl h-14 justify-center items-center flex-row shadow-lg ${
                  isLoading ? 'opacity-70' : 'opacity-100'
                }`}
                accessibilityRole="button"
                accessibilityLabel="Create your account"
              >
                {isLoading && (
                  <Animated.View className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full mr-3" style={spinnerStyle} />
                )}
                <Text className="text-base font-semibold text-primary-foreground">
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Text>
              </TouchableOpacity>

              {/* OR Divider */}
              <View className="flex-row items-center my-6" accessibilityElementsHidden={isLoading} importantForAccessibility="no-hide-descendants">
                <View className="flex-1 h-px bg-border" />
                <Text className="px-4 text-sm text-muted-foreground">or continue with</Text>
                <View className="flex-1 h-px bg-border" />
              </View>

              {/* Social Login Buttons */}
        <View className="flex-row justify-center gap-x-4 mb-4">
                {/* Google */}
                <TouchableOpacity
                  onPress={() => console.log('Google signup')}
                  className="w-14 h-14 bg-card border border-border rounded-xl justify-center items-center shadow-sm"
          accessibilityLabel="Sign up with Google"
                >
                  <Ionicons name="logo-google" size={24} color="#4285F4" />
                </TouchableOpacity>

                {/* GitHub */}
                <TouchableOpacity
                  onPress={() => console.log('GitHub signup')}
                  className="w-14 h-14 bg-card border border-border rounded-xl justify-center items-center shadow-sm"
                  accessibilityLabel="Sign up with GitHub"
                >
                  <Ionicons name="logo-github" size={24} color={colorScheme === 'dark' ? '#FFFFFF' : '#24292e'} />
                </TouchableOpacity>

                {/* Twitter/X */}
                <TouchableOpacity
                  onPress={() => console.log('Twitter signup')}
                  className="w-14 h-14 bg-card border border-border rounded-xl justify-center items-center shadow-sm"
                  accessibilityLabel="Sign up with Twitter"
                >
                  <Ionicons name="logo-twitter" size={24} color="#1DA1F2" />
                </TouchableOpacity>
              </View>
            </Animated.View>

            {/* Sign In Link */}
            <View className="flex-row justify-center items-center mt-8">
              <Text className="text-sm text-muted-foreground">
                Already have an account?{' '}
              </Text>
              <TouchableOpacity onPress={() => router.push('/auth/login')}>
                <Text className="text-sm text-primary font-semibold">
                  Sign In
                </Text>
              </TouchableOpacity>
            </View>
            <View className="mt-8 items-center">
              <Text className="text-[11px] text-muted-foreground text-center leading-4 px-4">
                By creating an account you agree to our Terms & Privacy. Transparency reduces theft and fraud.
              </Text>
            </View>
          </Animated.View>
          </KeyboardAvoidingView>
        </ScrollView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  )
}

export default Register