import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';

interface SkinScoreCardProps {
  score: number;           // 0-100 skin health score
  label?: string;          // e.g., "Overall Skin Health"
  size?: number;           // Diameter of the circle (default: 160)
  strokeWidth?: number;    // Thickness of the ring (default: 12)
  animationDuration?: number; // ms (default: 1500)
}

/**
 * SkinScoreCard — Animated circular score display
 *
 * Renders a ring chart (progress circle) that animates from 0 to the
 * target score.  Color coding:
 *   0–39  → red    (needs attention)
 *   40–69 → amber  (moderate)
 *   70–89 → green  (good)
 *   90–100→ emerald(excellent)
 */
export const SkinScoreCard: React.FC<SkinScoreCardProps> = ({
  score,
  label = 'Skin Score',
  size = 160,
  strokeWidth = 12,
  animationDuration = 1500,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  // Animate the arc on mount / when score changes
  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: score,
      duration: animationDuration,
      useNativeDriver: true,
    }).start();
  }, [score]);

  // Interpolate animated value to rotation (0 → 360°)
  const rotation = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: ['0deg', '360deg'],
  });

  // Color based on score bands
  const color =
    score >= 90
      ? '#10b981' // emerald-500
      : score >= 70
      ? '#22c55e' // green-500
      : score >= 40
      ? '#f59e0b' // amber-500
      : '#ef4444'; // red-500

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  return (
    <View className="items-center justify-center p-4 bg-white rounded-2xl shadow-sm">
      <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
        {/* Background ring */}
        <View
          style={[
            styles.ring,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: strokeWidth,
              borderColor: '#e5e7eb', // gray-200
            },
          ]}
        />

        {/* Animated progress ring */}
        <View
          style={[
            styles.ring,
            styles.progressRing,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: strokeWidth,
              borderColor: color,
              borderDasharray: [circumference, circumference],
              borderDashoffset: circumference - progress,
            },
          ]}
        />

        {/* Score text */}
        <View className="absolute items-center">
          <Text className="text-4xl font-bold text-slate-900">{Math.round(score)}</Text>
          <Text className="text-xs text-slate-500 uppercase tracking-wider mt-1">{label}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  ring: {
    position: 'absolute',
  },
  progressRing: {
    transform: [{ rotate: '-90deg' }],
  },
});

/* ------------------------------------------------------------------ */
// Mock data for Storybook / dev preview
export const SkinScoreCardMock: React.FC = () => (
  <View className="space-y-4">
    <SkinScoreCard score={94} label="Excellent" />
    <SkinScoreCard score={72} label="Good" />
    <SkinScoreCard score={55} label="Moderate" />
    <SkinScoreCard score={32} label="Needs Care" />
  </View>
);
