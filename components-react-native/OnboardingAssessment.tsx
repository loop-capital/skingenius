import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// SKINgenius Onboarding Assessment
// Inspired by Lovi.care — conversational, one-question-at-a-time
// Maps answers to root causes for recommendation engine

const SkinTypeQuestion = {
  id: 'skin_type',
  question: 'What would you say your skin type is?',
  options: [
    {
      id: 'oily',
      label: 'Oily',
      description: 'Excess amount of sebum (oil), shiny, and enlarged pores.',
      icon: 'water-outline',
      rootCauseHints: ['androgen_excess', 'insulin_resistance'],
    },
    {
      id: 'dry',
      label: 'Dry',
      description: 'Lacks moisture, tends to feel tight, dull appearance, flakiness.',
      icon: 'sunny-outline',
      rootCauseHints: ['cortisol_excess', 'thyroid_dysfunction', 'nutrient_deficiency'],
    },
    {
      id: 'normal',
      label: 'Normal',
      description: 'Neither excessively oily nor overly dry, smooth texture, small pores.',
      icon: 'happy-outline',
      rootCauseHints: [],
    },
    {
      id: 'combination',
      label: 'Combination',
      description: 'T-zone (forehead, nose, and chin) oiliness, visible pores.',
      icon: 'git-merge-outline',
      rootCauseHints: ['hormonal_imbalance'],
    },
  ],
};

const SensitivityQuestion = {
  id: 'sensitivity',
  question: 'Would you consider your skin sensitive?',
  options: [
    {
      id: 'sensitive',
      label: 'Sensitive',
      description: 'My skin has reacted negatively to some skincare in the past.',
      icon: 'leaf-outline',
      rootCauseHints: ['gut_dysbiosis', 'leaky_gut', 'chronic_inflammation'],
    },
    {
      id: 'non_sensitive',
      label: 'Non-sensitive',
      description: 'My skin shows no reaction to certain ingredients.',
      icon: 'shield-checkmark-outline',
      rootCauseHints: [],
    },
  ],
};

const ChronicConditionsQuestion = {
  id: 'chronic_conditions',
  question: 'Do you have any of the following chronic conditions?',
  questionHighlight: 'chronic conditions',
  multiSelect: true,
  options: [
    { id: 'rosacea', label: 'Rosacea', rootCauseHints: ['sibo', 'gut_dysbiosis', 'cortisol_excess'] },
    { id: 'eczema', label: 'Eczema', rootCauseHints: ['gut_dysbiosis', 'leaky_gut', 'cortisol_excess'] },
    { id: 'psoriasis', label: 'Psoriasis', rootCauseHints: ['chronic_inflammation', 'gut_dysbiosis'] },
    { id: 'atopic_dermatitis', label: 'Atopic Dermatitis', rootCauseHints: ['gut_dysbiosis', 'leaky_gut'] },
    { id: 'none', label: "No, I don't", rootCauseHints: [], exclusive: true },
  ],
};

const GutSymptomsQuestion = {
  id: 'gut_symptoms',
  question: 'Do you experience any digestive issues?',
  questionHighlight: 'digestive issues',
  multiSelect: true,
  options: [
    { id: 'bloating', label: 'Bloating', rootCauseHints: ['gut_dysbiosis', 'sibo'] },
    { id: 'ibs', label: 'IBS symptoms', rootCauseHints: ['gut_dysbiosis', 'leaky_gut', 'sibo'] },
    { id: 'food_sensitivities', label: 'Food sensitivities', rootCauseHints: ['leaky_gut', 'gut_dysbiosis'] },
    { id: 'constipation', label: 'Constipation', rootCauseHints: ['gut_dysbiosis', 'thyroid_dysfunction'] },
    { id: 'none', label: "No, I don't", rootCauseHints: [], exclusive: true },
  ],
};

const StressSleepQuestion = {
  id: 'stress_sleep',
  question: 'How are your stress and sleep levels?',
  multiSelect: true,
  options: [
    { id: 'high_stress', label: 'High stress', rootCauseHints: ['cortisol_excess', 'chronic_inflammation'] },
    { id: 'poor_sleep', label: 'Poor sleep', rootCauseHints: ['cortisol_excess', 'chronic_inflammation'] },
    { id: 'anxiety', label: 'Anxiety', rootCauseHints: ['cortisol_excess', 'gut_dysbiosis'] },
    { id: 'none', label: "None of these", rootCauseHints: [], exclusive: true },
  ],
};

const QUESTIONS = [
  SkinTypeQuestion,
  SensitivityQuestion,
  ChronicConditionsQuestion,
  GutSymptomsQuestion,
  StressSleepQuestion,
];

export default function OnboardingAssessment({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selectedOptions, setSelectedOptions] = useState([]);

  const currentQuestion = QUESTIONS[currentStep];
  const progress = ((currentStep + 1) / QUESTIONS.length) * 100;

  const handleSelect = (optionId) => {
    const option = currentQuestion.options.find(o => o.id === optionId);
    
    if (currentQuestion.multiSelect) {
      if (option.exclusive) {
        // Selecting "none" clears all other selections
        setSelectedOptions([optionId]);
      } else {
        // Remove "none" if selecting something else
        const withoutNone = selectedOptions.filter(id => {
          const opt = currentQuestion.options.find(o => o.id === id);
          return !opt?.exclusive;
        });
        
        if (selectedOptions.includes(optionId)) {
          setSelectedOptions(withoutNone.filter(id => id !== optionId));
        } else {
          setSelectedOptions([...withoutNone, optionId]);
        }
      }
    } else {
      // Single select — immediate advance
      const newAnswers = {
        ...answers,
        [currentQuestion.id]: optionId,
      };
      setAnswers(newAnswers);
      
      if (currentStep < QUESTIONS.length - 1) {
        setCurrentStep(currentStep + 1);
        setSelectedOptions([]);
      } else {
        onComplete(newAnswers);
      }
    }
  };

  const handleContinue = () => {
    const newAnswers = {
      ...answers,
      [currentQuestion.id]: selectedOptions,
    };
    setAnswers(newAnswers);
    
    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
      setSelectedOptions([]);
    } else {
      onComplete(newAnswers);
    }
  };

  const isContinueEnabled = currentQuestion.multiSelect 
    ? selectedOptions.length > 0 
    : true;

  const renderQuestion = () => {
    const parts = currentQuestion.question.split(currentQuestion.questionHighlight || '');
    
    return (
      <Text style={styles.questionText}>
        {parts[0]}
        {currentQuestion.questionHighlight && (
          <Text style={styles.questionHighlight}>{currentQuestion.questionHighlight}</Text>
        )}
        {parts[1] || ''}
      </Text>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#5A6B7F" />
        </TouchableOpacity>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </View>

      {/* Avatar + Question */}
      <View style={styles.chatContainer}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Ionicons name="happy-outline" size={32} color="#2CD674" />
          </View>
        </View>
        
        <View style={styles.messageBubble}>
          {renderQuestion()}
        </View>
      </View>

      {/* Options */}
      <ScrollView style={styles.optionsContainer} showsVerticalScrollIndicator={false}>
        {currentQuestion.options.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.optionCard,
              selectedOptions.includes(option.id) && styles.optionCardSelected,
            ]}
            onPress={() => handleSelect(option.id)}
            activeOpacity={0.7}
          >
            <View style={styles.optionContent}>
              {option.icon && (
                <View style={styles.optionIcon}>
                  <Ionicons name={option.icon} size={24} color="#0A2647" />
                </View>
              )}
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionLabel}>{option.label}</Text>
                {option.description && (
                  <Text style={styles.optionDescription}>{option.description}</Text>
                )}
              </View>
            </View>
            <View style={[
              styles.radioCircle,
              selectedOptions.includes(option.id) && styles.radioCircleSelected,
            ]}>
              {selectedOptions.includes(option.id) && (
                <View style={styles.radioInner} />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Continue Button */}
      {currentQuestion.multiSelect && (
        <TouchableOpacity
          style={[
            styles.continueButton,
            !isContinueEnabled && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!isContinueEnabled}
        >
          <Text style={[
            styles.continueButtonText,
            !isContinueEnabled && styles.continueButtonTextDisabled,
          ]}>
            Continue
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F6F3', // SKINgenius neutral
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#E8E4E0',
    borderRadius: 2,
    marginLeft: 16,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2CD674', // SKINgenius accent
    borderRadius: 2,
  },
  chatContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 24,
    alignItems: 'flex-start',
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  messageBubble: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderTopLeftRadius: 4,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0A2647', // SKINgenius primary
    lineHeight: 26,
  },
  questionHighlight: {
    color: '#4A90D9', // SKINgenius info blue (like Lovi's highlight)
  },
  optionsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionCardSelected: {
    borderColor: '#2CD674', // SKINgenius accent
    backgroundColor: '#F0FDF4', // Light green tint
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F0EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0A2647',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 13,
    color: '#8A96A6', // SKINgenius text-tertiary
    lineHeight: 18,
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  radioCircleSelected: {
    borderColor: '#2CD674',
    backgroundColor: '#2CD674',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
  },
  continueButton: {
    backgroundColor: '#0A2647', // SKINgenius primary
    borderRadius: 28,
    paddingVertical: 16,
    marginHorizontal: 20,
    marginBottom: 32,
    alignItems: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: '#E8E4E0',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  continueButtonTextDisabled: {
    color: '#8A96A6',
  },
});
