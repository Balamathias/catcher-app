import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, FlatList, RefreshControl, ActivityIndicator, TextInput, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useThemedColors } from '@/hooks/useThemedColors';
import { useInfiniteItems } from '@/services/api-hooks';
import ItemCard from '@/components/items/ItemCard';
import StackHeader from '@/components/header.stack';
import { Ionicons } from '@expo/vector-icons';

const PAGE_SIZE = 20;

const ItemsListScreen = () => {
  const { theme, colors } = useThemedColors();
  const [status, setStatus] = useState<'all' | 'safe' | 'stolen' | 'unknown'>('all');
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 350);
    return () => clearTimeout(t);
  }, [query]);

  const filters = useMemo(() => ({
    status: status === 'all' ? undefined : status,
    query: debouncedQuery || undefined,
  }), [status, debouncedQuery]);
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    isRefetching,
  } = useInfiniteItems(PAGE_SIZE, filters);

  const items = useMemo(() => (data?.pages ?? []).flatMap(p => p.data ?? []), [data]);

  const onEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <SafeAreaView className={`flex-1 ${theme} bg-background`} edges={['bottom']}>
      <StackHeader title="Your Items" />
      <View className="px-6 py-4 gap-y-3">
        {/* <Text className="text-2xl font-semibold text-foreground">Your Items</Text> */}
        <Text className="text-[12px] text-muted-foreground">Manage and update your registry</Text>
        {/* Search */}
        <View className="flex-row items-center rounded-xl border border-border/80 bg-card px-3 py-2">
          <Ionicons name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search by name or serial…"
            placeholderTextColor={colors.mutedForeground}
            className="flex-1 px-2 text-foreground"
            autoCapitalize="none"
          />
          {!!query && (
            <Pressable onPress={() => setQuery('')} className="px-2 py-1 rounded-md bg-muted/60">
              <Text className="text-[10px] text-muted-foreground">Clear</Text>
            </Pressable>
          )}
        </View>
        {/* Status chips */}
        <View className="flex-row flex-wrap gap-2">
          {(['all', 'safe', 'stolen', 'unknown'] as const).map(s => (
            <Pressable
              key={s}
              onPress={() => setStatus(s)}
              className={`px-3 py-1.5 rounded-full border ${status === s ? 'bg-primary border-primary' : 'bg-card border-border/60'}`}
            >
              <Text className={`text-[11px] ${status === s ? 'text-primary-foreground' : 'text-muted-foreground'}`}>{s[0].toUpperCase() + s.slice(1)}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <FlatList
        data={items}
        keyExtractor={(it) => it.id}
        contentContainerClassName="px-6 pb-10 gap-y-3"
        renderItem={({ item }) => (
          <ItemCard item={item} onPress={() => router.push({ pathname: '/items/[id]', params: { id: item.id } })} />
        )}
        refreshControl={<RefreshControl refreshing={!!isRefetching} onRefresh={refetch} />}
        onEndReachedThreshold={0.4}
        onEndReached={onEndReached}
        ListFooterComponent={
          isFetchingNextPage ? (
            <View className="py-4 items-center"><ActivityIndicator color={colors.primary} /></View>
          ) : !hasNextPage && items.length > 0 ? (
            <View className="py-4 items-center"><Text className="text-[11px] text-muted-foreground">No more items</Text></View>
          ) : null
        }
        ListEmptyComponent={
          isLoading || isRefetching ? (
            <View className="px-6 gap-y-3">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonItem key={i} />)}
            </View>
          ) : (
            <View className="px-6"><Text className="text-muted-foreground">No items yet</Text></View>
          )
        }
      />
    </SafeAreaView>
  );
};

export default ItemsListScreen;

// ---------- Skeletons ----------
const SkeletonItem = () => (
  <View className="rounded-xl border border-border/60 bg-card p-3 flex-row items-center gap-3">
    <View className="w-12 h-12 rounded-lg bg-muted/60" />
    <View className="flex-1 gap-y-2">
      <View className="h-3 rounded bg-muted/60 w-3/5" />
      <View className="h-3 rounded bg-muted/50 w-2/5" />
    </View>
    <View className="w-14 h-5 rounded-full bg-muted/60" />
  </View>
)
