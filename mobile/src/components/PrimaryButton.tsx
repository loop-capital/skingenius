// SKINgenius — Primary Button Component
// Pill-shaped emerald gradient button
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Spacing, Radii, Typography } from '../constants/theme';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'gold' | 'secondary';
}

export function PrimaryButton({ title, onPress, disabled, variant = 'primary' }: PrimaryButtonProps) {
  const buttonStyle = [
    styles.button,
    variant === 'gold' && styles.buttonGold,
    variant === 'secondary' && styles.buttonSecondary,
    disabled && styles.buttonDisabled,
  ];

  const textStyle = [
    styles.text,
    variant === 'gold' && styles.textGold,
    variant === 'secondary' && styles.textSecondary,
    disabled && styles.textDisabled,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={textStyle}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.primary,
    borderRadius: Radii.pill,
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.xl,
    marginHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  buttonGold: {
    backgroundColor: Colors.tertiary,
  },
  buttonSecondary: {
    backgroundColor: Colors.surfaceCard,
    borderWidth: 1.5,
    borderColor: Colors.hairline,
  },
  buttonDisabled: {
    backgroundColor: Colors.hairline,
  },
  text: {
    ...Typography.body,
    color: Colors.inkInverse,
    fontWeight: '600',
  },
  textGold: {
    color: Colors.inkInverse,
  },
  textSecondary: {
    color: Colors.ink,
  },
  textDisabled: {
    color: Colors.inkMuted,
  },
});
