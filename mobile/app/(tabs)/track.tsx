// SKINgenius — Enhanced Track Screen (Treatment Tracker + Progress)
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Radii, Typography, Shadows } from '../../src/constants/theme';
import { ChatBubble } from '../../src/components/ChatBubble';
import { DataCard } from '../../src/components/DataCard';
import { AchievementBadge } from '../../src/components/AchievementBadge';
import { useRouter } from 'expo-router';

// TODO: Replace with Supabase call
const mockRecentTreatments = [
  { id: '1', name: 'Botox - Forehead', provider: 'Dr. Smith', date: '2026-06-01', cost: 450, category: 'Injectables' },
  { id: '2', name: 'CoolSculpting', provider: 'Glow Aesthetics', date: '2026-05-15', cost: 1200, category: 'Body' },
  { id: '3', name: 'HydraFacial', provider: 'Skin Spa', date: '2026-04-22', cost: 199, category: 'Skincare' },
];

const categoryIcons: Record<string, string> = {
  Injectables: '💉',
  Laser: '⚡',
  Body: '🏋️',
  Skincare: '🧴',
  Supplements: '💊',
  'GLP-1': '📉',
  Wellness: '🧘',
};

const totalSpent = mockRecentTreatments.reduce((s, t) => s + t.cost, 0);
const totalTreatments = mockRecentTreatments.length;
const lastDate = mockRecentTreatments[0]?.date ?? '—';

export default function TrackScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Track</Text>
        </View>

        <ChatBubble
          message="Track your treatments, appointments, and progress all in one place."
        />

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.actionChip}
              onPress={() => router.push('/treatments/new')}
            >
              <Text style={styles.actionIcon}>💉</Text>
              <Text style={styles.actionLabel}>Log Treatment</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionChip}
              onPress={() => router.push('/appointments/new')}
            >
              <Text style={styles.actionIcon}>📅</Text>
              <Text style={styles.actionLabel}>Book Appt</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionChip}
              onPress={() => router.push('/treatments/photos')}
            >
              <Text style={styles.actionIcon}>📷</Text>
              <Text style={styles.actionLabel}>Take Photo</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Treatment Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{totalTreatments}</Text>
              <Text style={styles.summaryLabel}>Treatments</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>${totalSpent.toLocaleString()}</Text>
              <Text style={styles.summaryLabel}>Total Spent</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{lastDate}</Text>
              <Text style={styles.summaryLabel}>Last Treatment</Text>
            </View>
          </View>
        </View>

        {/* Recent Treatments */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Treatments</Text>
            <TouchableOpacity onPress={() => router.push('/treatments')}>
              <Text style={styles.link}>See all →</Text>
            </TouchableOpacity>
          </View>
          {mockRecentTreatments.slice(0, 3).map((t) => (
            <TouchableOpacity
              key={t.id}
              style={styles.treatmentRow}
              onPress={() => router.push(`/treatments/${t.id}`)}
            >
              <View style={styles.iconCircle}>
                <Text style={styles.icon}>{categoryIcons[t.category] || '🧴'}</Text>
              </View>
              <View style={styles.treatmentText}>
                <Text style={styles.treatmentName}>{t.name}</Text>
                <Text style={styles.treatmentMeta}>{t.provider} · {t.date}</Text>
              </View>
              <Text style={styles.treatmentCost}>${t.cost}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Navigation Links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Explore</Text>
          <TouchableOpacity
            style={styles.navCard}
            onPress={() => router.push('/treatments')}
          >
            <Text style={styles.navIcon}>📋</Text>
            <View style={styles.navText}>
              <Text style={styles.navTitle}>Treatment History</Text>
              <Text style={styles.navSubtitle}>Full timeline & filters</Text>
            </View>
            <Text style={styles.navChevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navCard}
            onPress={() => router.push('/appointments')}
          >
            <Text style={styles.navIcon}>📅</Text>
            <View style={styles.navText}>
              <Text style={styles.navTitle}>Appointments</Text>
              <Text style={styles.navSubtitle}>Upcoming & past visits</Text>
            </View>
            <Text style={styles.navChevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navCard}
            onPress={() => router.push('/procedures')}
          >
            <Text style={styles.navIcon}>📚</Text>
            <View style={styles.navText}>
              <Text style={styles.navTitle}>Procedure Library</Text>
              <Text style={styles.navSubtitle}>Learn before you book</Text>
            </View>
            <Text style={styles.navChevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Achievements Preview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <AchievementBadge
            icon="🏆"
            name="First Treatment"
            description="Log your first aesthetic treatment."
            progress={1}
            threshold={1}
            unlocked
          />
          <AchievementBadge
            icon="📸"
            name="Photo Pro"
            description="Upload 10 progress photos."
            progress={3}
            threshold={10}
          />
        </View>

        {/* Skin Score Trend */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skin Score Trend</Text>
          <View style={styles.chartCard}>
            <Text style={styles.chartPlaceholder}>📊</Text>
            <Text style={styles.chartText}>Complete your first scan to start tracking</Text>
          </View>
        </View>

        {/* Lifestyle Impact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lifestyle Impact</Text>
          <Text style={styles.sectionSubtitle}>
            Connect a wearable to see how sleep, stress, and activity affect your skin.
          </Text>
          <View style={styles.dataCardsRow}>
            <DataCard icon="😴" label="Sleep" value="—" color={Colors.info} />
            <DataCard icon="❤️" label="Stress" value="—" color={Colors.error} />
            <DataCard icon="🏃" label="Activity" value="—" color={Colors.success} />
          </View>
        </View>

        {/* Scan History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Scan History</Text>
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No scans yet. Take your first scan to begin tracking.</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.canvas },
  scroll: { flex: 1 },
  header: { paddingHorizontal: Spacing.lg, paddingTop: 60, paddingBottom: Spacing.md },
  title: { ...Typography.displayMd, color: Colors.ink, fontSize: 32 },
  section: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.xl },
  sectionTitle: { ...Typography.subhead, color: Colors.ink, marginBottom: Spacing.sm },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  link: { ...Typography.body, color: Colors.primary, fontWeight: '600' },
  quickActions: { flexDirection: 'row', gap: Spacing.sm },
  actionChip: {
    flex: 1,
    backgroundColor: Colors.surfaceCard,
    borderRadius: Radii.lg,
    padding: Spacing.base,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.hairline,
    ...Shadows.card,
  },
  actionIcon: { fontSize: 24, marginBottom: Spacing.xs },
  actionLabel: { ...Typography.caption, color: Colors.ink, fontWeight: '500' },
  summaryCard: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: Radii.lg,
    marginHorizontal: Spacing.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.hairline,
    ...Shadows.card,
    marginBottom: Spacing.xl,
  },
  summaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  summaryItem: { alignItems: 'center', flex: 1 },
  summaryValue: { ...Typography.headline, color: Colors.ink, fontWeight: '700', fontSize: 22 },
  summaryLabel: { ...Typography.caption, color: Colors.inkMuted, marginTop: 2 },
  summaryDivider: { width: 1, height: 36, backgroundColor: Colors.hairline },
  treatmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceCard,
    borderRadius: Radii.md,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.hairline,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: Radii.md,
    backgroundColor: Colors.primary50,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  icon: { fontSize: 18 },
  treatmentText: { flex: 1 },
  treatmentName: { ...Typography.body, color: Colors.ink, fontWeight: '500' },
  treatmentMeta: { ...Typography.caption, color: Colors.inkSecondary, marginTop: 2 },
  treatmentCost: { ...Typography.body, color: Colors.ink, fontWeight: '700' },
  navCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceCard,
    borderRadius: Radii.lg,
    padding: Spacing.base,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.hairline,
    ...Shadows.card,
  },
  navIcon: { fontSize: 22, marginRight: Spacing.sm },
  navText: { flex: 1 },
  navTitle: { ...Typography.body, color: Colors.ink, fontWeight: '600' },
  navSubtitle: { ...Typography.caption, color: Colors.inkSecondary, marginTop: 2 },
  navChevron: { ...Typography.body, color: Colors.inkMuted, fontSize: 20 },
  chartCard: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: Radii.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.hairline,
    ...Shadows.card,
  },
  chartPlaceholder: { fontSize: 48, marginBottom: Spacing.sm },
  chartText: { ...Typography.bodySm, color: Colors.inkMuted, textAlign: 'center' },
  dataCardsRow: { flexDirection: 'row', gap: Spacing.sm },
  emptyCard: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: Radii.md,
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.hairline,
  },
  emptyText: { ...Typography.bodySm, color: Colors.inkMuted, textAlign: 'center' },
  sectionSubtitle: { ...Typography.bodySm, color: Colors.inkSecondary, marginBottom: Spacing.base },
});
