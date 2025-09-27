import React from 'react';
import { View, Text, TextInput, Pressable, Image } from 'react-native';
import { Controller, type Control, type FieldErrors, useWatch } from 'react-hook-form';
import type { FormValues, Img, ThemedColors } from '../types';

interface StepMediaProps {
  control: Control<FormValues>;
  errors: FieldErrors<FormValues>;
  colors: ThemedColors;
  imgUrlInput: string;
  onImgUrlChange: (value: string) => void;
  onAddUrlImage: () => void;
  onPickImages: () => void;
  onRemoveImage: (id: string) => void;
}

const Thumb: React.FC<{ img: Img; onRemove: (id: string) => void }> = ({ img, onRemove }) => (
  <View className="w-20 mr-3 mb-3">
    <View className="aspect-square rounded-lg overflow-hidden border border-border/60 bg-card">
      <Image source={{ uri: img.uri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
    </View>
    <Pressable onPress={() => onRemove(img.id)} className="mt-1 py-1 rounded-md bg-rose-500/10">
      <Text className="text-center text-[10px] font-medium text-rose-500">Remove</Text>
    </Pressable>
  </View>
);

export const StepMedia: React.FC<StepMediaProps> = ({
  control,
  errors,
  colors,
  imgUrlInput,
  onImgUrlChange,
  onAddUrlImage,
  onPickImages,
  onRemoveImage
}) => {
  const images = useWatch({ control, name: 'images' });

  return (
    <View>
      <Text className="text-xs font-medium text-muted-foreground mb-2">Description</Text>
      <Controller
        control={control}
        name="description"
        rules={{ maxLength: { value: 600, message: 'Max 600 chars' } }}
        render={({ field: { value, onChange } }) => (
          <View className="rounded-xl border border-border/90 px-4 py-3 mb-2">
            <TextInput
              value={value}
              onChangeText={onChange}
              placeholder="Add any details that would help identify this item..."
              placeholderTextColor={colors.mutedForeground}
              className="text-foreground"
              multiline
              maxLength={600}
            />
          </View>
        )}
      />
      {errors.description && <Text className="text-[10px] text-rose-500 mb-4">{errors.description.message}</Text>}

      <Text className="text-xs font-medium text-muted-foreground mb-2">Add Image (URL)</Text>
      <View className="flex-row items-center rounded-xl border border-border/90 px-3 py-2 mb-3">
        <TextInput
          value={imgUrlInput}
          onChangeText={onImgUrlChange}
          placeholder="https://example.com/image.jpg"
          placeholderTextColor={colors.mutedForeground}
          className="flex-1 text-foreground pr-2"
          autoCapitalize="none"
        />
        <Pressable
          disabled={!imgUrlInput.trim()}
          onPress={onAddUrlImage}
          className={`px-3 py-2 rounded-lg ${imgUrlInput.trim() ? 'bg-primary' : 'bg-muted'}`}
        >
          <Text className={`text-[11px] font-semibold ${imgUrlInput.trim() ? 'text-primary-foreground' : 'text-muted-foreground'}`}>Add</Text>
        </Pressable>
      </View>

      <Pressable
        onPress={onPickImages}
        className="rounded-xl border border-dashed border-border/60 bg-accent/20 px-4 py-5 items-center mb-5"
      >
        <Text className="text-xs font-medium text-primary mb-1">Add from device</Text>
        <Text className="text-[10px] text-muted-foreground">Select up to 6 images</Text>
      </Pressable>

      {images?.length > 0 && (
        <View className="mb-2">
          <Text className="text-[11px] text-muted-foreground mb-2">Images ({images.length})</Text>
          <View className="flex-row flex-wrap -mr-3">
            {images.map(img => (
              <Thumb key={img.id} img={img} onRemove={onRemoveImage} />
            ))}
          </View>
        </View>
      )}
    </View>
  );
};
