import { COLORS } from '@/constants/colors'
import { Ionicons } from '@expo/vector-icons'
import { router, Stack } from 'expo-router'
import React from 'react'
import { Image, Text, TouchableOpacity, useColorScheme, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

interface Props {
    title?: string | null
    subtitle?: string | null
    onBackPress?: () => void
    onSearchPress?: () => void
    onNotificationsPress?: () => void
    onAvatarPress?: () => void
    hasUnread?: boolean
}

const StackHeader = ({
    title = 'Home',
    subtitle = 'Stay on top of what matters',
    onSearchPress,
    onNotificationsPress,
    onAvatarPress,
    hasUnread = true,
}: Props) => {
    const colorScheme = useColorScheme()
    const theme = colorScheme === 'dark' ? 'dark' : 'light'
    const colors = COLORS[theme]

    const goSearch = () => (onSearchPress ? onSearchPress() : router.push('/search'))
    const goNotifications = () =>
        onNotificationsPress ? onNotificationsPress() : undefined
    const goProfile = () => (onAvatarPress ? onAvatarPress() : undefined)

    return (
        <Stack.Screen
            options={{
                headerShown: true,
                header: () => (
                    <View className={`${theme} bg-background`}>
                        <SafeAreaView edges={['top']} className="px-4 pt-2 pb-3">
                            {/* Top row: brand + avatar */}
                            {/* <View className="flex-row items-center justify-between">
                                <View className="flex-row items-center gap-x-2">
                                    <Image
                                        source={require('@/assets/logo/logo.png')}
                                        style={{ width: 32, height: 32, resizeMode: 'cover', borderRadius: 8 }}
                                    />
                                    <Text className="text-primary font-bold text-2xl">Catcher</Text>
                                </View>

                                <TouchableOpacity
                                    onPress={goProfile}
                                    className="rounded-full overflow-hidden"
                                    accessibilityRole="button"
                                    accessibilityLabel="Open profile"
                                >
                                    <Ionicons name="person-circle-outline" size={32} color={colors.foreground} />
                                </TouchableOpacity>
                            </View> */}

                            {/* Bottom row: title/subtitle + actions */}
                            <View className="mt-3 flex-row items-center justify-between">
                                <View className="flex-1">
                                    {!!title && (
                                        <Text
                                            numberOfLines={1}
                                            className="text-foreground font-semibold text-2xl"
                                        >
                                            {title}
                                        </Text>
                                    )}
                                    {!!subtitle && (
                                        <Text
                                            numberOfLines={1}
                                            className="text-muted-foreground mt-0.5"
                                        >
                                            {subtitle}
                                        </Text>
                                    )}
                                </View>

                                <View className="flex-row items-center gap-x-2 ml-3">
                                    <TouchableOpacity
                                        onPress={goSearch}
                                        className="p-2 rounded-full bg-muted/30"
                                        accessibilityRole="button"
                                        accessibilityLabel="Search"
                                    >
                                        <Ionicons name="search-outline" color={colors.foreground} size={20} />
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={goNotifications}
                                        className="p-2 rounded-full bg-muted/30 relative"
                                        accessibilityRole="button"
                                        accessibilityLabel="Notifications"
                                    >
                                        <Ionicons name="notifications-outline" color={colors.foreground} size={20} />
                                        {hasUnread && (
                                            <View className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-primary" />
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </SafeAreaView>
                    </View>
                ),
            }}
        />
    )
}

export default StackHeader