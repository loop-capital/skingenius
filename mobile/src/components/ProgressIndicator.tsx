// SKINgenius — Progress Indicator
// Step progress bar for onboarding/quiz flow
import { View, StyleSheet } from 'react-native';
import { Colors, Spacing, Radii } from '../constants/theme';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export function ProgressIndicator({ currentStep, totalSteps }: ProgressIndicatorProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: totalSteps }, (_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            i < currentStep && styles.dotCompleted,
            i === currentStep && styles.dotActive,
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: Radii.full,
    backgroundColor: Colors.hairline,
  },
  dotCompleted: {
    backgroundColor: Colors.primary,
    width: 24,
  },
  dotActive: {
    backgroundColor: Colors.primary,
    width: 32,
  },
});
