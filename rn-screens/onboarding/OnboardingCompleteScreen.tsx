import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { OnboardingNavigationProp } from './WelcomeScreen';

// ─── Mock Summary Data ─────────────────────────────────────
// In production, these would come from global state (Zustand/Redux/Context)

interface MockQuizAnswers {
  skinType: string;
  concerns: string[];
  goals: string[];
}

interface MockProfile {
  name: string;
  age: string;
  gender: string;
  isPregnant: boolean;
  isBreastfeeding: boolean;
  allergies: string[];
  medications: string[];
}

const MOCK_QUIZ: MockQuizAnswers = {
  skinType: 'combination',
  concerns: ['acne', 'dark_spots', 'oiliness'],
  goals: ['clear_skin', 'even_tone'],
};

const MOCK_PROFILE: MockProfile = {
  name: 'Alex',
  age: '28',
  gender: 'female',
  isPregnant: false,
  isBreastfeeding: false,
  allergies: ['Fragrance', 'Essential Oils'],
  medications: ['None'],
};

// ─── Helpers ───────────────────────────────────────────────

const SKIN_TYPE_LABELS: Record<string, string> = {
  oily: 'Oily',
  dry: 'Dry',
  combination: 'Combination',
  sensitive: 'Sensitive',
  normal: 'Normal',
};

const CONCERN_LABELS: Record<string, string> = {
  acne: 'Acne & Breakouts',
  aging: 'Fine Lines & Wrinkles',
  redness: 'Redness & Rosacea',
  dark_spots: 'Dark Spots',
  pores: 'Large Pores',
  dryness: 'Dryness & Dehydration',
  oiliness: 'Excess Oil & Shine',
  texture: 'Uneven Texture',
  dark_circles: 'Dark Circles',
};

const GOAL_LABELS: Record<string, string> = {
  clear_skin: 'Clear, blemish-free skin',
  anti_aging: 'Prevent or reduce signs of aging',
  even_tone: 'Even skin tone & brightness',
  hydration: 'Deep hydration & plumpness',
  pore_minimizing: 'Minimize pore appearance',
  soothing: 'Calm sensitive, irritated skin',
  firmness: 'Improve firmness & elasticity',
  radiance: 'Overall glow & radiance',
};

const GENDER_LABELS: Record<string, string> = {
  female: 'Female',
  male: 'Male',
  non_binary: 'Non-binary',
  prefer_not_say: 'Prefer not to say',
};

// ─── Component ─────────────────────────────────────────────

const OnboardingCompleteScreen: React.FC = () => {
  const navigation = useNavigation<OnboardingNavigationProp>();

  // In production, fetch from global state:
  // const quizAnswers = useOnboardingStore((s) => s.quizAnswers);
  // const profile = useOnboardingStore((s) => s.profile);
  const quizAnswers = MOCK_QUIZ;
  const profile = MOCK_PROFILE;

  const hasSafetyFlags = useMemo(() => {
    return profile.isPregnant || profile.isBreastfeeding || profile.allergies.length > 0;
  }, [profile]);

  const handleStartAnalysis = () => {
    // Navigate to main app / skin analysis screen
    // navigation.navigate('MainApp', { screen: 'Analysis' });
    console.log('Starting analysis...');
  };

  const handleEditQuiz = () => {
    navigation.navigate('SkinTypeQuiz');
  };

  const handleEditProfile = () => {
    navigation.navigate('ProfileSetup');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 pt-6">
          {/* Header */}
          <View className="items-center mb-8">
            <View
              className="w-20 h-20 rounded-full bg-teal-50 items-center justify-center mb-4"
              accessibilityLabel="Success checkmark"
              accessibilityRole="image"
            >
              <Text className="text-4xl">✅</Text>
            </View>
            <Text
              className="text-2xl font-bold text-gray-900 text-center mb-2"
              accessibilityRole="header"
            >
              You're All Set, {profile.name}!
            </Text>
            <Text className="text-base text-gray-500 text-center">
              Here's a summary of what you told us. Ready when you are.
            </Text>
          </View>

          {/* Skin Type Card */}
          <View className="mb-4 p-5 rounded-2xl bg-gray-50 border border-gray-100">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                Skin Type
              </Text>
              <TouchableOpacity
                onPress={handleEditQuiz}
                accessibilityLabel="Edit skin type"
                accessibilityRole="button"
              >
                <Text className="text-sm text-teal-600 font-medium">Edit</Text>
              </TouchableOpacity>
            </View>
            <View className="flex-row items-center">
              <Text className="text-2xl mr-3">
                {quizAnswers.skinType === 'oily' && '💧'}
                {quizAnswers.skinType === 'dry' && '🏜️'}
                {quizAnswers.skinType === 'combination' && '⚖️'}
                {quizAnswers.skinType === 'sensitive' && '🌸'}
                {quizAnswers.skinType === 'normal' && '✨'}
              </Text>
              <Text className="text-lg font-semibold text-gray-900">
                {SKIN_TYPE_LABELS[quizAnswers.skinType] || quizAnswers.skinType}
              </Text>
            </View>
          </View>

          {/* Concerns Card */}
          <View className="mb-4 p-5 rounded-2xl bg-gray-50 border border-gray-100">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                Concerns
              </Text>
              <TouchableOpacity
                onPress={handleEditQuiz}
                accessibilityLabel="Edit concerns"
                accessibilityRole="button"
              >
                <Text className="text-sm text-teal-600 font-medium">Edit</Text>
              </TouchableOpacity>
            </View>
            <View className="flex-row flex-wrap">
              {quizAnswers.concerns.map((concern) => (
                <View
                  key={concern}
                  className="mr-2 mb-2 px-3 py-1.5 rounded-full bg-rose-100"
                >
                  <Text className="text-sm text-rose-700 font-medium">
                    {CONCERN_LABELS[concern] || concern}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Goals Card */}
          <View className="mb-4 p-5 rounded-2xl bg-gray-50 border border-gray-100">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                Goals
              </Text>
              <TouchableOpacity
                onPress={handleEditQuiz}
                accessibilityLabel="Edit goals"
                accessibilityRole="button"
              >
                <Text className="text-sm text-teal-600 font-medium">Edit</Text>
              </TouchableOpacity>
            </View>
            <View className="flex-row flex-wrap">
              {quizAnswers.goals.map((goal) => (
                <View
                  key={goal}
                  className="mr-2 mb-2 px-3 py-1.5 rounded-full bg-teal-100"
                >
                  <Text className="text-sm text-teal-700 font-medium">
                    {GOAL_LABELS[goal] || goal}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Profile Card */}
          <View className="mb-4 p-5 rounded-2xl bg-gray-50 border border-gray-100">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                Profile
              </Text>
              <TouchableOpacity
                onPress={handleEditProfile}
                accessibilityLabel="Edit profile"
                accessibilityRole="button"
              >
                <Text className="text-sm text-teal-600 font-medium">Edit</Text>
              </TouchableOpacity>
            </View>
            <View className="space-y-2">
              <View className="flex-row justify-between">
                <Text className="text-sm text-gray-500">Age</Text>
                <Text className="text-sm font-medium text-gray-900">{profile.age}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-gray-500">Gender</Text>
                <Text className="text-sm font-medium text-gray-900">
                  {GENDER_LABELS[profile.gender] || profile.gender}
                </Text>
              </View>
              {(profile.isPregnant || profile.isBreastfeeding) && (
                <View className="mt-2 p-3 rounded-lg bg-amber-100">
                  <Text className="text-sm text-amber-800 font-medium">
                    {profile.isPregnant && profile.isBreastfeeding
                      ? '🤱 Pregnant & Breastfeeding — safety filters active'
                      : profile.isPregnant
                      ? '🤰 Pregnant — safety filters active'
                      : '🤱 Breastfeeding — safety filters active'}
                  </Text>
                </View>
              )}
              {profile.allergies.length > 0 && (
                <View className="mt-1">
                  <Text className="text-sm text-gray-500 mb-1">Allergies flagged:</Text>
                  <View className="flex-row flex-wrap">
                    {profile.allergies.map((a) => (
                      <Text key={a} className="text-xs text-rose-600 bg-rose-50 px-2 py-1 rounded mr-1 mb-1">
                        {a}
                      </Text>
                    ))}
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Safety Banner */}
          {hasSafetyFlags && (
            <View
              className="mb-6 p-4 rounded-xl bg-teal-50 border border-teal-200"
              accessibilityLabel="Safety summary"
              accessibilityRole="alert"
            >
              <Text className="text-sm font-semibold text-teal-800 mb-1">
                🛡️ Safety-First Mode Active
              </Text>
              <Text className="text-xs text-teal-700 leading-relaxed">
                We've noted your health details and will automatically filter out any ingredients or products that could pose a risk. You'll see safety warnings throughout the app.
              </Text>
            </View>
          )}

          {/* Privacy Note */}
          <View className="mb-6 p-4 rounded-xl bg-gray-50 border border-gray-100">
            <Text className="text-xs text-gray-400 text-center leading-relaxed">
              Your data is stored securely and never sold. You can delete your profile at any time from Settings.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View className="px-6 py-4 border-t border-gray-100 bg-white">
        <TouchableOpacity
          onPress={handleStartAnalysis}
          className="w-full bg-teal-600 py-4 rounded-xl items-center active:bg-teal-700"
          accessibilityLabel="Start skin analysis"
          accessibilityRole="button"
          accessibilityHint="Begin your personalized skin analysis"
        >
          <Text className="text-white font-semibold text-lg">Start Analysis</Text>
        </TouchableOpacity>

        <Text className="text-xs text-gray-400 text-center mt-3">
          This will take about 2 minutes. Your results are ready instantly.
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default OnboardingCompleteScreen;
