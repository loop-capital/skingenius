import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Radii, Typography, Shadows } from '../../src/constants/theme';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';

// TODO: Replace with Supabase call
const mockDetail = {
  id: '1',
  name: 'Botox - Forehead',
  provider: 'Dr. Smith',
  location: 'Glow Aesthetics, NYC',
  date: '2026-06-01',
  cost: 450,
  category: 'Injectables',
  notes: 'Minimal bruising. Results visible after 5 days.',
  satisfaction_rating: 5,
  side_effects: 'Mild headache day 1',
  follow_up_reminder: true,
  has_photos: true,
};

const categoryIcons: Record<string, string> = {
  Injectables: '💉',
  Laser: '⚡',
  Body: '🏋️',
  Skincare: '🧴',
  Supplements: '💊',
  'GLP-1': '📉',
  Wellness: '🧘',
};

export default function TreatmentDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [reminder, setReminder] = useState(mockDetail.follow_up_reminder);

  const handleDelete = () => {
    Alert.alert('Delete Treatment', 'Are you sure? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          // TODO: Replace with Supabase call
          router.push('/treatments');
        },
      },
    ]);
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
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={() => router.push(`/treatments/new?edit=${id}`)}>
              <Text style={styles.action}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete}>
              <Text style={[styles.action, styles.actionDanger]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Info Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconCircle}>
              <Text style={styles.icon}>{categoryIcons[mockDetail.category] || '🧴'}</Text>
            </View>
            <View style={styles.cardHeaderText}>
              <Text style={styles.cardTitle}>{mockDetail.name}</Text>
              <Text style={styles.cardCategory}>{mockDetail.category}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <Row label="Provider" value={mockDetail.provider} />
          <Row label="Location" value={mockDetail.location} />
          <Row label="Date" value={mockDetail.date} />
          <Row label="Cost" value={`$${mockDetail.cost}`} />

          <View style={styles.divider} />

          <Row label="Notes" value={mockDetail.notes} />
          <Row label="Side effects" value={mockDetail.side_effects} />

          {mockDetail.satisfaction_rating > 0 && (
            <View style={styles.ratingRow}>
              <Text style={styles.label}>Satisfaction</Text>
              <Text style={styles.stars}>
                {'★'.repeat(mockDetail.satisfaction_rating)}
                {'☆'.repeat(5 - mockDetail.satisfaction_rating)}
              </Text>
            </View>
          )}
        </View>

        {/* Photos */}
        {mockDetail.has_photos && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Photos</Text>
            <View style={styles.photoRow}>
              <View style={styles.photoBox}>
                <Text style={styles.photoPlaceholder}>Before</Text>
              </View>
              <View style={styles.photoBox}>
                <Text style={styles.photoPlaceholder}>After</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => router.push(`/treatments/photos?id=${id}`)}
            >
              <Text style={styles.linkText}>View all photos</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Procedure Link */}
        <TouchableOpacity
          style={styles.linkCard}
          onPress={() => router.push(`/procedures/botox-forehead`)}
        >
          <Text style={styles.linkCardTitle}>View Procedure Info</Text>
          <Text style={styles.linkCardMeta}>Botox - Forehead</Text>
        </TouchableOpacity>

        {/* Follow-up Toggle */}
        <View style={styles.toggleCard}>
          <Text style={styles.toggleLabel}>Follow-up reminder</Text>
          <TouchableOpacity
            style={[styles.toggle, reminder && styles.toggleOn]}
            onPress={() => setReminder((r) => !r)}
          >
            <View style={[styles.toggleKnob, reminder && styles.toggleKnobOn]} />
          </TouchableOpacity>
        </View>

        {/* Related Appointments */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Related Appointments</Text>
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No linked appointments</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
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
  headerActions: { flexDirection: 'row', gap: Spacing.md },
  action: { ...Typography.body, color: Colors.primary, fontWeight: '600' },
  actionDanger: { color: Colors.error },
  card: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: Radii.lg,
    marginHorizontal: Spacing.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.hairline,
    ...Shadows.card,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm },
  iconCircle: {
    width: 48, height: 48, borderRadius: Radii.lg,
    backgroundColor: Colors.primary50,
    justifyContent: 'center', alignItems: 'center',
  },
  icon: { fontSize: 24 },
  cardHeaderText: { marginLeft: Spacing.sm },
  cardTitle: { ...Typography.subhead, color: Colors.ink, fontWeight: '600' },
  cardCategory: { ...Typography.caption, color: Colors.inkSecondary, marginTop: 2 },
  divider: { height: 1, backgroundColor: Colors.hairline, marginVertical: Spacing.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.xs },
  label: { ...Typography.caption, color: Colors.inkMuted },
  value: { ...Typography.body, color: Colors.ink, fontWeight: '500', flex: 1, textAlign: 'right' },
  ratingRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.xs, marginTop: Spacing.xs },
  stars: { fontSize: 18, color: Colors.tertiary, letterSpacing: 2 },
  section: { paddingHorizontal: Spacing.lg, marginTop: Spacing.xl },
  sectionTitle: { ...Typography.subhead, color: Colors.ink, marginBottom: Spacing.sm },
  photoRow: { flexDirection: 'row', gap: Spacing.sm },
  photoBox: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: Colors.surfaceMuted,
    borderRadius: Radii.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.hairline,
  },
  photoPlaceholder: { ...Typography.caption, color: Colors.inkMuted },
  linkButton: { marginTop: Spacing.sm },
  linkText: { ...Typography.body, color: Colors.primary, fontWeight: '600' },
  linkCard: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: Radii.lg,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.hairline,
    ...Shadows.card,
  },
  linkCardTitle: { ...Typography.body, color: Colors.ink, fontWeight: '600' },
  linkCardMeta: { ...Typography.caption, color: Colors.inkSecondary, marginTop: 2 },
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceCard,
    borderRadius: Radii.lg,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.hairline,
    ...Shadows.card,
  },
  toggleLabel: { ...Typography.body, color: Colors.ink, fontWeight: '500' },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: Radii.pill,
    backgroundColor: Colors.hairline,
    padding: 2,
    justifyContent: 'center',
  },
  toggleOn: { backgroundColor: Colors.primary },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: Radii.full,
    backgroundColor: Colors.inkInverse,
    transform: [{ translateX: 0 }],
  },
  toggleKnobOn: { transform: [{ translateX: 20 }] },
  emptyCard: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: Radii.md,
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.hairline,
  },
  emptyText: { ...Typography.bodySm, color: Colors.inkMuted },
});
