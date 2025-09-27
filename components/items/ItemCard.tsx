import React from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Tables } from '@/types/supabase';

type Item = Tables<'items'> & { image_url?: string | null };

const statusTone = (status?: string) => {
  if (status === 'safe') return { bg: 'bg-emerald-500/15', text: 'text-emerald-600' };
  if (status === 'stolen') return { bg: 'bg-red-500/15', text: 'text-red-600' };
  return { bg: 'bg-amber-500/15', text: 'text-amber-600' };
};

const getImage = (item: Item) => {
  const arr = (item as any).images as string[] | undefined;
  return item.image_url || (Array.isArray(arr) && arr.length ? arr[0] : null);
};

const ItemCard: React.FC<{ item: Item; onPress?: () => void }> = ({ item, onPress }) => {
  const tone = statusTone(item.status as string);
  const img = getImage(item);
  return (
    <Pressable onPress={onPress} className="rounded-xl border border-border/60 bg-card p-3 flex-row gap-3 active:opacity-90">
      <View className="w-12 h-12 rounded-lg bg-muted/50 overflow-hidden items-center justify-center">
        {img ? (
          <Image source={{ uri: img }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
        ) : (
          <Ionicons name="cube" size={18} color="#9ca3af" />
        )}
      </View>
      <View className="flex-1 gap-y-1">
        <Text className="text-[13px] text-foreground font-semibold" numberOfLines={1}>{item.name}</Text>
        <Text className="text-[11px] text-muted-foreground" numberOfLines={1}>
          SN {item.serial_number}{item.category ? ` • ${item.category}` : ''}
        </Text>
      </View>
      <View className={`self-start px-2 py-1 rounded-full ${tone.bg}`}>
        <Text className={`text-[10px] font-medium capitalize ${tone.text}`}>{item.status}</Text>
      </View>
    </Pressable>
  );
};

export default ItemCard;
