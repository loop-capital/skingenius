// SKINgenius — Data Card Component
// Displays metric cards (UV index, humidity, health data)
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, Radii, Typography, Shadows } from '../constants/theme';

interface DataCardProps {
  icon: string;
  label: string;
  value: string;
  color?: string;
}

export function DataCard({ icon, label, value, color = Colors.primary }: DataCardProps) {
  return (
    <View style={styles.card}>
      <View style={[styles.iconCircle, { backgroundColor: color + '20' }]}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: Radii.md,
    padding: Spacing.sm,
    alignItems: 'center',
    flex: 1,
    ...Shadows.card,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: Radii.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  icon: {
    fontSize: 20,
  },
  value: {
    ...Typography.subhead,
    color: Colors.ink,
    fontWeight: '700',
  },
  label: {
    ...Typography.caption,
    color: Colors.inkMuted,
    textAlign: 'center',
  },
});
