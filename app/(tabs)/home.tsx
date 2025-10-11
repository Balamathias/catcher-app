import React from 'react';
import { View, Text, Pressable, TouchableOpacity, ScrollView, Image, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemedColors } from '@/hooks/useThemedColors';
import { useSession } from '@/contexts/session-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useGetItemsAnalytics } from '@/services/api-hooks';
import StackHeader from '@/components/home/header.stack';

const HomeScreen = () => {
  
  const { theme, colors } = useThemedColors();
  const { user } = useSession()
  const { data, isLoading, isError, refetch, isRefetching } = useGetItemsAnalytics();
  const analytics = data?.data;

  const total = analytics?.totals.total ?? 0;
  const safe = analytics?.totals.safe ?? 0;
  const stolen = analytics?.totals.stolen ?? 0;
  const unknown = analytics?.totals.unknown ?? 0;
  const safePct = analytics?.ratios.safe ?? 0;
  const stolenPct = analytics?.ratios.stolen ?? 0;
  const unknownPct = analytics?.ratios.unknown ?? 0;

  return (
    <SafeAreaView className={`flex-1 ${theme} bg-background`} edges={['bottom']}>
      <StackHeader subtitle={''} />
      <ScrollView
        contentContainerClassName="px-6 py-6 pb-8 gap-y-5"
        refreshControl={<RefreshControl refreshing={!!isRefetching} onRefresh={refetch} />}
      >
        
        <View>
          <Text className="text-xl font-semibold text-foreground mb-1">{user ? `Hi, ${user?.user_metadata?.display_name || user?.user_metadata?.full_name || 'User'}.` : 'Welcome'}</Text>
          <Text className="text-sm text-muted-foreground">Welcome to Catcher, your personal dashboard for items, insights, and safety.</Text>
        </View>

        {isError ? (
          <View className="rounded-xl border border-destructive/30 bg-destructive/10 p-4">
            <Text className="text-destructive font-semibold mb-1">We couldn’t load your dashboard</Text>
            <Text className="text-[12px] text-destructive/80">Please check your connection and try again.</Text>
          </View>
        ) : null}

        {/* Summary cards */}
        <View className="flex-row flex-wrap gap-3">
          <SummaryCard
            label="Total Items"
            value={isLoading ? undefined : total}
            icon={<Ionicons name="layers" size={16} color={colors.primary} />}
          />
          <SummaryCard
            label="Safe"
            value={isLoading ? undefined : safe}
            tone="success"
            icon={<Ionicons name="shield-checkmark" size={16} color="#10b981" />}
          />
          <SummaryCard
            label="Stolen"
            value={isLoading ? undefined : stolen}
            tone="danger"
            icon={<Ionicons name="alert-circle" size={16} color="#ef4444" />}
          />
          <SummaryCard
            label="Unknown"
            value={isLoading ? undefined : unknown}
            tone="warning"
            icon={<Ionicons name="help-circle" size={16} color="#f59e0b" />}
          />
        </View>

        {/* Status breakdown bar */}
        <View className="rounded-xl border border-border/60 bg-card p-4 gap-y-3">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-medium text-foreground">Status breakdown</Text>
            {analytics?.last_updated_at ? (
              <Text className="text-[11px] text-muted-foreground">Updated {new Date(analytics.last_updated_at).toLocaleDateString()}</Text>
            ) : null}
          </View>
          {isLoading ? (
            <View className="h-3 rounded-full bg-muted/60" />
          ) : (
            <View className="h-3 w-full rounded-full overflow-hidden bg-muted/60 flex-row">
              <View style={{ width: `${safePct}%`, backgroundColor: '#10b981' }} />
              <View style={{ width: `${stolenPct}%`, backgroundColor: '#ef4444' }} />
              <View style={{ width: `${unknownPct}%`, backgroundColor: '#f59e0b' }} />
            </View>
          )}
          <View className="flex-row gap-3">
            <LegendDot color="#10b981" label={`${safePct}% safe`} />
            <LegendDot color="#ef4444" label={`${stolenPct}% stolen`} />
            <LegendDot color="#f59e0b" label={`${unknownPct}% unknown`} />
          </View>
        </View>

        {/* Top categories */}
        <View className="rounded-xl border border-border/60 bg-card p-4 gap-y-3">
          <Text className="text-sm font-medium text-foreground">Top categories</Text>
          {isLoading ? (
            <View className="gap-y-2">
              <SkeletonLine />
              <SkeletonLine />
              <SkeletonLine />
            </View>
          ) : analytics?.top_categories?.length ? (
            <View className="gap-y-2">
              {analytics.top_categories.map((c) => (
                <CategoryBar key={c.category} label={c.category} count={c.count} total={total} />
              ))}
            </View>
          ) : (
            <Text className="text-[12px] text-muted-foreground">No categories yet — add your first item to see insights.</Text>
          )}
        </View>

        {/* Recent items */}
        <View className="rounded-xl border border-border/60 bg-card p-4 gap-y-3">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-medium text-foreground">Recent items</Text>
            <TouchableOpacity onPress={() => router.push('/items' as any)} activeOpacity={0.7}>
              <Text className="text-xs text-primary">See All</Text>
            </TouchableOpacity>
          </View>
          {isLoading ? (
            <View className="gap-y-3">
              <SkeletonItem />
              <SkeletonItem />
              <SkeletonItem />
            </View>
          ) : analytics?.recent_items?.length ? (
            <View className="gap-y-3">
              {analytics.recent_items.map((it) => (
                <RecentItem key={it.id} item={it} />
              ))}
              <TouchableOpacity onPress={() => router.push('/items/index')} className="self-start">
                <Text className="text-xs text-primary">See All</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="items-start">
              <Text className="text-[12px] text-muted-foreground">No items yet — start by registering a valuable.</Text>
            </View>
          )}
        </View>

        {/* CTAs */}
        <View className="mt-2 gap-y-3">
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/create')}
            activeOpacity={0.88}
            className="h-14 flex-row items-center justify-between rounded-xl bg-primary px-5 shadow-lg"
          >
            <View className="flex-row items-center">
              <View className="w-9 h-9 rounded-full bg-primary-foreground/20 items-center justify-center mr-3">
                <Ionicons name="add-circle" size={18} color={colors.primaryForeground} />
              </View>
              <View>
                <Text className="text-primary-foreground font-semibold text-base">Register Item</Text>
                <Text className="text-[11px] text-primary-foreground/80">Secure your belongings in the Catcher registry.</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.primaryForeground} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/(tabs)/search')}
            activeOpacity={0.88}
            className="h-14 flex-row items-center justify-between rounded-xl border border-primary/40 bg-primary/5 px-5"
          >
            <View className="flex-row items-center">
              <View className="w-9 h-9 rounded-full bg-primary/15 items-center justify-center mr-3">
                <Ionicons name="search" size={16} color={colors.primary} />
              </View>
              <View>
                <Text className="text-sm font-semibold text-primary">Search Registry</Text>
                <Text className="text-[11px] text-muted-foreground">Verify serials instantly before you buy or accept.</Text>
              </View>
            </View>
            <Ionicons name="arrow-forward" size={18} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;

// ---------- UI Helpers ----------

const SummaryCard = ({ label, value, icon, tone }: { label: string; value?: number; icon?: React.ReactNode; tone?: 'success' | 'danger' | 'warning' }) => {
  let toneBorder = 'border-border/60';
  if (tone === 'success') toneBorder = 'border-emerald-500/40';
  if (tone === 'danger') toneBorder = 'border-red-500/40';
  if (tone === 'warning') toneBorder = 'border-amber-500/40';

  return (
    <View className={`min-w-[46%] flex-1 rounded-xl border ${toneBorder} bg-card p-4`}>
      <View className="flex-row items-center justify-between">
        <Text className="text-[12px] text-muted-foreground">{label}</Text>
        {icon}
      </View>
      {value === undefined ? (
        <View className="mt-2 h-6 rounded bg-muted/60" />
      ) : (
        <Text className="mt-1 text-foreground text-2xl font-semibold">{value}</Text>
      )}
    </View>
  )
}

const LegendDot = ({ color, label }: { color: string; label: string }) => (
  <View className="flex-row items-center gap-2">
    <View style={{ width: 8, height: 8, borderRadius: 999, backgroundColor: color }} />
    <Text className="text-[11px] text-muted-foreground">{label}</Text>
  </View>
)

const CategoryBar = ({ label, count, total }: { label: string; count: number; total: number }) => {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <View className="gap-y-1">
      <View className="flex-row items-center justify-between">
        <Text className="text-xs text-foreground">{label}</Text>
        <Text className="text-[11px] text-muted-foreground">{count}</Text>
      </View>
      <View className="h-2.5 w-full rounded-full bg-muted/60 overflow-hidden">
        <View style={{ width: `${pct}%`, backgroundColor: '#3b82f6' }} className="h-full" />
      </View>
    </View>
  )
}

const RecentItem = ({ item }: { item: { id: string; name: string; status: 'safe' | 'stolen' | 'unknown'; category: string | null; created_at: string; image_url: string | null; serial_number: string } }) => {
  const statusTone = item.status === 'safe' ? 'bg-emerald-500/15 text-emerald-600' : item.status === 'stolen' ? 'bg-red-500/15 text-red-600' : 'bg-amber-500/15 text-amber-600';
  return (
    <Pressable className="flex-row items-center gap-3" onPress={() => router.push(`/items/${item.id}` as any)}>
      <View className="w-10 h-10 rounded-lg bg-muted/50 overflow-hidden items-center justify-center">
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
        ) : (
          <Ionicons name="cube" size={16} color="#9ca3af" />
        )}
      </View>
      <View className="flex-1">
        <Text className="text-sm text-foreground font-medium" numberOfLines={1}>{item.name}</Text>
        <Text className="text-[11px] text-muted-foreground" numberOfLines={1}>SN {item.serial_number}{item.category ? ` • ${item.category}` : ''}</Text>
      </View>
      <View className={`px-2 py-1 rounded-full ${statusTone}`}>
        <Text className="text-[10px] font-medium capitalize">{item.status}</Text>
      </View>
    </Pressable>
  )
}

const SkeletonLine = () => <View className="h-3 rounded bg-muted/60" />
const SkeletonItem = () => (
  <View className="flex-row items-center gap-3">
    <View className="w-10 h-10 rounded-lg bg-muted/60" />
    <View className="flex-1 gap-y-2">
      <View className="h-3 rounded bg-muted/60 w-3/5" />
      <View className="h-3 rounded bg-muted/50 w-2/5" />
    </View>
    <View className="w-14 h-5 rounded-full bg-muted/60" />
  </View>
)
