// SKINgenius — Selection Card Component
// White pill-shaped card with selection indicator (Lovi.care pattern)
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Spacing, Radii, Typography, Shadows } from '../constants/theme';

interface SelectionCardProps {
  title: string;
  subtitle?: string;
  icon?: string;
  selected?: boolean;
  onPress: () => void;
}

export function SelectionCard({ title, subtitle, icon, selected, onPress }: SelectionCardProps) {
  return (
    <TouchableOpacity
      style={[styles.card, selected && styles.cardSelected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {icon && <Text style={styles.icon}>{icon}</Text>}
      <View style={styles.textContainer}>
        <Text style={[styles.title, selected && styles.titleSelected]}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected && <Text style={styles.checkmark}>✓</Text>}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceCard,
    borderRadius: Radii.lg,
    padding: Spacing.base,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    borderWidth: 1.5,
    borderColor: Colors.hairline,
    ...Shadows.card,
  },
  cardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary50,
  },
  icon: {
    fontSize: 24,
    marginRight: Spacing.sm,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    ...Typography.body,
    color: Colors.ink,
    fontWeight: '500',
  },
  titleSelected: {
    color: Colors.primaryActive,
    fontWeight: '600',
  },
  subtitle: {
    ...Typography.bodySm,
    color: Colors.inkSecondary,
    marginTop: 2,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: Radii.full,
    borderWidth: 2,
    borderColor: Colors.hairline,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.sm,
  },
  radioSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkmark: {
    color: Colors.inkInverse,
    fontSize: 14,
    fontWeight: '700',
  },
});
