import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, AppState } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useForm, useWatch } from 'react-hook-form';
import { useThemedColors } from '@/hooks/useThemedColors';

import { CATEGORIES, STATUSES } from './register/constants';
import { ProgressDots } from './register/ProgressDots';
import { StepBasics } from './register/steps/StepBasics';
import { StepClassification } from './register/steps/StepClassification';
import { StepMedia } from './register/steps/StepMedia';
import { StepOwner } from './register/steps/StepOwner';
import { StepReview } from './register/steps/StepReview';
import { StepNavigation } from './register/StepNavigation';
import { uploadLocalImages } from './register/storage';
import type { FormValues, Img, WizardStep } from './register/types';
import { QUERY_KEYS, useCreateItem, useInitiatePayment, useVerifyPayment, useGetCredits } from '@/services/api-hooks';
import { useGetPaymentConfig } from '@/services/api-hooks';
import { Tables } from '@/types/supabase';
import { PaystackSheet } from '@/components/payments/PaystackSheet';
import { useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PENDING_PAYMENT_KEY = '@catcher/pending-payment';
const PAID_PAYMENT_REF_KEY = '@catcher/paid-ref';

const defaultValues: FormValues = {
  name: '',
  serial: '',
  category: CATEGORIES[0],
  status: STATUSES[0],
  description: '',
  owner: '',
  email: '',
  phone: '',
  images: []
};

const RegisterItemWizard: React.FC = () => {
  const { colors } = useThemedColors();
  const [step, setStep] = useState<WizardStep>(0);
  const [imgUrlInput, setImgUrlInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [paymentVisible, setPaymentVisible] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | undefined>();
  const [paymentRef, setPaymentRef] = useState<string | undefined>();
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [paidRefFromStorage, setPaidRefFromStorage] = useState<string | null>(null);

  const queryClient = useQueryClient()

  const { mutate: createItem, isPending: isCreating } = useCreateItem();
  const { mutate: startPayment, isPending: isInitPay } = useInitiatePayment();
  const { mutate: checkPayment, isPending: isVerifyPay } = useVerifyPayment();
  const { data: credits, refetch: refetchCredits } = useGetCredits();
  const { data: payConfig } = useGetPaymentConfig();
  const FEE_NGN = payConfig?.data?.fee_ngn ?? 5000; // fallback to 100 if config not yet loaded
  const FEE_KOBO = payConfig?.data?.fee_kobo ?? FEE_NGN * 5000;

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors }
  } = useForm<FormValues>({
    mode: 'onChange',
    defaultValues
  });

  const formValues = (useWatch({ control }) as FormValues) ?? defaultValues;
  const { name, serial, category, status } = formValues;

  const STEP_TITLES: Record<WizardStep, string> = {
    0: 'Basics',
    1: 'Classification',
    2: 'Media',
    3: 'Owner',
    4: 'Review',
  };
  const progressPct = ((step + 1) / 5) * 100;

  const nextEnabled = useMemo(() => {
    if (step === 0) return !!name.trim() && !!serial.trim();
    if (step === 1) return !!category && !!status;
    return true;
  }, [step, name, serial, category, status]);

  const go = useCallback((direction: 1 | -1) => {
    setStep(prev => {
      const target = Math.min(4, Math.max(0, prev + direction)) as WizardStep;
      return target;
    });
  }, []);

  const handleSerialChange = useCallback(
    (value: string) => {
      const cleaned = value.replace(/\s+/g, '').slice(0, 40).toUpperCase();
      setValue('serial', cleaned, { shouldDirty: true, shouldValidate: true });
    },
    [setValue]
  );

  const handleCategoryChange = useCallback(
    (value: FormValues['category']) => {
      setValue('category', value, { shouldDirty: true });
    },
    [setValue]
  );

  const handleStatusChange = useCallback(
    (value: FormValues['status']) => {
      setValue('status', value, { shouldDirty: true });
    },
    [setValue]
  );

  const addUrlImage = useCallback(() => {
    const url = imgUrlInput.trim();
    if (!url) return;
    if (!/^https?:\/\//i.test(url)) {
      Alert.alert('Invalid URL', 'Enter a valid http/https image URL.');
      return;
    }

    const current = formValues.images ?? [];
    if (current.some(img => img.uri === url)) {
      setImgUrlInput('');
      return;
    }

    const next: Img[] = [
      ...current,
      { id: `${Date.now()}-${Math.random()}`, kind: 'url', uri: url, base64: null }
    ];

    setValue('images', next, { shouldDirty: true });
    setImgUrlInput('');
  }, [formValues.images, imgUrlInput, setValue]);

  const pickImages = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Allow access to pick images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      selectionLimit: 6,
      base64: true
    });

    if (result.canceled) return;

    const existing = formValues.images ?? [];
    const existingUris = new Set(existing.map(img => img.uri));

    const picked: Img[] = result.assets
      .filter(asset => asset.uri && !existingUris.has(asset.uri))
      .map(asset => ({
        id: asset.assetId || asset.uri,
        kind: 'file',
        uri: asset.uri,
        filename: asset.fileName,
        base64: asset.base64 ?? null
      }));

    if (picked.length === 0) return;

    setValue('images', [...existing, ...picked], { shouldDirty: true });
  }, [formValues.images, setValue]);

  const removeImage = useCallback(
    (id: string) => {
      const current = formValues.images ?? [];
      setValue('images', current.filter(img => img.id !== id), { shouldDirty: true });
    },
    [formValues.images, setValue]
  );

  const launchPayment = useCallback((email: string) => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Alert.alert('Invalid Email', 'Please provide a valid email address in the Owner step.');
      return;
    }
    startPayment(email, {
      onSuccess: (resp) => {
        if (!resp?.data) {
          Alert.alert('Payment init failed', resp?.message || 'Unable to start payment');
          return;
        }
        setPaymentUrl(resp.data.authorization_url);
        setPaymentRef(resp.data.reference);
        setPaymentVisible(true);
        // Persist pending payment so it can be recovered after app background/kill
        AsyncStorage.setItem(
          PENDING_PAYMENT_KEY,
          JSON.stringify({ reference: resp.data.reference, email, amount: resp.data.amount, ts: Date.now() })
        ).catch(() => {});
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.getItemsAnalytics] });
      },
      onError: (err) => {
        const msg = err instanceof Error ? err.message : 'Unable to start payment';
        Alert.alert('Payment init failed', msg);
      }
    })
  }, [startPayment]);

  const verifyPaymentAndSubmit = useCallback(async (values: FormValues, reference: string) => {
    checkPayment(reference, {
      onSuccess: (resp) => {
        const ok = !!resp?.data?.verified;
        setPaymentVerified(ok);
        if (!ok) {
          Alert.alert('Payment not verified', 'We could not verify your payment.');
          return;
        }
        // Persist verified ref and clear pending
        AsyncStorage.setItem(PAID_PAYMENT_REF_KEY, reference).catch(() => {});
        AsyncStorage.removeItem(PENDING_PAYMENT_KEY).catch(() => {});
        setPaidRefFromStorage(reference);
  queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.getCredits] });
        // Proceed with submit
        submitRegistration(values, true);
      },
      onError: (err) => {
        const msg = err instanceof Error ? err.message : 'Could not verify payment';
        Alert.alert('Payment verification failed', msg);
      }
    })
  }, [checkPayment]);

  const submitRegistration = useCallback(
    async (values: FormValues, skipPaymentCheck?: boolean) => {
      if (submitting) return;
      setSubmitting(true);
      try {
        // Ensure payment before registering
        // Always check latest server credits to avoid stale local state
        const latest = await refetchCredits();
        const serverCredits = latest?.data?.data?.available ?? (credits?.data?.available ?? 0);
        const hasServerCredit = serverCredits > 0;
        if (!skipPaymentCheck && !hasServerCredit) {
          const email = values.email?.includes('@') ? values.email : undefined;
          if (!email) {
            Alert.alert('Email required', 'Provide an email address in Owner step to continue to payment.');
            setSubmitting(false);
            return;
          }
          launchPayment(email);
          setSubmitting(false);
          return;
        }

        const processedImages = await uploadLocalImages(values.images ?? []);
        setValue('images', processedImages, { shouldDirty: true });

        const payload: Partial<Tables<'items'>> = {
          name: values.name.trim(),
          serial_number: values.serial.trim(),
          category: values.category,
          status: values.status,
          description: values.description.trim() || null,
          owner: values.owner.trim() || null,
          email: values.email.trim() || null,
          phone: values.phone.trim() || null,
          images: processedImages.map(img => ({ kind: 'url', url: img.uri })).map(img => img.url),
          fee: FEE_NGN,
        };

        createItem(payload, {
          onSuccess: (data) => {
            if (data.error) {
              Alert.alert('Registration Failed', data?.message);
              return;
            }
            Alert.alert('Registration Successful', 'Your item has been registered successfully.');
            reset({ ...defaultValues, category: values.category, status: values.status });
            setImgUrlInput('');
            setStep(0);
            // Clear any stored payment state after success
            AsyncStorage.removeItem(PAID_PAYMENT_REF_KEY).catch(() => {});
            AsyncStorage.removeItem(PENDING_PAYMENT_KEY).catch(() => {});
            setPaidRefFromStorage(null);
            setPaymentVerified(false);
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.getCredits] });
          },
          onError: (error) => {
            const message = error instanceof Error ? error.message : 'Unable to register item right now. Please try again.';
            Alert.alert('Registration Failed', message);
            console.error('Item registration failed:', error);
          }
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to upload images right now. Please try again.';
        Alert.alert('Upload Failed', message);
        console.error('Image upload failed:', error);
      } finally {
        setSubmitting(false);
        setPaymentVisible(false);
      }
    },
    [reset, setValue, submitting, createItem, launchPayment]
  );

  // Source of truth: server credits only
  const availableCredits = credits?.data?.available ?? 0;
  const hasVerifiedPayment = availableCredits > 0;

  // Recover pending payment on mount and whenever app resumes to foreground
  useEffect(() => {
    let mounted = true;
    const recover = async () => {
      try {
        const paidRef = await AsyncStorage.getItem(PAID_PAYMENT_REF_KEY);
        if (!mounted) return;
        if (paidRef) setPaidRefFromStorage(paidRef);

        const pendingRaw = await AsyncStorage.getItem(PENDING_PAYMENT_KEY);
        if (!pendingRaw) return;
        const pending = JSON.parse(pendingRaw || '{}');
        const ref: string | undefined = pending?.reference;
        if (!ref) return;
        // Try verifying silently
        checkPayment(ref, {
          onSuccess: (resp) => {
            if (!mounted) return;
            if (resp?.data?.verified) {
              setPaymentVerified(true);
              AsyncStorage.setItem(PAID_PAYMENT_REF_KEY, ref).catch(() => {});
              AsyncStorage.removeItem(PENDING_PAYMENT_KEY).catch(() => {});
              setPaidRefFromStorage(ref);
            }
          }
        });
      } catch {
        // noop
      }
    };
    recover();
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') recover();
    });
    return () => {
      mounted = false;
      sub.remove();
    };
  }, [checkPayment]);

  const reviewSubmitHandler = handleSubmit((vals) => submitRegistration(vals));

  let currentStepContent: React.ReactNode = null;
  switch (step) {
    case 0:
      currentStepContent = (
        <StepBasics control={control} errors={errors} colors={colors} onSerialChange={handleSerialChange} />
      );
      break;
    case 1:
      currentStepContent = (
        <StepClassification control={control} onCategoryChange={handleCategoryChange} onStatusChange={handleStatusChange} />
      );
      break;
    case 2:
      currentStepContent = (
        <StepMedia control={control} errors={errors} colors={colors} imgUrlInput={imgUrlInput} onImgUrlChange={setImgUrlInput} onAddUrlImage={addUrlImage} onPickImages={pickImages} onRemoveImage={removeImage} />
      );
      break;
    case 3:
      currentStepContent = (<StepOwner control={control} errors={errors} colors={colors} />);
      break;
    case 4:
      currentStepContent = (
        <StepReview values={formValues} submitting={submitting || isInitPay || isVerifyPay || isCreating} colors={colors} onSubmit={reviewSubmitHandler} />
      );
      break;
    default:
      currentStepContent = null;
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
      <ScrollView keyboardShouldPersistTaps="handled" className="px-6" contentContainerClassName="py-4 pb-32 gap-y-4">
        {/* Title & Step */}
        <View className="gap-y-1">
          <Text className="text-xl font-semibold text-foreground">Register New Item</Text>
          <Text className="text-[12px] text-muted-foreground">Step {step + 1} of 5 • {STEP_TITLES[step]}</Text>
        </View>
        {/* Progress */}
        <View className="h-2 w-full rounded-full bg-muted/60 overflow-hidden">
          <View style={{ width: `${progressPct}%` }} className="h-full bg-primary" />
        </View>

        {/* Info */}
        <View className="rounded-xl border border-primary/40 bg-primary/5 px-4 py-3">
          <View className="flex-row items-start gap-2">
            <View className="w-6 h-6 rounded-full bg-primary/15 items-center justify-center mt-[1px]">
              <Ionicons name="card" size={12} color={colors.primary} />
            </View>
            <View className="flex-1">
              <Text className="text-xs font-semibold text-primary mb-1">Registration Fee: ₦{FEE_NGN.toLocaleString()}</Text>
              <Text className="text-[11px] leading-4 text-muted-foreground">You’ll complete a quick, secure Paystack payment before your item is registered.</Text>
            </View>
          </View>
        </View>

        {/* Verified payment banner */}
        {hasVerifiedPayment ? (
          <View className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3">
            <View className="flex-row items-start gap-2">
              <View className="w-6 h-6 rounded-full bg-emerald-500/15 items-center justify-center mt-[1px]">
                <Ionicons name="checkmark-circle" size={14} color="#10b981" />
              </View>
              <View className="flex-1">
                <Text className="text-xs font-semibold" style={{ color: '#059669' }}>Payment verified</Text>
                <Text className="text-[11px] leading-4" style={{ color: '#065f46' }}>You can complete registration without paying again.</Text>
              </View>
            </View>
          </View>
        ) : null}

        <ProgressDots step={step} />

        {currentStepContent}
      </ScrollView>

      {/* Sticky footer actions */}
      <View className="px-6 pb-5 pt-3 border-t border-border/60 bg-background">
        <StepNavigation
          step={step}
          canProceed={nextEnabled}
          submitting={submitting || isInitPay || isVerifyPay || isCreating}
          onBack={() => go(-1)}
          onNext={() => go(1)}
        />
      </View>

      {/* Submitting overlay */}
      {(submitting || isInitPay || isVerifyPay || isCreating) && (
        <View className="absolute inset-0 bg-background/60 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text className="mt-2 text-[12px] text-muted-foreground">Please wait…</Text>
        </View>
      )}

      <PaystackSheet
        visible={paymentVisible}
        authorizationUrl={paymentUrl}
  meta={{ email: formValues.email, phone: formValues.phone, amount: FEE_KOBO }}
        success={paymentVerified}
        onClose={() => setPaymentVisible(false)}
        onCompleted={(url) => {
          if (paymentRef) {
            checkPayment(paymentRef, {
              onSuccess: (resp) => {
                if (resp?.data?.verified) {
                  setPaymentVerified(true);
                  AsyncStorage.setItem(PAID_PAYMENT_REF_KEY, paymentRef).catch(() => {});
                  AsyncStorage.removeItem(PENDING_PAYMENT_KEY).catch(() => {});
                  setPaidRefFromStorage(paymentRef);
                  submitRegistration(formValues, true);
                }
              }
            })
          }
        }}
      />
    </KeyboardAvoidingView>
  );
};

export default RegisterItemWizard;
