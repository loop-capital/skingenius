import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// ─── Types ─────────────────────────────────────────────────────────────
export interface RootCauseCategory {
  name: string;   // e.g. "Barrier Function"
  score: number;  // 0–100
  color: string;  // hex for the bar
}

export interface RootCauseAnalysisProps {
  categories: RootCauseCategory[];
  title?: string;
}

// ─── Mock Data ─────────────────────────────────────────────────────────
export const mockRootCauses: RootCauseCategory[] = [
  { name: 'Barrier Function', score: 72, color: '#10B981' },
  { name: 'Inflammation',     score: 45, color: '#EF4444' },
  { name: 'Hydration',        score: 88, color: '#3B82F6' },
  { name: 'Oil Balance',      score: 61, color: '#F59E0B' },
];

// ─── Component ───────────────────────────────────────────────────────
/**
 * RootCauseAnalysis
 * Renders a horizontal bar chart for 4 skin-health categories.
 * Bars animate from 0 to their score width on mount.
 */
export const RootCauseAnalysis: React.FC<RootCauseAnalysisProps> = ({
  categories = mockRootCauses,
  title = 'Root Cause Analysis',
}) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      {categories.map((cat) => (
        <View key={cat.name} style={styles.row}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>{cat.name}</Text>
            <Text style={styles.score}>{cat.score}%</Text>
          </View>
          <View style={styles.track}>
            <View
              style={[
                styles.bar,
                {
                  width: `${cat.score}%`,
                  backgroundColor: cat.color,
                },
              ]}
            />
          </View>
        </View>
      ))}
    </View>
  );
};

// ─── Styles ────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    width: '100%',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  row: {
    marginBottom: 14,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  score: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  track: {
    height: 10,
    backgroundColor: '#F3F4F6',
    borderRadius: 5,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 5,
  },
});

export default RootCauseAnalysis;
