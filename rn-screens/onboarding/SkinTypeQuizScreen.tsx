import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { OnboardingNavigationProp } from './WelcomeScreen';

// ─── Types ───────────────────────────────────────────────

export interface QuizAnswers {
  skinType: string | null;
  concerns: string[];
  goals: string[];
}

export interface QuizStep {
  id: number;
  title: string;
  subtitle: string;
  type: 'single' | 'multi';
  field: keyof QuizAnswers;
  options: { id: string; label: string; icon: string }[];
}

// ─── Mock Data ─────────────────────────────────────────────

const QUIZ_STEPS: QuizStep[] = [
  {
    id: 1,
    title: "What's Your Skin Type?",
    subtitle: 'Choose the one that best describes your skin most of the time.',
    type: 'single',
    field: 'skinType',
    options: [
      { id: 'oily', label: 'Oily', icon: '💧' },
      { id: 'dry', label: 'Dry', icon: '🏜️' },
      { id: 'combination', label: 'Combination', icon: '⚖️' },
      { id: 'sensitive', label: 'Sensitive', icon: '🌸' },
      { id: 'normal', label: 'Normal', icon: '✨' },
    ],
  },
  {
    id: 2,
    title: 'Skin Concerns',
    subtitle: 'Select all that apply to you right now.',
    type: 'multi',
    field: 'concerns',
    options: [
      { id: 'acne', label: 'Acne & Breakouts', icon: '🔴' },
      { id: 'aging', label: 'Fine Lines & Wrinkles', icon: '⏳' },
      { id: 'redness', label: 'Redness & Rosacea', icon: '🌹' },
      { id: 'dark_spots', label: 'Dark Spots & Hyperpigmentation', icon: '🟤' },
      { id: 'pores', label: 'Large Pores', icon: '🔍' },
      { id: 'dryness', label: 'Dryness & Dehydration', icon: '🚰' },
      { id: 'oiliness', label: 'Excess Oil & Shine', icon: '💦' },
      { id: 'texture', label: 'Uneven Texture', icon: '📐' },
      { id: 'dark_circles', label: 'Dark Circles', icon: '👁️' },
    ],
  },
  {
    id: 3,
    title: 'Your Skincare Goals',
    subtitle: 'What do you want to achieve? Select all that apply.',
    type: 'multi',
    field: 'goals',
    options: [
      { id: 'clear_skin', label: 'Clear, blemish-free skin', icon: '🧼' },
      { id: 'anti_aging', label: 'Prevent or reduce signs of aging', icon: '🕐' },
      { id: 'even_tone', label: 'Even skin tone & brightness', icon: '☀️' },
      { id: 'hydration', label: 'Deep hydration & plumpness', icon: '💧' },
      { id: 'pore_minimizing', label: 'Minimize pore appearance', icon: '✨' },
      { id: 'soothing', label: 'Calm sensitive, irritated skin', icon: '🌿' },
      { id: 'firmness', label: 'Improve firmness & elasticity', icon: '🏋️' },
      { id: 'radiance', label: 'Overall glow & radiance', icon: '💎' },
    ],
  },
];

// ─── Component ─────────────────────────────────────────────

const SkinTypeQuizScreen: React.FC = () => {
  const navigation = useNavigation<OnboardingNavigationProp>();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({
    skinType: null,
    concerns: [],
    goals: [],
  });
  const [progressAnim] = useState(new Animated.Value(0));

  const step = QUIZ_STEPS[currentStep];
  const totalSteps = QUIZ_STEPS.length;
  const isLastStep = currentStep === totalSteps - 1;

  // Update progress bar
  React.useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: (currentStep + 1) / totalSteps,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentStep, totalSteps]);

  const handleSelect = useCallback(
    (optionId: string) => {
      const field = step.field;

      if (step.type === 'single') {
        setAnswers((prev) => ({ ...prev, [field]: optionId }));
      } else {
        setAnswers((prev) => {
          const current = prev[field] as string[];
          const updated = current.includes(optionId)
            ? current.filter((id) => id !== optionId)
            : [...current, optionId];
          return { ...prev, [field]: updated };
        });
      }
    },
    [step]
  );

  const isSelected = useCallback(
    (optionId: string): boolean => {
      const value = answers[step.field];
      if (step.type === 'single') {
        return value === optionId;
      }
      return (value as string[]).includes(optionId);
    },
    [answers, step]
  );

  const canProceed = useCallback((): boolean => {
    const value = answers[step.field];
    if (step.type === 'single') {
      return value !== null;
    }
    return (value as string[]).length > 0;
  }, [answers, step]);

  const handleNext = useCallback(() => {
    if (isLastStep) {
      // All steps complete — navigate to Fitzpatrick quiz
      navigation.navigate('FitzpatrickQuiz');
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  }, [isLastStep, navigation]);

  const handleBack = useCallback(() => {
    if (currentStep === 0) {
      navigation.goBack();
    } else {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep, navigation]);

  const widthInterpolated = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

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
            {step.title}
          </Text>
          <Text className="text-base text-gray-500 mb-6">
            {step.subtitle}
          </Text>

          {/* Options Grid */}
          <View className="flex-row flex-wrap -mx-1">
            {step.options.map((option) => {
              const selected = isSelected(option.id);
              return (
                <View key={option.id} className="w-1/2 px-1 mb-3">
                  <TouchableOpacity
                    onPress={() => handleSelect(option.id)}
                    className={`
                      p-4 rounded-xl border-2 items-center
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
                    <Text className="text-2xl mb-2">{option.icon}</Text>
                    <Text
                      className={`
                        text-sm font-medium text-center leading-tight
                        ${selected ? 'text-teal-700' : 'text-gray-700'}
                      `}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>

          {/* Multi-select hint */}
          {step.type === 'multi' && (
            <Text className="text-xs text-gray-400 text-center mt-2">
              Tap to select multiple options
            </Text>
          )}
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
          accessibilityLabel={isLastStep ? 'Continue to Fitzpatrick assessment' : 'Next step'}
          accessibilityRole="button"
          accessibilityState={{ disabled: !canProceed() }}
        >
          <Text className={`font-semibold text-lg ${canProceed() ? 'text-white' : 'text-gray-500'}`}>
            {isLastStep ? 'Continue' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default SkinTypeQuizScreen;
