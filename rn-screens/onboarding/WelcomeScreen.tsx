import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Mock navigation type - replace with actual route params
export type OnboardingStackParamList = {
  Welcome: undefined;
  SkinTypeQuiz: undefined;
  FitzpatrickQuiz: undefined;
  ProfileSetup: undefined;
  OnboardingComplete: undefined;
};

export type OnboardingNavigationProp = NativeStackNavigationProp<OnboardingStackParamList>;

const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation<OnboardingNavigationProp>();

  const handleGetStarted = () => {
    navigation.navigate('SkinTypeQuiz');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        accessibilityLabel="Welcome screen scroll view"
      >
        <View className="flex-1 px-6 py-8 justify-between">
          {/* Hero Section */}
          <View className="items-center mt-8">
            {/* Hero image — attractive African American professional, signals higher Fitzpatrick inclusivity */}
            <Image
              source={require('../../../public/assets/kora-hero.jpg')}
              className="w-56 h-56 rounded-full mb-6"
              style={{ resizeMode: 'cover' }}
              accessibilityLabel="SKINgenius — skin health for every tone"
              accessibilityRole="image"
            />

            <Text
              className="text-3xl font-bold text-gray-900 text-center mb-3"
              accessibilityRole="header"
            >
              Welcome to SKINgenius
            </Text>

            <Text className="text-base text-gray-600 text-center leading-relaxed px-2">
              Your personal AI dermatologist. Get medical-grade skin analysis and evidence-based skincare recommendations tailored just for you.
            </Text>
          </View>

          {/* Value Propositions */}
          <View className="space-y-4 my-8">
            <View className="flex-row items-start space-x-3">
              <View className="w-10 h-10 rounded-full bg-teal-100 items-center justify-center">
                <Text className="text-lg">🔬</Text>
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-gray-900 text-base">Science-Backed Analysis</Text>
                <Text className="text-gray-600 text-sm mt-0.5">
                  Every recommendation is grounded in clinical research and dermatological evidence.
                </Text>
              </View>
            </View>

            <View className="flex-row items-start space-x-3">
              <View className="w-10 h-10 rounded-full bg-rose-100 items-center justify-center">
                <Text className="text-lg">🛡️</Text>
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-gray-900 text-base">Safety First</Text>
                <Text className="text-gray-600 text-sm mt-0.5">
                  We flag ingredient interactions, pregnancy risks, and allergies before you apply anything.
                </Text>
              </View>
            </View>

            <View className="flex-row items-start space-x-3">
              <View className="w-10 h-10 rounded-full bg-amber-100 items-center justify-center">
                <Text className="text-lg">✨</Text>
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-gray-900 text-base">Personalized for You</Text>
                <Text className="text-gray-600 text-sm mt-0.5">
                  Your skin is unique. Your routine should be too. We build regimens around your specific needs.
                </Text>
              </View>
            </View>

            <View className="flex-row items-start space-x-3">
              <View className="w-10 h-10 rounded-full bg-sky-100 items-center justify-center">
                <Text className="text-lg">📈</Text>
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-gray-900 text-base">Track Your Progress</Text>
                <Text className="text-gray-600 text-sm mt-0.5">
                  Log your skin journey, track improvements, and adjust your routine as your skin evolves.
                </Text>
              </View>
            </View>
          </View>

          {/* CTA Section */}
          <View className="mt-auto">
            <TouchableOpacity
              onPress={handleGetStarted}
              className="w-full bg-teal-600 py-4 rounded-xl items-center active:bg-teal-700"
              accessibilityLabel="Get Started button"
              accessibilityRole="button"
              accessibilityHint="Navigate to skin type quiz"
            >
              <Text className="text-white font-semibold text-lg">Get Started</Text>
            </TouchableOpacity>

            <Text className="text-xs text-gray-400 text-center mt-4 px-4">
              By continuing, you agree that SKINgenius provides information only and does not replace professional medical advice.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default WelcomeScreen;
