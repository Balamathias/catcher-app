import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { useThemedColors } from '@/hooks/useThemedColors';
import { useForm, Controller } from 'react-hook-form';

// Fee constant (could be externalized later)
const REG_FEE = 5000;

type Img = { id: string; kind: 'url' | 'file'; uri: string; filename?: string | null };

interface FormValues {
  name: string;
  serial: string;
  category: string;
  status: string;
  description: string;
  owner: string;
  contact: string;
  images: Img[];
}

const categories = ['Electronics','Jewelry','Vehicle','Document','Other'];
const statuses = ['Not Stolen','Stolen'];

const defaultValues: FormValues = {
  name: '',
  serial: '',
  category: categories[0],
  status: 'Not Stolen',
  description: '',
  owner: '',
  contact: '',
  images: []
};

const PillSelect: React.FC<{ options: string[]; value: string; onChange: (v:string)=>void; }> = ({ options, value, onChange }) => (
  <View className="flex-row flex-wrap -mr-2">
    {options.map(opt => {
      const active = opt === value;
      return (
        <Pressable key={opt} onPress={()=>onChange(opt)} className={`px-4 py-2 rounded-full border mr-2 mb-2 ${active ? 'bg-primary border-primary' : 'bg-muted/40 border-border/60'}`}> 
          <Text className={`text-xs font-medium ${active ? 'text-primary-foreground' : 'text-muted-foreground'}`}>{opt}</Text>
        </Pressable>
      );
    })}
  </View>
);

const Segmented: React.FC<{ options: string[]; value: string; onChange:(v:string)=>void; }> = ({ options, value, onChange }) => (
  <View className="flex-row rounded-xl p-1 bg-muted/50 border border-border/60">
    {options.map(o => {
      const active = o === value;
      return (
        <Pressable key={o} onPress={()=>onChange(o)} className={`flex-1 py-2 rounded-lg items-center ${active ? 'bg-primary shadow-sm' : ''}`}> 
          <Text className={`text-[11px] font-medium ${active ? 'text-white dark:text-black' : 'text-muted-foreground'}`}>{o}</Text>
        </Pressable>
      );
    })}
  </View>
);

const Thumb: React.FC<{ img: Img; onRemove: (id:string)=>void; }> = ({ img, onRemove }) => (
  <View className="w-20 mr-3 mb-3">
    <View className="aspect-square rounded-lg overflow-hidden border border-border/60 bg-card">
      <Image source={{ uri: img.uri }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
    </View>
    <Pressable onPress={()=>onRemove(img.id)} className="mt-1 py-1 rounded-md bg-rose-500/10">
      <Text className="text-center text-[10px] font-medium text-rose-500">Remove</Text>
    </Pressable>
  </View>
);

const RegisterItemWizard: React.FC = () => {
  const { colors } = useThemedColors();
  const [step, setStep] = useState(3); // 0..4
  const [imgUrlInput, setImgUrlInput] = useState('');

  const { control, setValue, handleSubmit, watch, getValues, formState: { errors } } = useForm<FormValues>({
    mode: 'onChange',
    defaultValues
  });

  const wName = watch('name');
  const wSerial = watch('serial');
  const wCategory = watch('category');
  const wStatus = watch('status');
  const images = watch('images');

  const nextEnabled = useMemo(() => {
    if (step === 0) return !!wName?.trim() && !!wSerial?.trim();
    if (step === 1) return !!wCategory && !!wStatus; // always true realistically
    return true; // other steps optional
  }, [step, wName, wSerial, wCategory, wStatus]);

  const go = (dir: 1|-1) => setStep(s => Math.min(4, Math.max(0, s + dir)));

  const addUrlImage = () => {
    const url = imgUrlInput.trim();
    if (!url) return;
    if (!/^https?:\/\//i.test(url)) { Alert.alert('Invalid URL', 'Enter a valid http/https image URL.'); return; }
    const list = getValues('images');
    if (list.find(i => i.uri === url)) { setImgUrlInput(''); return; }
    setValue('images', [...list, { id: Date.now()+Math.random()+'', kind:'url', uri:url }]);
    setImgUrlInput('');
  };

  const pickImages = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { Alert.alert('Permission required','Allow access to pick images.'); return; }
    const res = await ImagePicker.launchImageLibraryAsync({ allowsMultipleSelection:true, mediaTypes: ImagePicker.MediaTypeOptions.Images, quality:0.8, selectionLimit:6 });
    if (res.canceled) return;
    const imgs: Img[] = res.assets.map(a => ({ id: a.assetId || a.uri, kind:'file', uri: a.uri, filename: a.fileName || null }));
    const existing = getValues('images');
    const set = new Set(existing.map(i=>i.uri));
    const filtered = imgs.filter(i=>!set.has(i.uri));
    if (filtered.length) setValue('images', [...existing, ...filtered]);
  };

  const removeImage = (id:string) => {
    const list = getValues('images');
    setValue('images', list.filter(i=>i.id !== id));
  };

  const onSubmit = (values: FormValues) => {
    const payload = {
      name: values.name.trim(),
      serial: values.serial.trim(),
      category: values.category,
      status: values.status,
      description: values.description.trim() || null,
      owner: values.owner.trim() || null,
      contact: values.contact.trim() || null,
      images: values.images.map(i => i.kind === 'url' ? { kind:'url', url:i.uri } : { kind:'file', uri:i.uri, filename:i.filename }),
      fee: REG_FEE
    };
    console.log('Prepared item registration payload:', payload);
    Alert.alert('Payment','Would redirect to Paystack for ₦'+REG_FEE.toLocaleString());
  };

  const Upper = (p:string)=>p.toUpperCase();
  const onSerialChange = (txt:string) => {
    const val = Upper(txt.replace(/\s+/g,'').slice(0,40));
    setValue('serial', val, { shouldValidate:true, shouldDirty:true });
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS==='ios' ? 'padding': undefined} className="flex-1">
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal:24, paddingBottom:48, paddingTop:24 }}>
        <Text className="text-4xl font-semibold text-foreground mb-1">Register Item</Text>
        <Text className="text-sm text-muted-foreground mb-6">Add an item to the registry by filling out the form below.</Text>

        {/* Fee Banner (always visible) */}
        <View className="mb-8 rounded-xl border border-primary/40 bg-primary/5 px-4 py-3">
          <Text className="text-xs font-semibold text-primary mb-1">Registration Fee: ₦{REG_FEE.toLocaleString()}</Text>
          <Text className="text-[11px] leading-4 text-muted-foreground">You will be redirected to Paystack to complete payment before your item is registered.</Text>
        </View>

        {/* Progress Dots */}
        <View className="flex-row mb-8 self-center">
          {[0,1,2,3,4].map(i => (
            <View key={i} className={`h-2 rounded-full mx-1 ${i===step ? 'bg-primary' : 'bg-muted'}`} style={{ width: i===step ? 28 : 8 }} />
          ))}
        </View>

        {/* Step Content */}
        {step === 0 && (
          <View>
            <Text className="text-xs font-medium text-muted-foreground mb-2">Item Name</Text>
            <Controller
              control={control}
              name="name"
              rules={{ required: 'Item name is required', minLength:{ value:2, message:'Too short' } }}
              render={({ field: { onChange, onBlur, value } }) => (
                <View className="rounded-xl border border-border/95 px-4 py-3 mb-2">
                  <TextInput
                    value={value}
                    onChangeText={t=>onChange(t)}
                    onBlur={onBlur}
                    placeholder="MacBook Pro"
                    placeholderTextColor={colors.mutedForeground}
                    className="text-foreground"
                    autoCapitalize='words'
                  />
                </View>
              )}
            />
            {errors.name && <Text className="text-[10px] text-rose-500 mb-4">{errors.name.message}</Text>}
            <Text className="text-xs font-medium text-muted-foreground mb-2">Serial Number</Text>
            <Controller
              control={control}
              name="serial"
              rules={{ required:'Serial is required', minLength:{ value:4, message:'Too short'}, maxLength:{ value:40, message:'Max 40 chars'}, pattern:{ value:/^[A-Z0-9-]*$/, message:'Only letters, numbers, -' } }}
              render={({ field: { value } }) => (
                <View className="rounded-xl border border-border/95 px-4 py-3">
                  <TextInput
                    value={value}
                    onChangeText={onSerialChange}
                    placeholder="XXXX-YYYY-ZZZZ"
                    placeholderTextColor={colors.mutedForeground}
                    className="text-foreground tracking-wide"
                    autoCapitalize='characters'
                  />
                </View>
              )}
            />
            {errors.serial && <Text className="text-[10px] text-rose-500 mt-2">{errors.serial.message}</Text>}
          </View>
        )}

        {step === 1 && (
          <View>
            <Text className="text-xs font-medium text-muted-foreground mb-2">Category</Text>
            <PillSelect options={categories} value={wCategory} onChange={v=>setValue('category', v, { shouldDirty:true })} />
            <View className="h-4" />
            <Text className="text-xs font-medium text-muted-foreground mb-2">Status</Text>
            <Segmented options={statuses} value={wStatus} onChange={v=>setValue('status', v, { shouldDirty:true })} />
          </View>
        )}

        {step === 2 && (
          <View>
            <Text className="text-xs font-medium text-muted-foreground mb-2">Description</Text>
            <Controller
              control={control}
              name="description"
              rules={{ maxLength:{ value:600, message:'Max 600 chars'} }}
              render={({ field: { value, onChange } }) => (
                <View className="rounded-xl border border-border/90 px-4 py-3 mb-2">
                  <TextInput
                    value={value}
                    onChangeText={t=>onChange(t)}
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
                onChangeText={t=>setImgUrlInput(t)}
                placeholder="https://example.com/image.jpg"
                placeholderTextColor={colors.mutedForeground}
                className="flex-1 text-foreground pr-2"
                autoCapitalize='none'
              />
              <Pressable disabled={!imgUrlInput.trim()} onPress={addUrlImage} className={`px-3 py-2 rounded-lg ${imgUrlInput.trim() ? 'bg-primary' : 'bg-muted'}`}>
                <Text className={`text-[11px] font-semibold ${imgUrlInput.trim() ? 'text-primary-foreground' : 'text-muted-foreground'}`}>Add</Text>
              </Pressable>
            </View>
            <Pressable onPress={pickImages} className="rounded-xl border border-dashed border-border/60 bg-accent/20 px-4 py-5 items-center mb-5">
              <Text className="text-xs font-medium text-primary mb-1">Add from device</Text>
              <Text className="text-[10px] text-muted-foreground">Select up to 6 images</Text>
            </Pressable>
            {images.length > 0 && (
              <View className="mb-2">
                <Text className="text-[11px] text-muted-foreground mb-2">Images ({images.length})</Text>
                <View className="flex-row flex-wrap -mr-3">
                  {images.map(img => <Thumb key={img.id} img={img} onRemove={removeImage} />)}
                </View>
              </View>
            )}
          </View>
        )}

        {step === 3 && (
          <View>
            <Text className="text-xs font-medium text-muted-foreground mb-2">Owner Name (Optional)</Text>
            <Controller
              control={control}
              name="owner"
              render={({ field: { value, onChange } }) => (
                <View className="rounded-xl border border-border/90 px-4 py-3 mb-4">
                  <TextInput
                    value={value}
                    onChangeText={t=>onChange(t)}
                    placeholder="Jane Smith"
                    placeholderTextColor={colors.mutedForeground}
                    className="text-foreground"
                  />
                </View>
              )}
            />
            <Text className="text-xs font-medium text-muted-foreground mb-2">Contact Information (Optional)</Text>
            <Controller
              control={control}
              name="contact"
              rules={{ maxLength:{ value:120, message:'Too long' } }}
              render={({ field: { value, onChange } }) => (
                <View className="rounded-xl border border-border/90 px-4 py-3">
                  <TextInput
                    value={value}
                    onChangeText={t=>onChange(t)}
                    placeholder="Email or phone number"
                    placeholderTextColor={colors.mutedForeground}
                    className="text-foreground"
                    keyboardType='email-address'
                  />
                </View>
              )}
            />
            {errors.contact && <Text className="text-[10px] text-rose-500 mt-2">{errors.contact.message}</Text>}
          </View>
        )}

        {step === 4 && (
          <View>
            {(() => {
              const vals = getValues();
              return (
                <>
                  <Text className="text-base font-semibold text-foreground mb-4">Review Details</Text>
                  <View className="rounded-xl border border-border/60 bg-card p-4 mb-5">
                    {([
                      ['Item Name', vals.name],
                      ['Serial', vals.serial],
                      ['Category', vals.category],
                      ['Status', vals.status],
                      ['Owner', vals.owner || '—'],
                      ['Contact', vals.contact || '—'],
                      ['Images', vals.images.length.toString()]
                    ] as [string, string][]) .map(([label, val]) => (
                      <View key={label} className="flex-row justify-between mb-2">
                        <Text className="text-[11px] text-muted-foreground mr-3" numberOfLines={1}>{label}</Text>
                        <Text className="text-[11px] font-medium text-foreground flex-1 text-right" numberOfLines={2}>{val}</Text>
                      </View>
                    ))}
                  </View>
                  <View className="rounded-xl border border-primary/40 bg-primary/5 p-4 mb-6">
                    <Text className="text-xs text-primary font-medium mb-1">Payment Summary</Text>
                    <View className="flex-row justify-between items-center">
                      <Text className="text-sm text-muted-foreground">Registration Fee</Text>
                      <Text className="text-base font-semibold text-foreground">₦{REG_FEE.toLocaleString()}</Text>
                    </View>
                  </View>
                  <Pressable onPress={handleSubmit(onSubmit)} disabled={!vals.name.trim() || !vals.serial.trim()} className={`h-14 rounded-xl items-center justify-center shadow-lg ${vals.name.trim() && vals.serial.trim() ? 'bg-primary' : 'bg-muted'}`}>
                    <Text className={`font-semibold text-base ${vals.name.trim() && vals.serial.trim() ? 'text-primary-foreground' : 'text-muted-foreground'}`}>Proceed to Payment (₦{REG_FEE.toLocaleString()})</Text>
                  </Pressable>
                  <View className="mt-6 rounded-xl border border-dashed border-border/60 p-4 bg-accent/20">
                    <Text className="text-[11px] text-muted-foreground leading-4">Serials will be hashed before storage (future implementation) to enhance privacy while enabling public verification.</Text>
                  </View>
                </>
              );
            })()}
          </View>
        )}

        {/* Navigation Buttons */}
        <View className="flex-row mt-12 mb-2 items-center">
          <Pressable disabled={step===0} onPress={()=>go(-1)} className={`px-4 py-3 rounded-xl border border-border ${step===0 ? 'opacity-40' : 'active:bg-muted/60'}`}>
            <Text className="text-sm text-foreground">Back</Text>
          </Pressable>
          {step < 4 && (
            <Pressable disabled={!nextEnabled} onPress={()=>go(1)} className={`flex-1 ml-4 py-4 rounded-xl items-center ${nextEnabled ? 'bg-primary shadow-lg' : 'bg-muted'}`}>
              <Text className={`text-base font-semibold ${nextEnabled ? 'text-primary-foreground' : 'text-muted-foreground'}`}>Next</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RegisterItemWizard;
