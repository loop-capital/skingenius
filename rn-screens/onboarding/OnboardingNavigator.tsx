import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import WelcomeScreen from './WelcomeScreen';
import SkinTypeQuizScreen from './SkinTypeQuizScreen';
import FitzpatrickQuizScreen from './FitzpatrickQuizScreen';
import ProfileSetupScreen from './ProfileSetupScreen';
import OnboardingCompleteScreen from './OnboardingCompleteScreen';

// ─── Navigation Types ──────────────────────────────────────

export type OnboardingStackParamList = {
  Welcome: undefined;
  SkinTypeQuiz: undefined;
  FitzpatrickQuiz: undefined;
  ProfileSetup: undefined;
  OnboardingComplete: undefined;
};

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

// ─── Navigator ─────────────────────────────────────────────

const OnboardingNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
      initialRouteName="Welcome"
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="SkinTypeQuiz" component={SkinTypeQuizScreen} />
      <Stack.Screen name="FitzpatrickQuiz" component={FitzpatrickQuizScreen} />
      <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
      <Stack.Screen name="OnboardingComplete" component={OnboardingCompleteScreen} />
    </Stack.Navigator>
  );
};

export default OnboardingNavigator;
