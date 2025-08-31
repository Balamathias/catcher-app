import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemedColors } from '@/hooks/useThemedColors';
import Animated, { FadeInDown, FadeIn, Layout, useSharedValue, withTiming } from 'react-native-reanimated';
import { Image } from 'expo-image';

type DemoItem = {
  id: string;
  name: string;
  serial: string; // plain for demo; in prod hashed / partial
  category: string;
  status: 'safe' | 'stolen';
  description?: string;
  images?: string[];
  registeredAt: string; // ISO
};

// Demo seed (could eventually come from backend)
const DEMO_ITEMS: DemoItem[] = [
  {
    id: '1',
    name: 'MacBook Pro 14"',
    serial: 'MBP14-9X2K-AB71',
    category: 'Electronics',
    status: 'safe',
    description: 'Space Gray 14-inch, minor scratch on underside near hinge.',
    images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400'],
    registeredAt: '2025-08-10T12:00:00Z'
  },
  {
    id: '2',
    name: 'iPhone 15 Pro',
    serial: 'IPH15P-77QD-9921',
    category: 'Electronics',
    status: 'stolen',
    description: 'Deep Blue Titanium. Reported stolen on 20 Aug 2025.',
    images: ['https://images.unsplash.com/photo-1592899677977-9c10ca5887e1?w=400'],
    registeredAt: '2025-08-05T09:30:00Z'
  },
  {
    id: '3',
    name: 'Citizen Eco-Drive Watch',
    serial: 'CTZ-ED-55291',
    category: 'Jewelry',
    status: 'safe',
    description: 'Silver bracelet, black dial.',
    registeredAt: '2025-07-28T15:10:00Z'
  },
  {
    id: '4',
    name: 'Toyota Corolla 2018',
    serial: 'VIN-TY-18-XYZZZ9234',
    category: 'Vehicle',
    status: 'stolen',
    description: 'White sedan, plate ABC-234XY. Reported stolen 12 Aug.',
    registeredAt: '2025-06-14T08:05:00Z'
  },
  {
    id: '5',
    name: 'Academic Transcript',
    serial: 'DOC-UNIV-2024-8812',
    category: 'Document',
    status: 'safe',
    description: 'Official sealed copy.',
    registeredAt: '2025-07-02T11:02:00Z'
  }
];

const SearchScreen = () => {
  const { theme, colors } = useThemedColors();
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState<string>('');
  const [results, setResults] = useState<DemoItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const searchCountRef = useRef(0);

  const normalized = query.replace(/\s+/g,'').toUpperCase();

  const statusBadge = useCallback((status: 'safe' | 'stolen', small = false) => {
    const map: Record<string,string> = {
      safe: 'bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/30',
      stolen: 'bg-destructive/15 text-destructive border-destructive/40'
    };
    const label = status === 'safe' ? 'SAFE' : 'STOLEN';
    return (
      <View className={`px-2 ${small ? 'py-[3px]' : 'py-1'} rounded-full border ${map[status]} mr-2`}> 
        <Text className={`tracking-wide font-semibold text-foreground ${small ? 'text-[10px]' : 'text-[11px]'}`}>{label}</Text>
      </View>
    );
  }, []);

  const performSearch = () => {
    const q = normalized;
    setSubmitted(q);
    setIsSearching(true);
    setExpanded(null);
    searchCountRef.current += 1;
    const current = searchCountRef.current;
    // Simulate network latency
    setTimeout(() => {
      if (current !== searchCountRef.current) return; // stale
      const lower = q.toLowerCase();
      const filtered = DEMO_ITEMS.filter(it =>
        it.serial.toLowerCase().includes(lower) ||
        it.name.toLowerCase().includes(lower) ||
        it.category.toLowerCase().includes(lower)
      );
      setResults(filtered);
      setIsSearching(false);
    }, 600);
  };

  const prettyDate = (iso: string) => new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

  const emptyState = submitted && !isSearching && results.length === 0;

  const topMatches = useMemo(() => submitted ? results.slice(0, 25) : [] , [submitted, results]);

  const renderItem = ({ item }: { item: DemoItem }) => {
    const isOpen = expanded === item.id;
    return (
      <Animated.View entering={FadeInDown.springify().damping(14)} layout={Layout.springify()} className="mb-3">
        <Pressable onPress={()=>setExpanded(p=> p===item.id ? null : item.id)} className="p-4 rounded-xl border border-border/60 bg-card/70 active:bg-accent/30">
          <View className="flex-row items-start">
            <View className="flex-1 pr-3">
              <Text className="text-[13px] font-semibold text-foreground mb-1" numberOfLines={1}>{item.name}</Text>
              <Text className="text-[11px] text-muted-foreground tracking-wide mb-1" numberOfLines={1}>{item.serial}</Text>
              <View className="flex-row items-center mb-1">
                {statusBadge(item.status, true)}
                <Text className="text-[10px] text-muted-foreground mr-2">{item.category}</Text>
                <Text className="text-[10px] text-muted-foreground">Reg. {prettyDate(item.registeredAt)}</Text>
              </View>
            </View>
            <View className={`w-6 h-6 rounded-full items-center justify-center ${isOpen ? 'bg-primary/10' : 'bg-muted/60'}`}> 
              <Text className="text-[15px] text-muted-foreground">{isOpen ? '−' : '+'}</Text>
            </View>
          </View>
          {isOpen && (
            <Animated.View entering={FadeIn.duration(160)} className="mt-3 pt-3 border-t border-border/50">
              {item.description && <Text className="text-[11px] leading-4 text-foreground mb-3">{item.description}</Text>}
              {item.images && item.images.length > 0 && (
                <View className="flex-row -mr-2 mb-1">
                  {item.images.slice(0,4).map(src => (
                    <Image key={src} source={{ uri: src }} style={{ width: 64, height: 64 }} className="rounded-lg mr-2 border border-border/40 bg-background" contentFit='cover' />
                  ))}
                </View>
              )}
              <View className="mt-3 rounded-lg bg-accent/30 px-3 py-2">
                <Text className="text-[10px] text-muted-foreground leading-4">For privacy, serials may be hashed when publicly displayed. This demo shows plain serials.</Text>
              </View>
            </Animated.View>
          )}
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView className={`flex-1 ${theme} bg-background`}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <View className="flex-1 px-6 pt-8">
          <Text className="text-4xl font-semibold text-foreground mb-1">Registry Lookup</Text>
          <Text className="text-sm text-muted-foreground mb-6">Search registered items by serial, name, or category.</Text>

          <View className="flex-row items-stretch mb-4">
            <View className="flex-1 rounded-xl border border-border/70 px-4 py-3 mr-3">
              <TextInput
                value={query}
                onChangeText={t=>setQuery(t.toUpperCase())}
                placeholder="Enter serial e.g. MBP14-9X2K"
                placeholderTextColor={colors.mutedForeground}
                className="text-foreground tracking-wide"
                autoCapitalize='characters'
                returnKeyType='search'
                onSubmitEditing={performSearch}
              />
            </View>
            <TouchableOpacity
              onPress={performSearch}
              disabled={!normalized}
              className={`px-5 rounded-xl justify-center bg-primary shadow-lg ${!normalized ? 'opacity-50' : 'opacity-100'}`}
            >
              <Text className="text-primary-foreground font-semibold">Search</Text>
            </TouchableOpacity>
          </View>

          {!submitted && (
            <Animated.View entering={FadeInDown.delay(80)} className="mt-4">
              <View className="rounded-xl border border-border/60 bg-accent/20 p-4 mb-4">
                <Text className="text-[11px] text-muted-foreground leading-4">Use this tool to verify an item before purchase. Enter at least 3 characters of the serial or name. Stolen items show a red status.</Text>
              </View>
              <View className="flex-row flex-wrap -mr-2">
                {['MBP14','IPH15P','VIN','DOC'].map(seed => (
                  <Pressable key={seed} onPress={()=>{ setQuery(seed); }} className="px-3 py-2 mr-2 mb-2 rounded-full bg-muted/60">
                    <Text className="text-[11px] font-medium text-muted-foreground">Try {seed}</Text>
                  </Pressable>
                ))}
              </View>
            </Animated.View>
          )}

          {submitted ? (
            <View className="flex-1">
              <View className="flex-row items-center mb-3">
                <Text className="text-xs text-muted-foreground">{isSearching ? 'Searching...' : `${results.length} match${results.length===1?'':'es'}`}</Text>
                {!!submitted && <Text className="text-[10px] text-muted-foreground ml-2">for "{submitted}"</Text>}
              </View>
              {isSearching && (
                <View className="mb-4">
                  {[0,1,2].map(i => (
                    <Animated.View key={i} entering={FadeInDown.delay(i*80)} className="h-20 mb-3 rounded-xl overflow-hidden bg-muted/40">
                      <Shimmer />
                    </Animated.View>
                  ))}
                </View>
              )}
              {emptyState && (
                <Animated.View entering={FadeIn} className="mt-8 items-center">
                  <View className="w-20 h-20 rounded-2xl bg-accent/30 border border-dashed border-border/60 items-center justify-center mb-4">
                    <Text className="text-3xl">🔍</Text>
                  </View>
                  <Text className="text-base font-semibold text-foreground mb-1">No Results</Text>
                  <Text className="text-[12px] text-muted-foreground px-6 text-center leading-4">Nothing in the registry matched that search. Try refining the serial or name.</Text>
                </Animated.View>
              )}
              {!isSearching && !emptyState && (
                <FlatList
                  data={topMatches}
                  keyExtractor={i=>i.id}
                  renderItem={renderItem}
                  contentContainerStyle={{ paddingTop: 4, paddingBottom: 64 }}
                  showsVerticalScrollIndicator={false}
                />
              )}
            </View>
          ) : null}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SearchScreen;

// Simple shimmer placeholder
const Shimmer: React.FC = () => {
  const progress = useSharedValue(0);
  useEffect(()=>{
    progress.value = 0;
    // const loop = () => { progress.value = withTiming(1, { duration: 1600 }, () => { progress.value = 0; loop(); }); };
    // loop();
  }, []); // eslint-disable-line
  return (
    <Animated.View style={{ flex:1, opacity: progress }} className="bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent" />
  );
};
