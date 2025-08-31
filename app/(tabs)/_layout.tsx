import React from 'react';
import { Tabs } from 'expo-router';
import { View, Pressable, Text, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemedColors } from '@/hooks/useThemedColors';
import '@/globals.css';

const CustomTabBar = ({ state, descriptors, navigation }: any) => {
	const insets = useSafeAreaInsets();
	const { colors, theme } = useThemedColors();
	return (
		<View
			style={{ paddingBottom: insets.bottom ? insets.bottom - 4 : 8 }}
			className={`${theme} flex-row items-center justify-between px-6 pt-3 bg-background border-none shadow-none`}
		>
			{state.routes.map((route: any, index: number) => {
				const { options } = descriptors[route.key];
				const label =
					options.tabBarLabel !== undefined
						? options.tabBarLabel
						: options.title !== undefined
						? options.title
						: route.name;

				const isFocused = state.index === index;

				const onPress = () => {
					const event = navigation.emit({
						type: 'tabPress',
						target: route.key,
						canPreventDefault: true,
					});
					if (!isFocused && !event.defaultPrevented) {
						navigation.navigate(route.name);
					}
				};

				if (route.name === 'create') {
					return (
						<View key={route.key} className="flex-1 items-center" style={{ transform: [{ translateY: Platform.OS === 'ios' ? -18 : -14 }] }}>
							<Pressable
								accessibilityRole="button"
								onPress={onPress}
								className={`w-16 h-16 rounded-full justify-center items-center shadow-lg bg-primary border border-border/40 ${isFocused ? 'scale-105' : 'scale-100'}`}
								style={{ shadowColor: colors.primary }}
							>
								<Ionicons name="add" size={34} color={colors.primaryForeground} />
							</Pressable>
						</View>
					);
				}

				const iconName = route.name === 'home' ? (isFocused ? 'home' : 'home-outline') : route.name === 'search' ? (isFocused ? 'search' : 'search-outline') : 'ellipse';

				return (
					<Pressable
						key={route.key}
						onPress={onPress}
						accessibilityRole="button"
						accessibilityLabel={label}
						className="flex-1 items-center"
					>
						<Ionicons name={iconName as any} size={24} color={isFocused ? colors.primary : colors.mutedForeground} />
						<Text className={`text-[11px] mt-1 ${isFocused ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>{label === 'home' ? 'Home' : label === 'search' ? 'Search' : label}</Text>
					</Pressable>
				);
			})}
		</View>
	);
};

export default function TabsLayout() {
	const { theme } = useThemedColors();
	return (
		<Tabs
			screenOptions={{ headerShown: false }}
			tabBar={(props) => <CustomTabBar {...props} />}
		>
			<Tabs.Screen name="home" options={{ title: 'home' }} />
			<Tabs.Screen name="create" options={{ title: 'create' }} />
			<Tabs.Screen name="search" options={{ title: 'search' }} />
		</Tabs>
	);
}

