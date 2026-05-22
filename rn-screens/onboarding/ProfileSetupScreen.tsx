import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { OnboardingNavigationProp } from './WelcomeScreen';

// ─── Types ───────────────────────────────────────────────

export interface UserProfile {
  name: string;
  age: string;
  gender: 'female' | 'male' | 'non_binary' | 'prefer_not_say' | null;
  isPregnant: boolean;
  isBreastfeeding: boolean;
  allergies: string[];
  medications: string[];
  currentRoutine: string;
}

// ─── Mock Data ───────────────────────────────────────────

const GENDER_OPTIONS: { id: UserProfile['gender']; label: string }[] = [
  { id: 'female', label: 'Female' },
  { id: 'male', label: 'Male' },
  { id: 'non_binary', label: 'Non-binary' },
  { id: 'prefer_not_say', label: 'Prefer not to say' },
];

const COMMON_ALLERGIES = [
  'Fragrance',
  'Essential Oils',
  'Nuts (e.g., almond oil)',
  'Sulfates',
  'Parabens',
  'Silicones',
  'Retinol',
  'Benzoyl Peroxide',
  'Salicylic Acid',
  'None known',
];

const COMMON_MEDICATIONS = [
  'Accutane / Isotretinoin',
  'Topical Retinoids',
  'Antibiotics',
  'Birth Control / Hormonal',
  'Blood Thinners',
  'Immunosuppressants',
  'None',
];

// ─── Component ─────────────────────────────────────────────

const ProfileSetupScreen: React.FC = () => {
  const navigation = useNavigation<OnboardingNavigationProp>();

  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    age: '',
    gender: null,
    isPregnant: false,
    isBreastfeeding: false,
    allergies: [],
    medications: [],
    currentRoutine: '',
  });

  const [showPregnancyWarning, setShowPregnancyWarning] = useState(false);

  const updateProfile = useCallback(
    <K extends keyof UserProfile>(key: K, value: UserProfile[K]) => {
      setProfile((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const toggleArrayItem = useCallback(
    (field: 'allergies' | 'medications', item: string) => {
      setProfile((prev) => {
        const current = prev[field];
        const updated = current.includes(item)
          ? current.filter((i) => i !== item)
          : [...current, item];
        return { ...prev, [field]: updated };
      });
    },
    []
  );

  const canProceed = useCallback((): boolean => {
    return (
      profile.name.trim().length > 0 &&
      profile.age.trim().length > 0 &&
      profile.gender !== null
    );
  }, [profile]);

  const handleContinue = useCallback(() => {
    if (!canProceed()) return;
    navigation.navigate('OnboardingComplete');
  }, [canProceed, navigation]);

  const handlePregnancyToggle = useCallback(
    (value: boolean) => {
      updateProfile('isPregnant', value);
      if (value) {
        setShowPregnancyWarning(true);
      } else {
        setShowPregnancyWarning(false);
      }
    },
    [updateProfile]
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="px-6 pt-6">
            {/* Header */}
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="mb-4 -ml-2 p-2 self-start"
              accessibilityLabel="Go back"
              accessibilityRole="button"
            >
              <Text className="text-teal-600 text-lg">← Back</Text>
            </TouchableOpacity>

            <Text
              className="text-2xl font-bold text-gray-900 mb-2"
              accessibilityRole="header"
            >
              Your Profile
            </Text>
            <Text className="text-base text-gray-500 mb-6">
              This helps us personalize your experience and flag any safety concerns.
            </Text>

            {/* Name */}
            <View className="mb-5">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Name <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 text-base focus:border-teal-500"
                placeholder="What should we call you?"
                placeholderTextColor="#9CA3AF"
                value={profile.name}
                onChangeText={(text) => updateProfile('name', text)}
                autoComplete="name"
                textContentType="name"
                accessibilityLabel="Name input"
                accessibilityHint="Enter your preferred name"
              />
            </View>

            {/* Age */}
            <View className="mb-5">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Age <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 text-base focus:border-teal-500"
                placeholder="Your age"
                placeholderTextColor="#9CA3AF"
                value={profile.age}
                onChangeText={(text) => updateProfile('age', text.replace(/[^0-9]/g, ''))}
                keyboardType="number-pad"
                maxLength={3}
                accessibilityLabel="Age input"
                accessibilityHint="Enter your age in years"
              />
            </View>

            {/* Gender */}
            <View className="mb-5">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Gender <Text className="text-red-500">*</Text>
              </Text>
              <View className="flex-row flex-wrap -mx-1">
                {GENDER_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    onPress={() => updateProfile('gender', option.id)}
                    className={`
                      m-1 px-4 py-2.5 rounded-xl border-2
                      ${
                        profile.gender === option.id
                          ? 'border-teal-600 bg-teal-50'
                          : 'border-gray-200 bg-white'
                      }
                    `}
                    accessibilityLabel={option.label}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: profile.gender === option.id }}
                  >
                    <Text
                      className={`
                        text-sm font-medium
                        ${profile.gender === option.id ? 'text-teal-700' : 'text-gray-700'}
                      `}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Pregnancy Section */}
            <View className="mb-5 p-4 rounded-xl bg-amber-50 border border-amber-200">
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-800">
                    Are you pregnant?
                  </Text>
                  <Text className="text-xs text-gray-500 mt-0.5">
                    This is critical for ingredient safety.
                  </Text>
                </View>
                <Switch
                  value={profile.isPregnant}
                  onValueChange={handlePregnancyToggle}
                  trackColor={{ false: '#D1D5DB', true: '#0D9488' }}
                  thumbColor={profile.isPregnant ? '#FFFFFF' : '#F3F4F6'}
                  accessibilityLabel="Pregnancy toggle"
                />
              </View>

              {/* Breastfeeding toggle — shown when pregnant OR as standalone */}
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-800">
                    Are you breastfeeding?
                  </Text>
                  <Text className="text-xs text-gray-500 mt-0.5">
                    Also affects ingredient safety.
                  </Text>
                </View>
                <Switch
                  value={profile.isBreastfeeding}
                  onValueChange={(val) => updateProfile('isBreastfeeding', val)}
                  trackColor={{ false: '#D1D5DB', true: '#0D9488' }}
                  thumbColor={profile.isBreastfeeding ? '#FFFFFF' : '#F3F4F6'}
                  accessibilityLabel="Breastfeeding toggle"
                />
              </View>

              {/* Pregnancy Warning Banner */}
              {showPregnancyWarning && (
                <View
                  className="mt-3 p-3 rounded-lg bg-red-100 border border-red-300"
                  accessibilityLabel="Pregnancy safety warning"
                  accessibilityRole="alert"
                >
                  <Text className="text-sm text-red-800 font-medium">
                    ⚠️ Safety Note
                  </Text>
                  <Text className="text-xs text-red-700 mt-1 leading-relaxed">
                    We'll automatically exclude retinoids, high-dose salicylic acid, and other pregnancy-contraindicated ingredients from your recommendations. Always consult your OB-GYN before starting new skincare.
                  </Text>
                </View>
              )}
            </View>

            {/* Allergies */}
            <View className="mb-5">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Known Allergies & Sensitivities
              </Text>
              <Text className="text-xs text-gray-500 mb-2">
                Tap all that apply. We'll avoid these in your recommendations.
              </Text>
              <View className="flex-row flex-wrap -mx-1">
                {COMMON_ALLERGIES.map((allergy) => (
                  <TouchableOpacity
                    key={allergy}
                    onPress={() => toggleArrayItem('allergies', allergy)}
                    className={`
                      m-1 px-3 py-2 rounded-lg border
                      ${
                        profile.allergies.includes(allergy)
                          ? 'border-rose-500 bg-rose-50'
                          : 'border-gray-200 bg-gray-50'
                      }
                    `}
                    accessibilityLabel={allergy}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: profile.allergies.includes(allergy) }}
                  >
                    <Text
                      className={`
                        text-xs font-medium
                        ${profile.allergies.includes(allergy) ? 'text-rose-700' : 'text-gray-600'}
                      `}
                    >
                      {allergy}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TextInput
                className="w-full mt-2 px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 text-sm"
                placeholder="Other allergies (optional, comma-separated)"
                placeholderTextColor="#9CA3AF"
                value={profile.allergies.filter(a => !COMMON_ALLERGIES.includes(a)).join(', ')}
                onChangeText={(text) => {
                  const custom = text.split(',').map(s => s.trim()).filter(Boolean);
                  const common = profile.allergies.filter(a => COMMON_ALLERGIES.includes(a));
                  updateProfile('allergies', [...common, ...custom]);
                }}
                accessibilityLabel="Other allergies input"
              />
            </View>

            {/* Medications */}
            <View className="mb-5">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Current Medications
              </Text>
              <Text className="text-xs text-gray-500 mb-2">
                Skincare can interact with some medications.
              </Text>
              <View className="flex-row flex-wrap -mx-1">
                {COMMON_MEDICATIONS.map((med) => (
                  <TouchableOpacity
                    key={med}
                    onPress={() => toggleArrayItem('medications', med)}
                    className={`
                      m-1 px-3 py-2 rounded-lg border
                      ${
                        profile.medications.includes(med)
                          ? 'border-teal-500 bg-teal-50'
                          : 'border-gray-200 bg-gray-50'
                      }
                    `}
                    accessibilityLabel={med}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: profile.medications.includes(med) }}
                  >
                    <Text
                      className={`
                        text-xs font-medium
                        ${profile.medications.includes(med) ? 'text-teal-700' : 'text-gray-600'}
                      `}
                    >
                      {med}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Current Skincare Routine */}
            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Current Skincare Routine <Text className="text-gray-400 font-normal">(Optional)</Text>
              </Text>
              <TextInput
                className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 text-sm min-h-[80px]"
                placeholder="What products are you using now? E.g., CeraVe cleanser, The Ordinary niacinamide..."
                placeholderTextColor="#9CA3AF"
                value={profile.currentRoutine}
                onChangeText={(text) => updateProfile('currentRoutine', text)}
                multiline
                textAlignVertical="top"
                accessibilityLabel="Current skincare routine input"
                accessibilityHint="Optional: describe what products you currently use"
              />
            </View>
          </View>
        </ScrollView>

        {/* Sticky Bottom Button */}
        <View className="absolute bottom-0 left-0 right-0 px-6 py-4 bg-white border-t border-gray-100">
          <TouchableOpacity
            onPress={handleContinue}
            disabled={!canProceed()}
            className={`
              w-full py-4 rounded-xl items-center
              ${canProceed() ? 'bg-teal-600 active:bg-teal-700' : 'bg-gray-300'}
            `}
            accessibilityLabel="Continue to summary"
            accessibilityRole="button"
            accessibilityState={{ disabled: !canProceed() }}
          >
            <Text className={`font-semibold text-lg ${canProceed() ? 'text-white' : 'text-gray-500'}`}>
              Continue
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ProfileSetupScreen;
