import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Radii, Typography, Shadows } from '../../src/constants/theme';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';

const { width } = Dimensions.get('window');
const photoSize = (width - Spacing.lg * 2 - Spacing.sm * 2) / 3;

// TODO: Replace with Supabase call
const mockPhotos = [
  { id: 'p1', url: '', type: 'before', area: 'Face', date: '2026-05-01' },
  { id: 'p2', url: '', type: 'progress', area: 'Face', date: '2026-05-15' },
  { id: 'p3', url: '', type: 'after', area: 'Face', date: '2026-06-01' },
  { id: 'p4', url: '', type: 'before', area: 'Neck', date: '2026-04-10' },
  { id: 'p5', url: '', type: 'after', area: 'Neck', date: '2026-05-10' },
];

const filters = ['All', 'Face', 'Neck', 'Body', 'Hands'];
const typeFilters = ['All', 'Before', 'After', 'Progress'];

export default function TreatmentPhotosScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [areaFilter, setAreaFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [compareMode, setCompareMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filtered = mockPhotos.filter((p) => {
    const matchArea = areaFilter === 'All' || p.area === areaFilter;
    const matchType = typeFilter === 'All' || p.type.toLowerCase() === typeFilter.toLowerCase();
    return matchArea && matchType;
  });

  const toggleSelect = (pid: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(pid)) return prev.filter((x) => x !== pid);
      if (prev.length >= 2) return [prev[1], pid];
      return [...prev, pid];
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.back}>← Back</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setCompareMode((c) => !c)}>
            <Text style={[styles.action, compareMode && styles.actionActive]}>
              {compareMode ? 'Done' : 'Compare'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>Photo Gallery</Text>

        {/* Area filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          {filters.map((chip) => (
            <TouchableOpacity
              key={chip}
              style={[styles.chip, areaFilter === chip && styles.chipActive]}
              onPress={() => setAreaFilter(chip)}
            >
              <Text style={[styles.chipText, areaFilter === chip && styles.chipTextActive]}>
                {chip}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Type filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          {typeFilters.map((chip) => (
            <TouchableOpacity
              key={chip}
              style={[styles.chip, typeFilter === chip && styles.chipActive]}
              onPress={() => setTypeFilter(chip)}
            >
              <Text style={[styles.chipText, typeFilter === chip && styles.chipTextActive]}>
                {chip}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Compare mode banner */}
        {compareMode && (
          <View style={styles.compareBanner}>
            <Text style={styles.compareText}>
              Select 2 photos to compare ({selectedIds.length}/2)
            </Text>
            {selectedIds.length === 2 && (
              <TouchableOpacity
                style={styles.compareButton}
                onPress={() => {
                  // TODO: Open compare overlay
                }}
              >
                <Text style={styles.compareButtonText}>View side-by-side</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Photo Grid */}
        <View style={styles.grid}>
          {filtered.map((p) => {
            const isSelected = selectedIds.includes(p.id);
            return (
              <TouchableOpacity
                key={p.id}
                style={[
                  styles.photoBox,
                  { width: photoSize, height: photoSize },
                  compareMode && isSelected && styles.photoSelected,
                ]}
                onPress={() => {
                  if (compareMode) {
                    toggleSelect(p.id);
                  } else {
                    // TODO: Open full-screen viewer
                  }
                }}
              >
                <Text style={styles.photoEmoji}>🖼️</Text>
                <Text style={styles.photoLabel}>{p.type}</Text>
                {compareMode && isSelected && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {selectedIds.indexOf(p.id) + 1}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {filtered.length === 0 && (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>🖼️</Text>
            <Text style={styles.emptyTitle}>No photos yet</Text>
            <Text style={styles.emptyBody}>Add photos when logging a treatment.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.canvas },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  back: { ...Typography.body, color: Colors.primary, fontWeight: '600' },
  action: { ...Typography.body, color: Colors.primary, fontWeight: '600' },
  actionActive: { color: Colors.tertiary },
  title: { ...Typography.displayMd, color: Colors.ink, fontSize: 28, paddingHorizontal: Spacing.lg, marginBottom: Spacing.sm },
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
  compareBanner: {
    backgroundColor: Colors.tertiary50,
    marginHorizontal: Spacing.lg,
    borderRadius: Radii.md,
    padding: Spacing.base,
    marginBottom: Spacing.md,
    alignItems: 'center',
  },
  compareText: { ...Typography.bodySm, color: Colors.tertiary, fontWeight: '500' },
  compareButton: {
    marginTop: Spacing.xs,
    backgroundColor: Colors.tertiary,
    borderRadius: Radii.pill,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  compareButtonText: { ...Typography.caption, color: Colors.inkInverse, fontWeight: '600' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  photoBox: {
    backgroundColor: Colors.surfaceMuted,
    borderRadius: Radii.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.hairline,
  },
  photoSelected: {
    borderColor: Colors.primary,
    borderWidth: 3,
    backgroundColor: Colors.primary50,
  },
  photoEmoji: { fontSize: 28 },
  photoLabel: { ...Typography.caption, color: Colors.inkMuted, marginTop: Spacing.xs },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: Radii.full,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: { color: Colors.inkInverse, fontSize: 12, fontWeight: '700' },
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
});
