import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Animated,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { OnboardingNavigationProp } from './WelcomeScreen';

// ─── Types ───────────────────────────────────────────────

export type FitzpatrickType = 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI';

export interface FitzpatrickAnswers {
  eyeColor: number | null;
  hairColor: number | null;
  skinColor: number | null;
  freckles: number | null;
  sunResponse: number | null;
  tanningAbility: number | null;
}

export interface FitzpatrickResult {
  type: FitzpatrickType;
  score: number;
  description: string;
  sunBurnTime: string;
  skinCancerRisk: string;
  uvProtection: string;
}

interface FitzpatrickQuestion {
  id: keyof FitzpatrickAnswers;
  title: string;
  subtitle: string;
  options: { score: number; label: string }[];
}

// ─── Mock Data ─────────────────────────────────────────────

const FITZPATRICK_QUESTIONS: FitzpatrickQuestion[] = [
  {
    id: 'eyeColor',
    title: 'What is your natural eye color?',
    subtitle: 'Choose the color closest to your unaided eye color.',
    options: [
      { score: 0, label: 'Light blue, gray, or green' },
      { score: 1, label: 'Blue, gray, or green' },
      { score: 2, label: 'Hazel or light brown' },
      { score: 3, label: 'Dark brown' },
      { score: 4, label: 'Brownish black' },
    ],
  },
  {
    id: 'hairColor',
    title: 'What is your natural hair color?',
    subtitle: 'Before any coloring or graying.',
    options: [
      { score: 0, label: 'Red or strawberry blonde' },
      { score: 1, label: 'Blonde' },
      { score: 2, label: 'Light brown or dirty blonde' },
      { score: 3, label: 'Dark brown' },
      { score: 4, label: 'Black' },
    ],
  },
  {
    id: 'skinColor',
    title: 'What is your natural skin color before sun?',
    subtitle: 'On areas never exposed to sun (e.g., underarm).',
    options: [
      { score: 0, label: 'Ivory white' },
      { score: 1, label: 'Fair or pale' },
      { score: 2, label: 'Medium or olive' },
      { score: 3, label: 'Brown' },
      { score: 4, label: 'Dark brown or black' },
    ],
  },
  {
    id: 'freckles',
    title: 'Do you have freckles on unexposed areas?',
    subtitle: 'On areas that rarely see sun.',
    options: [
      { score: 0, label: 'Many' },
      { score: 1, label: 'Several' },
      { score: 2, label: 'A few' },
      { score: 3, label: 'Very few' },
      { score: 4, label: 'None' },
    ],
  },
  {
    id: 'sunResponse',
    title: 'How does your skin respond to sun exposure?',
    subtitle: 'After the first 30-60 minutes in strong sun without protection.',
    options: [
      { score: 0, label: 'Always burns severely, peels, no tan' },
      { score: 1, label: 'Usually burns, may lightly tan' },
      { score: 2, label: 'Sometimes burns, gradually tans' },
      { score: 3, label: 'Rarely burns, tans well' },
      { score: 4, label: 'Never burns, tans deeply' },
    ],
  },
  {
    id: 'tanningAbility',
    title: 'How well do you tan?',
    subtitle: 'When you do get sun exposure repeatedly.',
    options: [
      { score: 0, label: 'Never tans — only burns or freckles' },
      { score: 1, label: 'Tans minimally, light golden' },
      { score: 2, label: 'Tans moderately, noticeable color' },
      { score: 3, label: 'Tans well, brown color' },
      { score: 4, label: 'Tans deeply, dark brown' },
    ],
  },
];

const FITZPATRICK_SCALE: Record<FitzpatrickType, { label: string; description: string; sunBurnTime: string; skinCancerRisk: string; uvProtection: string; color: string }> = {
  I: {
    label: 'Type I — Very Fair',
    description: 'Ivory skin, always burns, never tans. Very sensitive to UV.',
    sunBurnTime: '~10-15 minutes',
    skinCancerRisk: 'Highest risk',
    uvProtection: 'SPF 50+ essential; seek shade, wear protective clothing',
    color: '#FFF5F0',
  },
  II: {
    label: 'Type II — Fair',
    description: 'Fair skin, burns easily, tans minimally. Very sensitive to UV.',
    sunBurnTime: '~15-20 minutes',
    skinCancerRisk: 'High risk',
    uvProtection: 'SPF 50+ recommended; limit midday sun exposure',
    color: '#FFE8D6',
  },
  III: {
    label: 'Type III — Medium',
    description: 'Medium skin, sometimes burns, gradually tans. Moderately sensitive to UV.',
    sunBurnTime: '~20-30 minutes',
    skinCancerRisk: 'Moderate risk',
    uvProtection: 'SPF 30-50; still use protective measures',
    color: '#FFDCA8',
  },
  IV: {
    label: 'Type IV — Olive',
    description: 'Olive or light brown skin, rarely burns, tans well. Less sensitive to UV.',
    sunBurnTime: '~30-40 minutes',
    skinCancerRisk: 'Low-moderate risk',
    uvProtection: 'SPF 30 recommended; monitor moles regularly',
    color: '#D4A574',
  },
  V: {
    label: 'Type V — Brown',
    description: 'Brown skin, rarely burns, tans deeply. Low sensitivity to UV.',
    sunBurnTime: '~40-60 minutes',
    skinCancerRisk: 'Low risk',
    uvProtection: 'SPF 15-30; sun damage still occurs without visible burns',
    color: '#8B5A2B',
  },
  VI: {
    label: 'Type VI — Dark Brown/Black',
    description: 'Dark brown to black skin, never burns, deeply pigmented. Least sensitive to UV.',
    sunBurnTime: '60+ minutes',
    skinCancerRisk: 'Lowest risk',
    uvProtection: 'SPF 15; focus on overall skin health and hyperpigmentation',
    color: '#3E2723',
  },
};

// ─── Helper Functions ──────────────────────────────────────

function calculateFitzpatrickResult(answers: FitzpatrickAnswers): FitzpatrickResult {
  const values = [
    answers.eyeColor,
    answers.hairColor,
    answers.skinColor,
    answers.freckles,
    answers.sunResponse,
    answers.tanningAbility,
  ];
  const score = values.reduce((sum, val) => sum + (val ?? 0), 0);

  let type: FitzpatrickType;
  if (score <= 6) type = 'I';
  else if (score <= 10) type = 'II';
  else if (score <= 14) type = 'III';
  else if (score <= 18) type = 'IV';
  else if (score <= 22) type = 'V';
  else type = 'VI';

  const info = FITZPATRICK_SCALE[type];
  return {
    type,
    score,
    description: info.description,
    sunBurnTime: info.sunBurnTime,
    skinCancerRisk: info.skinCancerRisk,
    uvProtection: info.uvProtection,
  };
}

// ─── Component ─────────────────────────────────────────────

const FitzpatrickQuizScreen: React.FC = () => {
  const navigation = useNavigation<OnboardingNavigationProp>();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<FitzpatrickAnswers>({
    eyeColor: null,
    hairColor: null,
    skinColor: null,
    freckles: null,
    sunResponse: null,
    tanningAbility: null,
  });
  const [showResult, setShowResult] = useState(false);
  const [progressAnim] = useState(new Animated.Value(0));

  const totalSteps = FITZPATRICK_QUESTIONS.length;
  const isLastStep = currentStep === totalSteps - 1;
  const question = FITZPATRICK_QUESTIONS[currentStep];

  // Update progress bar
  React.useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: (currentStep + 1) / totalSteps,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentStep, totalSteps]);

  const handleSelect = useCallback(
    (score: number) => {
      setAnswers((prev) => ({ ...prev, [question.id]: score }));
    },
    [question.id]
  );

  const isSelected = useCallback(
    (score: number): boolean => answers[question.id] === score,
    [answers, question.id]
  );

  const canProceed = useCallback((): boolean => {
    return answers[question.id] !== null;
  }, [answers, question.id]);

  const handleNext = useCallback(() => {
    if (isLastStep) {
      setShowResult(true);
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  }, [isLastStep]);

  const handleBack = useCallback(() => {
    if (showResult) {
      setShowResult(false);
      return;
    }
    if (currentStep === 0) {
      navigation.goBack();
    } else {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep, navigation, showResult]);

  const handleSkip = useCallback(() => {
    Alert.alert(
      'Skip Fitzpatrick Assessment?',
      'Without this, your skin analysis may be less accurate, especially for UV-related recommendations. You can complete it later in settings.',
      [
        { text: 'Continue Assessment', style: 'cancel' },
        {
          text: 'Skip',
          style: 'default',
          onPress: () => navigation.navigate('ProfileSetup'),
        },
      ],
      { cancelable: true }
    );
  }, [navigation]);

  const handleContinueToProfile = useCallback(() => {
    navigation.navigate('ProfileSetup');
  }, [navigation]);

  const widthInterpolated = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  // ─── Result View ───────────────────────────────────────

  if (showResult) {
    const result = calculateFitzpatrickResult(answers);
    const scaleInfo = FITZPATRICK_SCALE[result.type];

    return (
      <SafeAreaView className="flex-1 bg-white">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="px-6 pt-4 pb-2">
            <TouchableOpacity
              onPress={handleBack}
              className="p-2 -ml-2 self-start"
              accessibilityLabel="Go back"
              accessibilityRole="button"
            >
              <Text className="text-teal-600 text-lg">← Back</Text>
            </TouchableOpacity>
          </View>

          <View className="px-6 pt-4">
            {/* Result Header */}
            <Text
              className="text-2xl font-bold text-gray-900 mb-2 text-center"
              accessibilityRole="header"
            >
              Your Fitzpatrick Skin Type
            </Text>
            <Text className="text-base text-gray-500 mb-6 text-center">
              This helps us personalize your UV protection and ingredient recommendations.
            </Text>

            {/* Type Badge */}
            <View className="items-center mb-6">
              <View
                className="w-24 h-24 rounded-full items-center justify-center mb-3"
                style={{ backgroundColor: scaleInfo.color }}
              >
                <Text className="text-3xl font-bold text-gray-900">
                  {result.type}
                </Text>
              </View>
              <Text className="text-lg font-semibold text-gray-900">
                {scaleInfo.label}
              </Text>
              <Text className="text-sm text-gray-500 mt-1">
                Score: {result.score} / 24
              </Text>
            </View>

            {/* Description Card */}
            <View className="p-4 rounded-xl bg-teal-50 border border-teal-100 mb-4">
              <Text className="text-sm font-medium text-teal-800 mb-1">
                Description
              </Text>
              <Text className="text-sm text-teal-700 leading-relaxed">
                {result.description}
              </Text>
            </View>

            {/* UV Info Grid */}
            <View className="flex-row flex-wrap -mx-1 mb-4">
              <View className="w-1/2 px-1 mb-2">
                <View className="p-3 rounded-xl bg-amber-50 border border-amber-100">
                  <Text className="text-xs font-medium text-amber-800 mb-1">
                    Sun Burn Time
                  </Text>
                  <Text className="text-sm text-amber-700 font-semibold">
                    {result.sunBurnTime}
                  </Text>
                </View>
              </View>
              <View className="w-1/2 px-1 mb-2">
                <View className="p-3 rounded-xl bg-rose-50 border border-rose-100">
                  <Text className="text-xs font-medium text-rose-800 mb-1">
                    Skin Cancer Risk
                  </Text>
                  <Text className="text-sm text-rose-700 font-semibold">
                    {result.skinCancerRisk}
                  </Text>
                </View>
              </View>
            </View>

            {/* UV Protection Recommendation */}
            <View className="p-4 rounded-xl bg-sky-50 border border-sky-100 mb-6">
              <Text className="text-sm font-medium text-sky-800 mb-1">
                🛡️ Recommended UV Protection
              </Text>
              <Text className="text-sm text-sky-700 leading-relaxed">
                {result.uvProtection}
              </Text>
            </View>

            {/* Why This Matters */}
            <View className="p-4 rounded-xl bg-gray-50 border border-gray-100 mb-6">
              <Text className="text-sm font-medium text-gray-800 mb-2">
                Why This Matters for Your Analysis
              </Text>
              <Text className="text-sm text-gray-600 leading-relaxed">
                Your Fitzpatrick type helps us calibrate ingredient sensitivities, predict how your skin reacts to actives like retinol and acids, and tailor UV protection advice. It also guides our risk assessment for procedures like chemical peels and laser treatments.
              </Text>
            </View>

            {/* Scale Visualization */}
            <Text className="text-sm font-medium text-gray-800 mb-3">
              Fitzpatrick Scale
            </Text>
            <View className="flex-row justify-between mb-8">
              {(Object.keys(FITZPATRICK_SCALE) as FitzpatrickType[]).map((t) => (
                <View key={t} className="items-center flex-1">
                  <View
                    className={`w-8 h-8 rounded-full items-center justify-center mb-1 ${
                      t === result.type
                        ? 'border-2 border-teal-600'
                        : 'border border-gray-200'
                    }`}
                    style={{ backgroundColor: FITZPATRICK_SCALE[t].color }}
                  >
                    {t === result.type && (
                      <Text className="text-teal-700 text-xs font-bold">✓</Text>
                    )}
                  </View>
                  <Text
                    className={`text-xs ${
                      t === result.type ? 'text-teal-700 font-bold' : 'text-gray-400'
                    }`}
                  >
                    {t}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Bottom Action */}
        <View className="px-6 py-4 border-t border-gray-100 bg-white">
          <TouchableOpacity
            onPress={handleContinueToProfile}
            className="w-full py-4 rounded-xl items-center bg-teal-600 active:bg-teal-700"
            accessibilityLabel="Continue to profile setup"
            accessibilityRole="button"
          >
            <Text className="font-semibold text-lg text-white">
              Continue to Profile
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Quiz View ─────────────────────────────────────────

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Progress Header */}
      <View className="px-6 pt-4 pb-2">
        <View className="flex-row items-center justify-between mb-3">
          <TouchableOpacity
            onPress={handleBack}
            className="p-2 -ml-2"
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <Text className="text-teal-600 text-lg">← Back</Text>
          </TouchableOpacity>

          <Text
            className="text-sm font-medium text-gray-500"
            accessibilityLabel={`Step ${currentStep + 1} of ${totalSteps}`}
          >
            Step {currentStep + 1} of {totalSteps}
          </Text>

          <TouchableOpacity
            onPress={handleSkip}
            className="p-2 -mr-2"
            accessibilityLabel="Skip assessment"
            accessibilityRole="button"
          >
            <Text className="text-gray-400 text-sm">Skip</Text>
          </TouchableOpacity>
        </View>

        {/* Progress Bar */}
        <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <Animated.View
            className="h-full bg-teal-600 rounded-full"
            style={{ width: widthInterpolated }}
          />
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 pt-6">
          {/* Question */}
          <Text
            className="text-2xl font-bold text-gray-900 mb-2"
            accessibilityRole="header"
          >
            {question.title}
          </Text>
          <Text className="text-base text-gray-500 mb-6">
            {question.subtitle}
          </Text>

          {/* Options List */}
          <View className="space-y-3">
            {question.options.map((option) => {
              const selected = isSelected(option.score);
              return (
                <TouchableOpacity
                  key={option.score}
                  onPress={() => handleSelect(option.score)}
                  className={`
                    p-4 rounded-xl border-2
                    ${
                      selected
                        ? 'border-teal-600 bg-teal-50'
                        : 'border-gray-200 bg-white'
                    }
                  `}
                  accessibilityLabel={option.label}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                >
                  <View className="flex-row items-center">
                    <View
                      className={`
                        w-5 h-5 rounded-full border-2 mr-3 items-center justify-center
                        ${
                          selected
                            ? 'border-teal-600 bg-teal-600'
                            : 'border-gray-300 bg-white'
                        }
                      `}
                    >
                      {selected && (
                        <View className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </View>
                    <Text
                      className={`
                        text-base font-medium flex-1
                        ${selected ? 'text-teal-700' : 'text-gray-700'}
                      `}
                    >
                      {option.label}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Info Note */}
          <View className="mt-6 p-3 rounded-lg bg-amber-50 border border-amber-100">
            <Text className="text-xs text-amber-700 leading-relaxed">
              💡 This assessment is based on the validated Fitzpatrick scale used by dermatologists worldwide. Your answers help us personalize ingredient recommendations and UV protection advice.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action */}
      <View className="px-6 py-4 border-t border-gray-100 bg-white">
        <TouchableOpacity
          onPress={handleNext}
          disabled={!canProceed()}
          className={`
            w-full py-4 rounded-xl items-center
            ${canProceed() ? 'bg-teal-600 active:bg-teal-700' : 'bg-gray-300'}
          `}
          accessibilityLabel={isLastStep ? 'See results' : 'Next step'}
          accessibilityRole="button"
          accessibilityState={{ disabled: !canProceed() }}
        >
          <Text className={`font-semibold text-lg ${canProceed() ? 'text-white' : 'text-gray-500'}`}>
            {isLastStep ? 'See Results' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default FitzpatrickQuizScreen;
