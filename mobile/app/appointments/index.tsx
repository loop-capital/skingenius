import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Radii, Typography, Shadows } from '../../src/constants/theme';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

// TODO: Replace with Supabase call
const upcoming = [
  { id: 'a1', provider: 'Dr. Smith', type: 'Botox touch-up', date: '2026-06-20', time: '10:00 AM', status: 'upcoming' },
  { id: 'a2', provider: 'Glow Aesthetics', type: 'HydraFacial', date: '2026-06-25', time: '2:00 PM', status: 'upcoming' },
];

const past = [
  { id: 'a3', provider: 'Skin Spa', type: 'Consultation', date: '2026-04-10', time: '11:00 AM', status: 'completed' },
];

const statusBadge: Record<string, { bg: string; text: string }> = {
  upcoming: { bg: Colors.infoBg, text: Colors.info },
  completed: { bg: Colors.successBg, text: Colors.success },
  cancelled: { bg: Colors.errorBg, text: Colors.error },
};

export default function AppointmentsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Appointments</Text>
          <Text style={styles.subtitle}>Upcoming visits and past sessions.</Text>
        </View>

        {/* Upcoming */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming</Text>
          {upcoming.length === 0 && (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No upcoming appointments.</Text>
            </View>
          )}
          {upcoming.map((appt) => (
            <TouchableOpacity
              key={appt.id}
              style={styles.card}
              onPress={() => router.push(`/appointments/${appt.id}`)}
            >
              <View style={styles.cardRow}>
                <View style={styles.dateBox}>
                  <Text style={styles.dateMonth}>{appt.date.split('-')[1]}</Text>
                  <Text style={styles.dateDay}>{appt.date.split('-')[2]}</Text>
                </View>
                <View style={styles.cardText}>
                  <Text style={styles.cardTitle}>{appt.type}</Text>
                  <Text style={styles.cardMeta}>{appt.provider} · {appt.time}</Text>
                </View>
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: statusBadge[appt.status]?.bg || Colors.surfaceMuted },
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      { color: statusBadge[appt.status]?.text || Colors.inkMuted },
                    ]}
                  >
                    {appt.status}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Past */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Past</Text>
          {past.length === 0 && (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No past appointments.</Text>
            </View>
          )}
          {past.map((appt) => (
            <TouchableOpacity
              key={appt.id}
              style={styles.card}
              onPress={() => router.push(`/appointments/${appt.id}`)}
            >
              <View style={styles.cardRow}>
                <View style={[styles.dateBox, styles.dateBoxPast]}>
                  <Text style={[styles.dateMonth, styles.datePastText]}>{appt.date.split('-')[1]}</Text>
                  <Text style={[styles.dateDay, styles.datePastText]}>{appt.date.split('-')[2]}</Text>
                </View>
                <View style={styles.cardText}>
                  <Text style={styles.cardTitle}>{appt.type}</Text>
                  <Text style={styles.cardMeta}>{appt.provider} · {appt.time}</Text>
                </View>
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: statusBadge[appt.status]?.bg || Colors.surfaceMuted },
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      { color: statusBadge[appt.status]?.text || Colors.inkMuted },
                    ]}
                  >
                    {appt.status}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity style={styles.fab} onPress={() => router.push('/appointments/new')}>
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
  section: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.xl },
  sectionTitle: { ...Typography.captionUppercase, color: Colors.inkMuted, marginBottom: Spacing.sm, marginTop: Spacing.md },
  card: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: Radii.lg,
    padding: Spacing.base,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.hairline,
    ...Shadows.card,
  },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  dateBox: {
    width: 48,
    height: 48,
    borderRadius: Radii.md,
    backgroundColor: Colors.primary50,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  dateBoxPast: { backgroundColor: Colors.surfaceMuted },
  dateMonth: { ...Typography.captionUppercase, color: Colors.primary, fontSize: 10 },
  dateDay: { ...Typography.subhead, color: Colors.primary, fontSize: 18 },
  datePastText: { color: Colors.inkMuted },
  cardText: { flex: 1 },
  cardTitle: { ...Typography.body, color: Colors.ink, fontWeight: '600' },
  cardMeta: { ...Typography.caption, color: Colors.inkSecondary, marginTop: 2 },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radii.sm,
  },
  badgeText: { ...Typography.caption, fontWeight: '600' },
  emptyCard: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: Radii.md,
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.hairline,
  },
  emptyText: { ...Typography.bodySm, color: Colors.inkMuted, textAlign: 'center' },
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
