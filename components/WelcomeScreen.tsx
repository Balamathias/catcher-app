import React, { useRef, useState } from 'react';
import { View, Text, Dimensions, Pressable, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  interpolate, 
  Extrapolate, 
  useAnimatedScrollHandler,
  runOnJS,
  SharedValue
} from 'react-native-reanimated';
import { useThemedColors } from '@/hooks/useThemedColors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSession } from '@/contexts/session-context';

interface Slide {
  key: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  cta?: string; // optional inline CTA label
}

const slides: Slide[] = [
  {
    key: 'register',
    title: 'Register Your Valuables',
    subtitle: 'Create a trusted ownership record for each device or item. A secure fingerprint (serial) that proves it is yours.',
    icon: 'shield-checkmark-outline'
  },
  {
    key: 'search',
    title: 'Search The Global Registry',
    subtitle: 'Instantly look up a serial to see if an item is Safe, Stolen, or Unknown. Open, fast, transparent.',
    icon: 'scan-outline',
    cta: 'Search Registry'
  },
  {
    key: 'verify',
    title: 'Verify Before You Buy',
    subtitle: 'Run a quick check while meeting a seller. Confidence in seconds helps you avoid bad deals.',
    icon: 'search-outline'
  },
  {
    key: 'protect',
    title: 'Respond Fast If Stolen',
    subtitle: 'Flip an item to “Stolen” and broadcast the warning publicly. Transparency shrinks the market for theft.',
    icon: 'alert-circle-outline'
  }
];

const DOT_SIZE = 8;

const SlideItem: React.FC<{ slide: Slide; index: number; width: number; scrollX: SharedValue<number>; colors: any; onSearchPress?: () => void; }> = ({ slide, index, width, scrollX, colors, onSearchPress }) => {
  const circleStyle = useAnimatedStyle(() => {
    const input = [(index - 1) * width, index * width, (index + 1) * width];
    return {
      transform: [
        { scale: interpolate(scrollX.value, input, [0.5, 1, 0.5], Extrapolate.CLAMP) },
        { rotate: interpolate(scrollX.value, input, [-25, 0, 25], Extrapolate.CLAMP) + 'deg' }
      ],
      opacity: interpolate(scrollX.value, input, [0.25, 1, 0.25], Extrapolate.CLAMP)
    };
  });
  const iconInsideStyle = useAnimatedStyle(() => {
    const input = [(index - 1) * width, index * width, (index + 1) * width];
    return {
      transform: [{ scale: interpolate(scrollX.value, input, [0.4, 1, 0.4], Extrapolate.CLAMP) }]
    };
  });
  const titleStyle = useAnimatedStyle(() => {
    const input = [(index - 1) * width, index * width, (index + 1) * width];
    return {
      opacity: interpolate(scrollX.value, input, [0, 1, 0], Extrapolate.CLAMP),
      transform: [{ translateY: interpolate(scrollX.value, input, [30, 0, -30], Extrapolate.CLAMP) }]
    };
  });
  const subtitleStyle = useAnimatedStyle(() => {
    const input = [(index - 1) * width, index * width, (index + 1) * width];
    return {
      opacity: interpolate(scrollX.value, input, [0, 1, 0], Extrapolate.CLAMP),
      transform: [{ translateY: interpolate(scrollX.value, input, [20, 0, -20], Extrapolate.CLAMP) }]
    };
  });
  return (
    <View style={{ width }} className="px-7 justify-center items-center">
      <Animated.View style={circleStyle} className="w-32 h-32 rounded-full mb-10 items-center justify-center bg-primary shadow-xl">
        <Animated.View style={iconInsideStyle}>
          <Ionicons name={slide.icon} size={40} color={colors.primaryForeground} />
        </Animated.View>
      </Animated.View>
      <Animated.Text style={titleStyle} className="text-3xl font-semibold text-center text-foreground tracking-tight leading-snug mb-4">
        {slide.title}
      </Animated.Text>
      <Animated.Text style={subtitleStyle} className="text-base text-center text-muted-foreground leading-6 px-2 mb-4">
        {slide.subtitle}
      </Animated.Text>
      {slide.cta && (
        <Pressable
          accessibilityRole="button"
          onPress={onSearchPress}
          className="mt-1 px-5 py-3 rounded-xl bg-primary/90 active:bg-primary w-56 items-center shadow-md"
        >
          <Text className="text-sm font-semibold tracking-wide text-primary-foreground">{slide.cta}</Text>
        </Pressable>
      )}
    </View>
  );
};

const Dot: React.FC<{ i: number; width: number; scrollX: SharedValue<number>; }> = ({ i, width, scrollX }) => {
  const style = useAnimatedStyle(() => {
    const input = [(i - 1) * width, i * width, (i + 1) * width];
    return {
      width: interpolate(scrollX.value, input, [DOT_SIZE, DOT_SIZE * 3, DOT_SIZE], Extrapolate.CLAMP),
      opacity: interpolate(scrollX.value, input, [0.3, 1, 0.3], Extrapolate.CLAMP),
      transform: [{ scale: interpolate(scrollX.value, input, [0.7, 1.15, 0.7], Extrapolate.CLAMP) }]
    };
  });
  return <Animated.View style={style} className="h-2 rounded-full mx-1 bg-primary" />;
};

const WelcomeScreen: React.FC = () => {
  const { theme, colors } = useThemedColors();
  const { width: winWidth } = useWindowDimensions();
  const scrollRef = useRef<Animated.ScrollView | null>(null);
  const scrollX = useSharedValue(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const lastReported = useRef(0);

  const { user } = useSession()

  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollX.value = e.contentOffset.x;
      const idx = Math.round(e.contentOffset.x / winWidth);
      if (idx !== lastReported.current) {
        lastReported.current = idx;
        runOnJS(setActiveIndex)(idx);
      }
    }
  });

  const handleSkip = () => router.replace('/auth/login');
  const handleGetStarted = () => router.replace('/auth/login');
  // Inline search CTA: could pass redirect param for later handling in login
  const handleSearchCTA = () => {
    router.replace('/auth/login?redirect=/(tabs)/search');
  };

  const goTo = (index: number) => {
    scrollRef.current?.scrollTo({ x: index * winWidth, animated: true });
  };

  return (
    <SafeAreaView className={`flex-1 ${theme} bg-background`}>
      <View className="absolute top-4 right-5 z-20">
        <Pressable onPress={handleSkip} hitSlop={12} className="px-3 py-1 rounded-full bg-muted/60">
          <Text className="text-xs font-medium text-foreground">Skip</Text>
        </Pressable>
      </View>

      <Animated.ScrollView
        ref={scrollRef as any}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        className="flex-1"
        contentContainerStyle={{ alignItems: 'center' }}
      >
        {slides.map((s, i) => (
          <SlideItem
            key={s.key}
            slide={s}
            index={i}
            width={winWidth}
            scrollX={scrollX}
            colors={colors}
            onSearchPress={s.key === 'search' ? handleSearchCTA : undefined}
          />
        ))}
      </Animated.ScrollView>

      <View className="px-8 pb-8 pt-2">
        <View className="flex-row justify-center items-center mb-8">
          {slides.map((_, i) => (
            <Dot key={i} i={i} width={winWidth} scrollX={scrollX} />
          ))}
        </View>
        <Pressable onPress={()=>router.push('/info')} className="mb-6 self-center" accessibilityRole="button">
          <Text className="text-xs font-medium text-primary">Learn more about how Catcher works</Text>
        </Pressable>

  <View className="flex-row items-center justify-between">
          {/* Back */}
            <Pressable
              disabled={activeIndex === 0}
              onPress={() => goTo(Math.max(0, activeIndex - 1))}
              className={`px-4 py-3 rounded-xl border border-border ${activeIndex === 0 ? 'opacity-30' : 'opacity-100'}`}
            >
              <Text className="text-sm text-foreground">Back</Text>
            </Pressable>

          <Pressable
            onPress={() => {
              if (activeIndex === slides.length - 1) handleGetStarted(); else goTo(activeIndex + 1);
            }}
            className="flex-1 ml-4 rounded-xl bg-primary py-4 items-center shadow-lg"
          >
            <Text className="text-base font-semibold text-primary-foreground">
              {activeIndex === slides.length - 1 ? 'Get Started' : 'Next'}
            </Text>
          </Pressable>
  </View>
      </View>
    </SafeAreaView>
  );
};

export default WelcomeScreen;