import { View, Text, StyleSheet, Animated } from 'react-native';
import { Colors, Spacing, Radii, Typography, Shadows } from '../constants/theme';
import { useEffect, useRef } from 'react';

interface AchievementBadgeProps {
  icon: string;
  name: string;
  description?: string;
  progress: number; // 0-100
  threshold?: number;
  unlocked?: boolean;
}

export function AchievementBadge({
  icon,
  name,
  description,
  progress,
  threshold = 100,
  unlocked = false,
}: AchievementBadgeProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (unlocked) {
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.08, duration: 200, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1.0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [unlocked, scaleAnim]);

  const pct = Math.min(100, Math.round((progress / threshold) * 100));

  return (
    <Animated.View
      style={[
        styles.card,
        unlocked ? styles.cardUnlocked : styles.cardLocked,
        { transform: [{ scale: scaleAnim }] },
      ]}
    >
      <View style={[styles.iconCircle, unlocked ? styles.iconCircleUnlocked : styles.iconCircleLocked]}>
        <Text style={[styles.icon, unlocked ? styles.iconUnlocked : styles.iconLocked]}>{icon}</Text>
      </View>

      <View style={styles.text}>
        <Text style={[styles.name, unlocked ? styles.nameUnlocked : styles.nameLocked]}>{name}</Text>
        {description && (
          <Text style={styles.description}>{description}</Text>
        )}

        <View style={styles.barWrap}>
          <View style={[styles.bar, { width: `${pct}%` }, unlocked && styles.barUnlocked]} />
        </View>
        <Text style={styles.progressText}>
          {unlocked ? 'Unlocked!' : `${progress} / ${threshold}`}
        </Text>
      </View>

      {unlocked && <View style={styles.glow} />}
    </Animated.View>
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
    overflow: 'hidden',
  },
  cardUnlocked: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary50,
  },
  cardLocked: {
    opacity: 0.85,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: Radii.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  iconCircleUnlocked: { backgroundColor: Colors.primary },
  iconCircleLocked: { backgroundColor: Colors.surfaceMuted },
  icon: { fontSize: 24 },
  iconUnlocked: { opacity: 1 },
  iconLocked: { opacity: 0.5 },
  text: { flex: 1 },
  name: { ...Typography.body, fontWeight: '600', marginBottom: 2 },
  nameUnlocked: { color: Colors.primaryActive },
  nameLocked: { color: Colors.inkSecondary },
  description: { ...Typography.caption, color: Colors.inkMuted, marginBottom: Spacing.xs },
  barWrap: {
    height: 6,
    borderRadius: Radii.pill,
    backgroundColor: Colors.hairline,
    overflow: 'hidden',
    marginTop: Spacing.xs,
  },
  bar: {
    height: 6,
    borderRadius: Radii.pill,
    backgroundColor: Colors.inkMuted,
  },
  barUnlocked: { backgroundColor: Colors.primary },
  progressText: { ...Typography.caption, color: Colors.inkMuted, marginTop: 2 },
  glow: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 60,
    height: 60,
    borderRadius: Radii.full,
    backgroundColor: Colors.primary,
    opacity: 0.06,
  },
});
