// Onboarding Screens — SKINgenius
// Medical-grade onboarding flow with safety-first design

export { default as WelcomeScreen } from './WelcomeScreen';
export { default as SkinTypeQuizScreen } from './SkinTypeQuizScreen';
export { default as FitzpatrickQuizScreen } from './FitzpatrickQuizScreen';
export { default as ProfileSetupScreen } from './ProfileSetupScreen';
export { default as OnboardingCompleteScreen } from './OnboardingCompleteScreen';
export { default as OnboardingNavigator } from './OnboardingNavigator';

// Re-export types for external use
export type { QuizAnswers, QuizStep } from './SkinTypeQuizScreen';
export type { UserProfile } from './ProfileSetupScreen';
export type { OnboardingStackParamList } from './OnboardingNavigator';
export type { FitzpatrickAnswers, FitzpatrickResult, FitzpatrickType } from './FitzpatrickQuizScreen';
