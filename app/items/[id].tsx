import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, Pressable, Alert, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useGetItem, useUpdateItem, useDeleteItem } from '@/services/api-hooks';
import { useThemedColors } from '@/hooks/useThemedColors';
import { CATEGORIES, STATUSES } from '@/components/item/register/constants';
import { Ionicons } from '@expo/vector-icons';
import StackHeader from '@/components/header.stack';
import * as ImagePicker from 'expo-image-picker';
import { uploadLocalImages } from '@/components/item/register/storage';
import type { Img } from '@/components/item/register/types';

const Pill = ({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) => (
  <Pressable onPress={onPress} className={`px-3 py-1.5 rounded-full border ${active ? 'bg-primary border-primary' : 'bg-card border-border/60'}`}>
    <Text className={`text-[11px] ${active ? 'text-primary-foreground' : 'text-muted-foreground'}`}>{label}</Text>
  </Pressable>
);

const ItemDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme, colors } = useThemedColors();
  const { data, isLoading, isFetching } = useGetItem(id);
  const item = data?.data;
  const { mutate: updateItem, isPending: saving } = useUpdateItem();
  const { mutate: removeItem, isPending: deleting } = useDeleteItem();

  const [name, setName] = useState(item?.name ?? '');
  const [serial, setSerial] = useState(item?.serial_number ?? '');
  const [category, setCategory] = useState(item?.category ?? CATEGORIES[0]);
  const [status, setStatus] = useState(item?.status ?? STATUSES[0]);
  const [description, setDescription] = useState(item?.description ?? '');
  const [images, setImages] = useState<Img[]>([]);

  React.useEffect(() => {
    if (item) {
      setName(item.name || '');
      setSerial(item.serial_number || '');
      setCategory(item.category || CATEGORIES[0]);
      setStatus(item.status || STATUSES[0]);
      setDescription(item.description || '');
      const arr: string[] = (item as any).images || [];
      const initial = (arr.length ? arr : (item as any).image_url ? [(item as any).image_url] : [])
        .map((url: string) => ({ id: url, kind: 'url', uri: url, base64: null } as Img));
      setImages(initial);
    }
  }, [item]);

  const coverUrl = images.length ? images[0].uri : null;

  const pickImages = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission required', 'Allow access to pick images.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: true,
      quality: 0.8,
      selectionLimit: 6,
    });
    if (result.canceled) return;
    const existingUris = new Set(images.map(i => i.uri));
    const picked: Img[] = result.assets
      .filter(a => a.uri && !existingUris.has(a.uri))
      .map(a => ({ id: a.assetId || a.uri, kind: 'file', uri: a.uri, filename: a.fileName, base64: a.base64 ?? null }));
    if (picked.length) setImages(prev => [...prev, ...picked]);
  };

  const removeImage = (id: string) => setImages(prev => prev.filter(i => i.id !== id));
  const makeCover = (id: string) => setImages(prev => {
    const idx = prev.findIndex(i => i.id === id);
    if (idx <= 0) return prev;
    const copy = [...prev];
    const [itemImg] = copy.splice(idx, 1);
    return [itemImg, ...copy];
  });

  const onSave = async () => {
    if (!item) return;
    try {
      // Upload any local images and collect URLs
      const processed = await uploadLocalImages(images);
      setImages(processed);
      const urls = processed.map(i => i.uri);

      const payload: any = {
        name: name.trim(),
        serial_number: serial.trim(),
        category,
        status,
        description: description.trim() || null,
        images: urls,
        image_url: urls[0] || null,
      };
      updateItem({ id: item.id, data: payload }, {
        onSuccess: (resp) => {
          if (resp.error) {
            Alert.alert('Update failed', resp.message || 'Could not update item');
            return;
          }
          Alert.alert('Saved', 'Item updated');
        },
        onError: (e) => Alert.alert('Update failed', e instanceof Error ? e.message : 'Could not update item')
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Image upload failed';
      Alert.alert('Upload Failed', msg);
    }
  };

  const onDelete = () => {
    if (!item) return;
    Alert.alert('Delete item', 'This action cannot be undone. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => {
        removeItem(item.id, {
          onSuccess: (resp) => {
            if (resp.error) {
              Alert.alert('Delete failed', resp.message || 'Unable to delete');
              return;
            }
            router.replace('/items/index');
          },
          onError: (e) => Alert.alert('Delete failed', e instanceof Error ? e.message : 'Unable to delete')
        })
      } }
    ]);
  };

  return (
    <SafeAreaView className={`flex-1 ${theme} bg-background`} edges={['bottom']}>
      <StackHeader title={name || 'Item details'} />
      {
        isLoading ? (
          <ScrollView contentContainerClassName="px-6 py-6 gap-y-5">
            <View className="h-44 w-full rounded-xl bg-muted/60" />
            <View className="h-6 w-2/5 rounded bg-muted/60" />
            <View className="rounded-xl border border-border/60 bg-card p-4 gap-y-3">
              <View className="h-10 rounded bg-muted/60" />
              <View className="h-10 rounded bg-muted/60" />
            </View>
            <View className="rounded-xl border border-border/60 bg-card p-4 gap-y-3">
              <View className="flex-row gap-2">
                <View className="w-16 h-7 rounded-full bg-muted/60" />
                <View className="w-16 h-7 rounded-full bg-muted/60" />
                <View className="w-16 h-7 rounded-full bg-muted/60" />
              </View>
              <View className="flex-row gap-2">
                <View className="w-16 h-7 rounded-full bg-muted/60" />
                <View className="w-16 h-7 rounded-full bg-muted/60" />
                <View className="w-16 h-7 rounded-full bg-muted/60" />
              </View>
            </View>
            <View className="rounded-xl border border-border/60 bg-card p-4">
              <View className="h-24 rounded bg-muted/60" />
            </View>
            <View className="h-12 rounded-xl bg-muted/60" />
          </ScrollView>
        ) : !item ? (
          <View className="flex-1 items-center justify-center px-6 py-12">
            <View className="w-16 h-16 rounded-full bg-muted/60 items-center justify-center mb-3">
              <Ionicons name="cube" size={24} color={colors.mutedForeground} />
            </View>
            <Text className="text-base font-semibold text-foreground mb-1">Item not found</Text>
            <Text className="text-[12px] text-muted-foreground mb-4 text-center">It might have been deleted or you don’t have access.</Text>
            <Pressable onPress={() => router.replace('/items/index')} className="px-4 h-11 items-center justify-center rounded-lg border border-border/60">
              <Text className="text-sm text-foreground">Go to items</Text>
            </Pressable>
          </View>
        ) : (<ScrollView contentContainerClassName="px-6 py-6 gap-y-5">
                {/* Cover */}
                <View className="h-44 w-full rounded-xl border border-border/60 bg-card overflow-hidden items-center justify-center">
                  {coverUrl ? (
                    <Image source={{ uri: coverUrl }} style={{ width: '100%', height: 250 }} resizeMode="cover" />
                  ) : (
                    <Ionicons name="image" size={28} color={colors.mutedForeground} />
                  )}
                  <View className="absolute right-3 top-3">
                    <Pressable onPress={pickImages} className="px-3 py-1.5 rounded-full border border-border/40 bg-black/10">
                      <Text className="text-[11px] text-white">Change cover</Text>
                    </Pressable>
                  </View>
                </View>
                <View className="flex-row items-center justify-between">
                <Text className="text-2xl font-semibold text-foreground">{name}</Text>
                <Pressable onPress={onDelete} disabled={deleting} className="px-3 py-2 rounded-lg border border-rose-500/40 bg-rose-500/10">
                    <Text className="text-[11px] font-semibold text-rose-600">Delete</Text>
                </Pressable>
                </View>

                {/* Basics */}
                <View className="rounded-xl border border-border/60 bg-card p-4 gap-y-3">
                <View>
                    <Text className="text-xs text-muted-foreground mb-1">Name</Text>
                    {isLoading ? (
                      <View className="h-10 rounded-lg bg-muted/60" />
                    ) : (
                      <TextInput value={name} onChangeText={setName} placeholder="e.g., MacBook Pro 14”" placeholderTextColor={colors.mutedForeground} className="rounded-lg border border-border/80 bg-background px-3 py-2 text-foreground" />
                    )}
                </View>
                <View>
                    <Text className="text-xs text-muted-foreground mb-1">Serial Number</Text>
                    {isLoading ? (
                      <View className="h-10 rounded-lg bg-muted/60" />
                    ) : (
                      <TextInput value={serial} onChangeText={(t) => setSerial(t.replace(/\s+/g, '').toUpperCase().slice(0, 40))} placeholder="Serial Number" placeholderTextColor={colors.mutedForeground} className="rounded-lg border border-border/80 bg-background px-3 py-2 text-foreground" />
                    )}
                </View>
                </View>

                {/* Classification */}
                <View className="rounded-xl border border-border/60 bg-card p-4 gap-y-3">
                <View>
                    <Text className="text-xs text-muted-foreground mb-2">Category</Text>
                    {isLoading ? (
                      <View className="flex-row gap-2">
                        <View className="w-16 h-7 rounded-full bg-muted/60" />
                        <View className="w-16 h-7 rounded-full bg-muted/60" />
                        <View className="w-16 h-7 rounded-full bg-muted/60" />
                      </View>
                    ) : (
                      <View className="flex-row flex-wrap gap-2">
                        {CATEGORIES.map((c) => (
                          <Pill key={c} active={category === c} label={c} onPress={() => setCategory(c)} />
                        ))}
                      </View>
                    )}
                </View>
                <View>
                    <Text className="text-xs text-muted-foreground mb-2">Status</Text>
                    {isLoading ? (
                      <View className="flex-row gap-2">
                        <View className="w-16 h-7 rounded-full bg-muted/60" />
                        <View className="w-16 h-7 rounded-full bg-muted/60" />
                        <View className="w-16 h-7 rounded-full bg-muted/60" />
                      </View>
                    ) : (
                      <View className="flex-row flex-wrap gap-2">
                        {STATUSES.map((s) => (
                          <Pill key={s} active={status === s} label={s} onPress={() => setStatus(s)} />
                        ))}
                      </View>
                    )}
                </View>
                </View>

                {/* Media */}
                <View className="rounded-lg border border-border/60 bg-card p-4">
                  <View className="flex-row items-center justify-between mb-3">
                    <Text className="text-xs font-medium text-muted-foreground">Images</Text>
                    <Pressable onPress={pickImages} className="px-3 py-1.5 rounded-lg border border-primary/40 bg-primary/10">
                      <Text className="text-[11px] text-primary">Add from device</Text>
                    </Pressable>
                  </View>
                  {images.length ? (
                    <View className="flex-row flex-wrap -mr-2">
                      {images.map((img) => (
                        <View key={img.id} className="w-20 mr-2 mb-2">
                          <View className="aspect-square rounded-lg overflow-hidden border border-border/60 bg-muted/30">
                            <Image source={{ uri: img.uri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                          </View>
                          <View className="flex-row mt-1 gap-1.5">
                            <Pressable onPress={() => removeImage(img.id)} className="flex-1 py-1 rounded-md bg-rose-500/10">
                              <Text className="text-center text-[10px] font-medium text-rose-500">Remove</Text>
                            </Pressable>
                            <Pressable onPress={() => makeCover(img.id)} className="flex-1 py-1 rounded-md bg-primary/10">
                              <Text className="text-center text-[10px] font-medium text-primary">Cover</Text>
                            </Pressable>
                          </View>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <Text className="text-[12px] text-muted-foreground">No images — add some for quicker identification.</Text>
                  )}
                </View>

                {/* Description */}
                <View className="rounded-xl border border-border/60 bg-card p-4">
                <Text className="text-xs text-muted-foreground mb-2">Description</Text>
                {isLoading ? (
                  <View className="h-24 rounded-lg bg-muted/60" />
                ) : (
                  <TextInput value={description} onChangeText={setDescription} placeholder="Add helpful identification details…" placeholderTextColor={colors.mutedForeground} className="rounded-lg border border-border/80 bg-background px-3 py-2 text-foreground" multiline />
                )}
                </View>

              <Pressable onPress={onSave} disabled={saving || isLoading} className={`h-12 items-center justify-center rounded-xl ${saving || isLoading ? 'bg-muted' : 'bg-primary'}`}>
                <Text className={`${saving || isLoading ? 'text-muted-foreground' : 'text-primary-foreground'} font-semibold`}>{saving ? 'Saving…' : 'Save changes'}</Text>
                </Pressable>
            </ScrollView>
      )
      }
    </SafeAreaView>
  );
};

export default ItemDetailScreen;
