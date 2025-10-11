import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Pressable,
  RefreshControl,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemedColors } from '@/hooks/useThemedColors';
import Animated, {
  FadeInDown,
  FadeIn,
  Layout,
  useSharedValue,
  withTiming,
  withRepeat,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { Image } from 'expo-image';

import { useSearchRegistry } from '@/services/api-hooks';
import { RegistrySearchPayload } from '@/services/api';
import { Tables, Enums } from '@/types/supabase';

const MIN_QUERY_LENGTH = 3;
const LIMIT = 20;
type ItemRow = Tables<'items'>;
type FilterStatus = 'all' | Enums<'item_status'>;

const STATUS_FILTERS: Array<{ label: string; value: FilterStatus; description: string }> = [
  { label: 'All', value: 'all', description: 'Entire registry' },
  { label: 'Safe', value: 'safe', description: 'Verified assets' },
  { label: 'Stolen', value: 'stolen', description: 'Flagged incidents' },
  { label: 'Unknown', value: 'unknown', description: 'Awaiting review' },
];

const PRESET_QUERIES = ['MBP14', 'IPH15P', 'VIN', 'DOC'];

const SearchScreen = () => {
  const { theme, colors } = useThemedColors();

  const [query, setQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [submitted, setSubmitted] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const {
    mutate: triggerSearch,
    data: searchResponse,
    isPending,
    error: requestError,
  } = useSearchRegistry();

  const trimmedQuery = query.trim();
  const normalized = trimmedQuery.replace(/\s+/g, '');
  const canSearch = normalized.length >= MIN_QUERY_LENGTH;

  // Local accumulated results for pagination
  const [items, setItems] = useState<ItemRow[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [nextOffset, setNextOffset] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const totalMatches = totalCount || items.length;

  const statusBreakdown = useMemo(
    () =>
      items.reduce(
        (acc, item) => {
          const key = item.status ?? 'unknown';
          acc[key] = (acc[key] ?? 0) + 1;
          return acc;
        },
        { safe: 0, stolen: 0, unknown: 0 } as Record<Enums<'item_status'>, number>,
      ),
    [items],
  );

  const latestTouchpoint = useMemo(() => {
    if (!items.length) return '';
    const sorted = [...items].sort(
      (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
    );
    return sorted[0]?.updated_at ?? '';
  }, [items]);

  const derivedCategories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => {
      if (item.category) {
        set.add(item.category);
      }
    });
    return Array.from(set).slice(0, 8);
  }, [items]);

  const errorMessage = useMemo(() => {
    if (requestError && (requestError as Error).message) {
      return (requestError as Error).message;
    }
    const err = searchResponse?.error;
    if (!err) return '';
    if (typeof err === 'string') return err;
    if (Array.isArray(err)) {
      return err
        .map((item) => (typeof item === 'string' ? item : JSON.stringify(item)))
        .join(', ');
    }
    if (typeof err === 'object') {
      const { message, detail, details } = err as {
        message?: string;
        detail?: string;
        details?: unknown;
      };
      return message || detail || (details ? JSON.stringify(details) : 'Request failed');
    }
    return 'Unable to complete search. Please try again.';
  }, [requestError, searchResponse]);

  const emptyState = submitted && !isPending && !items.length && !errorMessage;

  const statusBadge = useCallback((status?: Enums<'item_status'> | null, subtle = false) => {
    const classes: Record<Enums<'item_status'>, string> = {
      safe: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
      stolen: 'bg-destructive/15 text-destructive border-destructive/40',
      unknown: 'bg-muted/40 text-muted-foreground border-border/50',
    };
    const labels: Record<Enums<'item_status'>, string> = {
      safe: 'SAFE',
      stolen: 'STOLEN',
      unknown: 'UNKNOWN',
    };
    const key: Enums<'item_status'> = status ?? 'unknown';
    return (
      <View className={`rounded-full border px-3 ${subtle ? 'py-[4px]' : 'py-1'} ${classes[key]}`}>
        <Text className={`text-[10px] font-semibold tracking-[1.5px] ${subtle ? 'leading-3' : 'leading-4'}`}>
          {labels[key]}
        </Text>
      </View>
    );
  }, []);

  const formatDate = useCallback((iso?: string | null) => {
    if (!iso) return '—';
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }, []);

  const formatDateTime = useCallback((iso?: string | null) => {
    if (!iso) return '—';
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);

  const performSearch = useCallback(
    (override?: Partial<RegistrySearchPayload> & { status?: FilterStatus; category?: string | null }) => {
      const nextQuery = (override?.query ?? trimmedQuery).trim();
      if (!nextQuery) return;

      const normalizedNext = nextQuery.replace(/\s+/g, '');
      if (normalizedNext.length < MIN_QUERY_LENGTH) return;

      const resolvedStatus = override?.status ?? statusFilter;
      const resolvedCategory =
        override && 'category' in override ? override.category : categoryFilter;

      const isLoadMore = typeof override?.offset === 'number' && override.offset > 0;
      const offsetToUse = override?.offset ?? 0;

      const payload: RegistrySearchPayload = {
        query: nextQuery,
        limit: override?.limit ?? LIMIT,
        offset: offsetToUse,
      };

      if (resolvedStatus && resolvedStatus !== 'all') {
        payload.status = resolvedStatus as Enums<'item_status'>;
      }
      if (resolvedCategory) {
        payload.category = resolvedCategory;
      }

      if (!isLoadMore) {
        // reset when starting a fresh search
        setItems([]);
        setTotalCount(0);
        setNextOffset(null);
      }

      triggerSearch(payload, {
        onSuccess: (resp) => {
          const newList = (Array.isArray(resp?.data) ? (resp.data as ItemRow[]) : []) || [];
          const nextVal = resp?.next;
          const countVal = resp?.count ?? (isLoadMore ? totalCount : newList.length);
          const parsedNext = typeof nextVal === 'number' ? nextVal : (typeof nextVal === 'string' ? (Number.isNaN(parseInt(nextVal, 10)) ? null : parseInt(nextVal, 10)) : null);

          setItems((prev) => {
            if (isLoadMore) {
              // de-dupe by id
              const map = new Map<string, ItemRow>();
              prev.forEach((p) => map.set(p.id, p));
              newList.forEach((n) => map.set(n.id, n));
              return Array.from(map.values());
            }
            return newList;
          });
          setTotalCount(countVal || 0);
          setNextOffset(parsedNext ?? null);
          if (isLoadMore) {
            // keep submitted & activeQuery
          } else {
            setSubmitted(nextQuery.toUpperCase());
            setActiveQuery(nextQuery);
            setExpanded(null);
          }
          if (isRefreshing) setIsRefreshing(false);
        },
        onError: () => {
          if (isRefreshing) setIsRefreshing(false);
        },
      });
    },
    [trimmedQuery, statusFilter, categoryFilter, triggerSearch, totalCount, isRefreshing],
  );

  const handlePrimarySearch = useCallback(() => {
    if (!canSearch) return;
    performSearch();
  }, [canSearch, performSearch]);

  const handleStatusFilter = useCallback(
    (value: FilterStatus) => {
      setStatusFilter(value);
      if (!activeQuery) return;
      performSearch({ query: activeQuery, status: value as any, offset: 0 });
    },
    [activeQuery, performSearch],
  );

  const handleCategoryFilter = useCallback(
    (value: string | null) => {
      setCategoryFilter(value);
      if (!activeQuery) return;
      performSearch({ query: activeQuery, category: value as any, offset: 0 });
    },
    [activeQuery, performSearch],
  );

  const renderResult = useCallback(
    ({ item }: { item: ItemRow }) => {
      const isOpen = expanded === item.id;
      const gallery: string[] = item.images?.length
        ? item.images.slice(0, 4)
        : item.image_url
        ? [item.image_url]
        : [];

      return (
        <Animated.View
          entering={FadeInDown.springify().damping(16)}
          layout={Layout.springify().damping(18).stiffness(180)}
          className="mb-4"
        >
          <Pressable
            onPress={() => setExpanded((prev) => (prev === item.id ? null : item.id))}
            className="rounded-3xl border border-border/40 bg-card/80 px-5 py-4"
          >
            <View className="flex-row items-start">
              <View className="flex-1 pr-4">
                <Text className="text-[13px] font-semibold text-foreground" numberOfLines={1}>
                  {item.name}
                </Text>
                <Text className="text-[11px] text-muted-foreground tracking-wide" numberOfLines={1}>
                  {item.serial_number}
                </Text>
                <View className="mt-2 flex-row items-center gap-2">
                  {statusBadge(item.status, true)}
                  {item.category ? (
                    <View className="rounded-full bg-muted/30 px-2 py-[3px]">
                      <Text className="text-[10px] text-muted-foreground tracking-wide">
                        {item.category}
                      </Text>
                    </View>
                  ) : null}
                  <Text className="text-[10px] text-muted-foreground">
                    Created {formatDate(item.created_at)}
                  </Text>
                </View>
              </View>
              <View
                className={`h-8 w-8 items-center justify-center rounded-full ${
                  isOpen ? 'bg-primary/10' : 'bg-muted/60'
                }`}
              >
                <Text className="text-sm text-muted-foreground">{isOpen ? '−' : '+'}</Text>
              </View>
            </View>

            {isOpen && (
              <Animated.View entering={FadeIn.duration(160)} className="mt-4 border-t border-border/30 pt-4">
                {item.description ? (
                  <Text className="mb-3 text-[12px] leading-5 text-foreground/90">
                    {item.description}
                  </Text>
                ) : null}

                {gallery.length > 0 ? (
                  <View className="mb-3 flex-row -mr-2">
                    {gallery.map((src) => (
                      <Image
                        key={src}
                        source={{ uri: src }}
                        style={{ width: 72, height: 72 }}
                        className="mr-2 rounded-2xl border border-border/40 bg-background"
                        contentFit="cover"
                      />
                    ))}
                  </View>
                ) : null}

                <View className="rounded-2xl bg-muted/30 px-4 py-3">
                  <Text className="text-[10px] uppercase tracking-[1.5px] text-muted-foreground mb-3">
                    Ownership
                  </Text>
                  <View className="gap-y-3">
                    {item.owner ? (
                      <View>
                        <Text className="text-[10px] uppercase tracking-[1px] text-muted-foreground">Owner</Text>
                        <Text className="text-[13px] font-medium text-foreground mt-1">{item.owner}</Text>
                      </View>
                    ) : (
                      <View>
                        <Text className="text-[10px] uppercase tracking-[1px] text-muted-foreground">Owner</Text>
                        <Text className="text-[11px] text-muted-foreground italic mt-1">Not provided</Text>
                      </View>
                    )}
                    {item.contact_info ? (
                      <View>
                        <Text className="text-[10px] uppercase tracking-[1px] text-muted-foreground">Contact</Text>
                        <Text className="text-[13px] font-medium text-foreground mt-1">{item.contact_info}</Text>
                      </View>
                    ) : null}
                    <View>
                      <Text className="text-[10px] uppercase tracking-[1px] text-muted-foreground">Last Updated</Text>
                      <Text className="text-[11px] text-foreground mt-1">{formatDateTime(item.updated_at)}</Text>
                    </View>
                  </View>
                </View>
              </Animated.View>
            )}
          </Pressable>
        </Animated.View>
      );
    },
    [expanded, formatDate, formatDateTime, statusBadge],
  );

  const summaryText = useMemo(() => {
    if (isPending) return 'Searching…';
    if (errorMessage) return 'Search failed';
    return `${totalMatches} match${totalMatches === 1 ? '' : 'es'}`;
  }, [errorMessage, isPending, totalMatches]);

  const handleLoadMore = useCallback(() => {
    if (isPending) return;
    if (nextOffset == null) return;
    if (!activeQuery) return;
    performSearch({ query: activeQuery, offset: nextOffset });
  }, [isPending, nextOffset, activeQuery, performSearch]);

  const onRefresh = useCallback(() => {
    if (!activeQuery) return;
    setIsRefreshing(true);
    performSearch({ query: activeQuery, offset: 0 });
  }, [activeQuery, performSearch]);

  return (
    <SafeAreaView className={`flex-1 ${theme} bg-background`}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={renderResult}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 32, paddingBottom: 48 }}
          onEndReachedThreshold={0.4}
          onEndReached={handleLoadMore}
          onScrollBeginDrag={() => Keyboard.dismiss()}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          ListHeaderComponent={
            <>
              <Animated.View
                entering={FadeInDown.springify().damping(18)}
                className="mb-6 rounded-3xl border border-border/30 bg-primary/5 px-5 py-6"
              >
                <Text className="text-[11px] uppercase tracking-[3px] text-primary">Registry Intelligence</Text>
                <Text className="mt-2 text-[22px] font-semibold text-foreground">Verify assets in seconds</Text>
                <Text className="mt-2 text-[12px] leading-5 text-muted-foreground">
                  Search Trusted Catcher records to validate ownership, status, and incident history before making a decision.
                </Text>
                <View className="mt-4 flex-row flex-wrap gap-3">
                  <View className="rounded-2xl border border-border/40 bg-background/80 px-4 py-3">
                    <Text className="text-[10px] uppercase tracking-[2px] text-muted-foreground">Safe</Text>
                    <Text className="text-lg font-semibold text-emerald-500">{statusBreakdown.safe}</Text>
                  </View>
                  <View className="rounded-2xl border border-border/40 bg-background/80 px-4 py-3">
                    <Text className="text-[10px] uppercase tracking-[2px] text-muted-foreground">Stolen</Text>
                    <Text className="text-lg font-semibold text-destructive">{statusBreakdown.stolen}</Text>
                  </View>
                  <View className="rounded-2xl border border-border/40 bg-background/80 px-4 py-3">
                    <Text className="text-[10px] uppercase tracking-[2px] text-muted-foreground">Updated</Text>
                    <Text className="text-lg font-semibold text-foreground">{formatDateTime(latestTouchpoint)}</Text>
                  </View>
                </View>
              </Animated.View>

              <View className="mb-6 rounded-3xl border border-border/40 bg-card/80 px-5 py-5 shadow-sm shadow-black/5">
                <Text className="text-[11px] uppercase tracking-[2px] text-muted-foreground">Registry query</Text>
                <View className="mt-3 flex-row items-stretch gap-3">
                  <View className="flex-1 rounded-2xl border border-border/40 bg-background/70 px-4 flex-row items-center">
                    <TextInput
                      value={query}
                      onChangeText={(text) => setQuery(text.toUpperCase())}
                      placeholder="Search by serial, name, or category"
                      placeholderTextColor={colors.mutedForeground}
                      className="p-4 text-[13px] tracking-wide text-foreground"
                      autoCapitalize="characters"
                      autoCorrect={false}
                      returnKeyType="search"
                      onSubmitEditing={handlePrimarySearch}
                    />
                    {query.length > 0 ? (
                      <Pressable onPress={() => setQuery("")} className="h-12 w-10 items-center justify-center -mr-2">
                        <Text className="text-muted-foreground text-base">×</Text>
                      </Pressable>
                    ) : null}
                  </View>
                  <TouchableOpacity
                    onPress={handlePrimarySearch}
                    disabled={!canSearch}
                    className={`h-12 min-w-[96px] items-center justify-center rounded-2xl bg-primary px-4 ${!canSearch ? 'opacity-50' : 'opacity-100'}`}
                  >
                    <Text className="text-[13px] font-semibold text-primary-foreground">Search</Text>
                  </TouchableOpacity>
                </View>

                <View className="mt-4 flex-row flex-wrap gap-2">
                  {PRESET_QUERIES.map((preset) => (
                    <Pressable
                      key={preset}
                      onPress={() => {
                        setQuery(preset);
                        setSubmitted('');
                      }}
                      className="rounded-full border border-border/40 bg-muted/40 px-3 py-2"
                    >
                      <Text className="text-[11px] font-medium text-muted-foreground">Try {preset}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View className="mb-6">
                <Text className="mb-3 text-[11px] uppercase tracking-[2px] text-muted-foreground">Status filter</Text>
                <View className="flex-row flex-wrap gap-3">
                  {STATUS_FILTERS.map((option) => {
                    const isActive = option.value === statusFilter;
                    return (
                      <Pressable
                        key={option.value}
                        onPress={() => handleStatusFilter(option.value)}
                        className={`min-w-[120px] flex-1 rounded-2xl border px-4 py-3 ${isActive ? 'border-primary bg-primary/10' : 'border-border/40 bg-muted/30'}`}
                      >
                        <Text className={`text-[12px] font-semibold ${isActive ? 'text-primary' : 'text-foreground'}`}>{option.label}</Text>
                        <Text className="mt-1 text-[10px] text-muted-foreground">{option.description}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {derivedCategories.length ? (
                <View className="mb-6">
                  <Text className="mb-3 text-[11px] uppercase tracking-[2px] text-muted-foreground">Top categories</Text>
                  <View className="flex-row flex-wrap gap-2">
                    <Pressable
                      key="all-categories"
                      onPress={() => handleCategoryFilter(null)}
                      className={`rounded-full border px-3 py-2 ${categoryFilter === null ? 'border-primary bg-primary/10' : 'border-border/40 bg-muted/30'}`}
                    >
                      <Text className={`text-[11px] ${categoryFilter === null ? 'text-primary' : 'text-muted-foreground'}`}>Show all</Text>
                    </Pressable>
                    {derivedCategories.map((category) => {
                      const isActive = categoryFilter === category;
                      return (
                        <Pressable
                          key={category}
                          onPress={() => handleCategoryFilter(isActive ? null : category)}
                          className={`rounded-full border px-3 py-2 ${isActive ? 'border-primary bg-primary/10' : 'border-border/40 bg-muted/30'}`}
                        >
                          <Text className={`text-[11px] ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>{category}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              ) : null}

              {submitted ? (
                <View className="mb-3 flex-row items-center justify-between">
                  <Text className="text-[11px] uppercase tracking-[2px] text-muted-foreground">{summaryText}</Text>
                  <Text className="text-[10px] text-muted-foreground">for "{submitted}"{statusFilter !== 'all' ? ` · ${statusFilter}` : ''}</Text>
                </View>
              ) : null}

              {errorMessage ? (
                <Animated.View entering={FadeIn} className="mb-4 rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3">
                  <Text className="text-[12px] text-destructive" numberOfLines={3}>{errorMessage}</Text>
                </Animated.View>
              ) : null}

              {isPending ? (
                <View className="gap-y-3">
                  {[0, 1, 2].map((index) => (
                    <Animated.View key={index} entering={FadeInDown.delay(index * 80)} className="h-24 overflow-hidden rounded-3xl border border-border/30">
                      <Shimmer />
                    </Animated.View>
                  ))}
                </View>
              ) : null}

              {emptyState ? (
                <Animated.View entering={FadeIn} className="mt-10 items-center">
                  <View className="mb-4 h-24 w-24 items-center justify-center rounded-3xl border border-dashed border-border/50 bg-accent/20">
                    <Text className="text-4xl">🔍</Text>
                  </View>
                  <Text className="text-base font-semibold text-foreground">No matches found</Text>
                  <Text className="mt-2 text-center text-[12px] leading-5 text-muted-foreground">Nothing in the registry matched that search. Try refining the serial, name, or applying a different filter.</Text>
                </Animated.View>
              ) : null}
            </>
          }
          ListFooterComponent={
            items.length > 0 ? (
              <View className="mt-4 items-center justify-center">
                {isPending ? (
                  <ActivityIndicator color={colors.primary} />
                ) : nextOffset == null ? (
                  <Text className="text-[11px] text-muted-foreground mt-2">End of results</Text>
                ) : null}
              </View>
            ) : null
          }
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SearchScreen;

const Shimmer: React.FC = () => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(withTiming(1, { duration: 1200 }), -1, false);
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: (progress.value - 0.5) * 240,
      },
    ],
    opacity: 0.35 + progress.value * 0.35,
  }));

  return (
    <View className="flex-1 bg-muted/30">
      <Animated.View
        style={[
          {
            height: '120%',
            width: '45%',
            backgroundColor: 'rgba(255,255,255,0.35)',
          },
          animatedStyle,
        ]}
      />
    </View>
  );
};
