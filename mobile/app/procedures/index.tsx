import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Radii, Typography, Shadows } from '../../src/constants/theme';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';

// TODO: Replace with Supabase call
const mockProcedures = [
  { slug: 'botox-forehead', name: 'Botox - Forehead', category: 'Injectables', cost: '$300-$600', downtime: 'None', icon: '💉' },
  { slug: 'juvederm-voluma', name: 'Juvederm Voluma', category: 'Injectables', cost: '$800-$1,200', downtime: '1-2 days', icon: '💉' },
  { slug: 'fraxel', name: 'Fraxel', category: 'Laser', cost: '$1,000-$2,500', downtime: '3-5 days', icon: '⚡' },
  { slug: 'coolsculpting', name: 'CoolSculpting', category: 'Body', cost: '$600-$1,200', downtime: 'None', icon: '🏋️' },
  { slug: 'hydrafacial', name: 'HydraFacial', category: 'Skincare', cost: '$150-$300', downtime: 'None', icon: '🧴' },
  { slug: 'microneedling', name: 'Microneedling', category: 'Skincare', cost: '$200-$700', downtime: '1-2 days', icon: '🧴' },
];

const categories = ['All', 'Injectables', 'Laser', 'Body', 'Skincare', 'Peels', 'Surgical'];

export default function ProceduresScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set());

  const filtered = mockProcedures.filter((p) => {
    const matchCategory = activeFilter === 'All' || p.category === activeFilter;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  const toggleBookmark = (slug: string) => {
    setBookmarked((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Procedure Library</Text>
          <Text style={styles.subtitle}>Learn about treatments before you book.</Text>
        </View>

        {/* Search */}
        <View style={styles.searchWrap}>
          <TextInput
            style={styles.search}
            value={search}
            onChangeText={setSearch}
            placeholder="Search procedures..."
            placeholderTextColor={Colors.inkMuted}
          />
        </View>

        {/* Category Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          {categories.map((chip) => (
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

        {/* Grid */}
        <View style={styles.grid}>
          {filtered.map((p) => (
            <TouchableOpacity
              key={p.slug}
              style={styles.card}
              onPress={() => router.push(`/procedures/${p.slug}`)}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardIcon}>{p.icon}</Text>
                <TouchableOpacity
                  style={styles.bookmarkBtn}
                  onPress={() => toggleBookmark(p.slug)}
                >
                  <Text style={styles.bookmark}>
                    {bookmarked.has(p.slug) ? '★' : '☆'}
                  </Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.cardTitle}>{p.name}</Text>
              <Text style={styles.cardMeta}>{p.category} · {p.cost}</Text>
              <View style={styles.tag}>
                <Text style={styles.tagText}>Downtime: {p.downtime}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {filtered.length === 0 && (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyTitle}>No procedures found</Text>
            <Text style={styles.emptyBody}>Try a different search or filter.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.canvas },
  header: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: Spacing.md },
  title: { ...Typography.displayMd, color: Colors.ink, fontSize: 28, marginBottom: Spacing.xs },
  subtitle: { ...Typography.bodySm, color: Colors.inkSecondary },
  searchWrap: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.md },
  search: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: Radii.pill,
    borderWidth: 1,
    borderColor: Colors.hairline,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    ...Typography.body,
    color: Colors.ink,
  },
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  card: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: Radii.lg,
    padding: Spacing.base,
    width: '47%',
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.hairline,
    ...Shadows.card,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  cardIcon: { fontSize: 24 },
  bookmarkBtn: { padding: Spacing.xs },
  bookmark: { fontSize: 18, color: Colors.tertiary },
  cardTitle: { ...Typography.body, color: Colors.ink, fontWeight: '600', marginBottom: 2 },
  cardMeta: { ...Typography.caption, color: Colors.inkSecondary, marginBottom: Spacing.xs },
  tag: {
    backgroundColor: Colors.primary50,
    borderRadius: Radii.sm,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  tagText: { ...Typography.caption, color: Colors.primary, fontWeight: '500' },
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
