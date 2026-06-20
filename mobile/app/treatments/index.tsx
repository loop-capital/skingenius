import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Radii, Typography, Shadows } from '../../src/constants/theme';
import { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

// TODO: Replace with Supabase call
const mockTreatments = [
  { id: '1', name: 'Botox - Forehead', provider: 'Dr. Smith', date: '2026-06-01', cost: 450, category: 'Injectables' },
  { id: '2', name: 'CoolSculpting - Abdomen', provider: 'Glow Aesthetics', date: '2026-05-15', cost: 1200, category: 'Body' },
  { id: '3', name: 'HydraFacial', provider: 'Skin Spa', date: '2026-04-22', cost: 199, category: 'Skincare' },
];

const categoryFilters = ['All', 'Injectables', 'Laser', 'Body', 'Skincare', 'Supplements', 'GLP-1', 'Wellness'];
const categoryIcons: Record<string, string> = {
  Injectables: '💉',
  Laser: '⚡',
  Body: '🏋️',
  Skincare: '🧴',
  Supplements: '💊',
  'GLP-1': '📉',
  Wellness: '🧘',
};

export default function TreatmentsScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState('All');
  const [refreshing, setRefreshing] = useState(false);
  const [treatments, setTreatments] = useState(mockTreatments);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  }, []);

  const filtered = activeFilter === 'All' ? treatments : treatments.filter((t) => t.category === activeFilter);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Treatment History</Text>
          <Text style={styles.subtitle}>Log and review every treatment.</Text>
        </View>

        {/* Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          {categoryFilters.map((chip) => (
            <TouchableOpacity
              key={chip}
              style={[styles.chip, activeFilter === chip && styles.chipActive]}
              onPress={() => setActiveFilter(chip)}
            >
              <Text style={[styles.chipText, activeFilter === chip && styles.chipTextActive]}>
                {chip}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Empty State */}
        {filtered.length === 0 && (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>📋</Text>
            <Text style={styles.emptyTitle}>No treatments logged yet.</Text>
            <Text style={styles.emptyBody}>Tap + to log your first treatment.</Text>
          </View>
        )}

        {/* Timeline by Month */}
        {filtered.length > 0 && (
          <View style={styles.timelineSection}>
            <Text style={styles.groupLabel}>This Month</Text>
            {filtered.map((t) => (
              <TouchableOpacity
                key={t.id}
                style={styles.treatmentCard}
                onPress={() => router.push(`/treatments/${t.id}`)}
              >
                <View style={styles.cardRow}>
                  <View style={styles.iconCircle}>
                    <Text style={styles.icon}>{categoryIcons[t.category] || '🧴'}</Text>
                  </View>
                  <View style={styles.cardText}>
                    <Text style={styles.cardTitle}>{t.name}</Text>
                    <Text style={styles.cardMeta}>{t.provider} · {t.date}</Text>
                  </View>
                  <Text style={styles.cardCost}>${t.cost}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity style={styles.fab} onPress={() => router.push('/treatments/new')}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.canvas },
  header: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: Spacing.md },
  title: { ...Typography.displayMd, color: Colors.ink, fontSize: 28, marginBottom: Spacing.xs },
  subtitle: { ...Typography.bodySm, color: Colors.inkSecondary },
  chipRow: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.base, gap: Spacing.xs },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radii.pill,
    backgroundColor: Colors.surfaceCard,
    borderWidth: 1,
    borderColor: Colors.hairline,
    marginRight: Spacing.xs,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { ...Typography.caption, color: Colors.inkSecondary, fontWeight: '500' },
  chipTextActive: { color: Colors.inkInverse },
  timelineSection: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.section },
  groupLabel: { ...Typography.captionUppercase, color: Colors.inkMuted, marginBottom: Spacing.sm, marginTop: Spacing.md },
  treatmentCard: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: Radii.lg,
    padding: Spacing.base,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.hairline,
    ...Shadows.card,
  },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  iconCircle: {
    width: 44, height: 44, borderRadius: Radii.lg,
    backgroundColor: Colors.primary50,
    justifyContent: 'center', alignItems: 'center',
  },
  icon: { fontSize: 20 },
  cardText: { flex: 1, marginLeft: Spacing.sm },
  cardTitle: { ...Typography.body, color: Colors.ink, fontWeight: '600' },
  cardMeta: { ...Typography.caption, color: Colors.inkSecondary, marginTop: 2 },
  cardCost: { ...Typography.subhead, color: Colors.ink, fontWeight: '700' },
  emptyCard: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: Radii.lg,
    padding: Spacing.xl,
    marginHorizontal: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.hairline,
    ...Shadows.card,
  },
  emptyEmoji: { fontSize: 40, marginBottom: Spacing.sm },
  emptyTitle: { ...Typography.subhead, color: Colors.ink, marginBottom: Spacing.xs },
  emptyBody: { ...Typography.bodySm, color: Colors.inkSecondary, textAlign: 'center' },
  fab: {
    position: 'absolute',
    right: Spacing.lg,
    bottom: Spacing.xl + 20,
    width: 56,
    height: 56,
    borderRadius: Radii.full,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.glow,
  },
  fabText: { color: Colors.inkInverse, fontSize: 28, fontWeight: '300' },
});
