import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Radii, Typography, Shadows } from '../../src/constants/theme';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';

// TODO: Replace with Supabase call
const mockProcedure = {
  slug: 'botox-forehead',
  name: 'Botox - Forehead',
  category: 'Injectables',
  summary: 'A quick injectable that smooths forehead lines by relaxing underlying muscles.',
  mechanism: 'Botulinum toxin blocks nerve signals to muscles, temporarily reducing movement and softening wrinkles.',
  prep: 'Avoid blood thinners 48h before. No alcohol 24h prior. Arrive with clean skin.',
  recovery: 'Day 1-2: Mild redness. Day 3-5: Results begin. Day 14: Full effect.',
  downtime_days: 0,
  pain: 'Minimal',
  cost: '$300-$600 per session',
  duration: '3-6 months',
  complications: [
    { name: 'Bruising', likelihood: 'Common', severity: 'mild' },
    { name: 'Headache', likelihood: 'Uncommon', severity: 'mild' },
    { name: 'Drooping eyelid', likelihood: 'Rare', severity: 'moderate' },
  ],
  red_flags: ['Asymmetry', 'Difficulty breathing', 'Swelling spreading beyond injection site'],
  faqs: [
    { q: 'How long does it take?', a: '10-15 minutes.' },
    { q: 'When will I see results?', a: '3-5 days, full effect by 2 weeks.' },
  ],
  isBookmarked: false,
};

const severityColor: Record<string, string> = {
  mild: Colors.success,
  moderate: Colors.warning,
  severe: Colors.error,
};

export default function ProcedureDetailScreen() {
  const router = useRouter();
  const { slug } = useLocalSearchParams();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [bookmarked, setBookmarked] = useState(mockProcedure.isBookmarked);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.back}>← Back</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setBookmarked((b) => !b)}>
            <Text style={styles.bookmark}>{bookmarked ? '★' : '☆'}</Text>
          </TouchableOpacity>
        </View>

        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={styles.category}>{mockProcedure.category}</Text>
          <Text style={styles.title}>{mockProcedure.name}</Text>
          <Text style={styles.summary}>{mockProcedure.summary}</Text>
          <View style={styles.metaRow}>
            <MetaBadge label="Pain" value={mockProcedure.pain} />
            <MetaBadge label="Downtime" value={`${mockProcedure.downtime_days} days`} />
            <MetaBadge label="Cost" value={mockProcedure.cost} />
          </View>
        </View>

        {/* Sections */}
        <Section title="Mechanism of Action">
          <Text style={styles.body}>{mockProcedure.mechanism}</Text>
        </Section>

        <Section title="Preparation">
          <Text style={styles.body}>{mockProcedure.prep}</Text>
        </Section>

        <Section title="Recovery Timeline">
          <Text style={styles.body}>{mockProcedure.recovery}</Text>
          <Text style={styles.caption}>Results last {mockProcedure.duration}.</Text>
        </Section>

        {/* Complications */}
        <Section title="Possible Complications">
          {mockProcedure.complications.map((c) => (
            <View key={c.name} style={styles.compRow}>
              <View style={[styles.compDot, { backgroundColor: severityColor[c.severity] || Colors.inkMuted }]} />
              <Text style={styles.compName}>{c.name}</Text>
              <Text style={styles.compMeta}>
                {c.likelihood} · {c.severity}
              </Text>
            </View>
          ))}
        </Section>

        {/* Red Flags */}
        <View style={styles.redFlagCard}>
          <Text style={styles.redFlagTitle}>🚨 Red Flag Symptoms — Seek care immediately if you notice:</Text>
          {mockProcedure.red_flags.map((rf) => (
            <Text key={rf} style={styles.redFlagItem}>• {rf}</Text>
          ))}
        </View>

        {/* FAQs */}
        <Section title="FAQs">
          {mockProcedure.faqs.map((f, i) => (
            <TouchableOpacity
              key={i}
              style={styles.faqItem}
              onPress={() => setOpenFaq(openFaq === i ? null : i)}
            >
              <View style={styles.faqRow}>
                <Text style={styles.faqQ}>{f.q}</Text>
                <Text style={styles.faqChevron}>{openFaq === i ? '▲' : '▼'}</Text>
              </View>
              {openFaq === i && (
                <Text style={styles.faqA}>{f.a}</Text>
              )}
            </TouchableOpacity>
          ))}
        </Section>

        {/* CTA */}
        <View style={styles.ctaWrap}>
          <TouchableOpacity
            style={styles.cta}
            onPress={() => router.push(`/treatments/new?procedure=${slug}`)}
          >
            <Text style={styles.ctaText}>Log This Treatment</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function MetaBadge({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaBadge}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
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
  bookmark: { fontSize: 24, color: Colors.tertiary },
  titleSection: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.md },
  category: { ...Typography.captionUppercase, color: Colors.primary, marginBottom: Spacing.xs },
  title: { ...Typography.displayMd, color: Colors.ink, fontSize: 28, marginBottom: Spacing.xs },
  summary: { ...Typography.body, color: Colors.inkSecondary },
  metaRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md },
  metaBadge: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.hairline,
    alignItems: 'center',
  },
  metaLabel: { ...Typography.caption, color: Colors.inkMuted },
  metaValue: { ...Typography.caption, color: Colors.ink, fontWeight: '600' },
  section: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.xl },
  sectionTitle: { ...Typography.subhead, color: Colors.ink, marginBottom: Spacing.sm },
  body: { ...Typography.body, color: Colors.inkSecondary, lineHeight: 24 },
  caption: { ...Typography.caption, color: Colors.inkMuted, marginTop: Spacing.xs },
  compRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.hairline,
  },
  compDot: { width: 10, height: 10, borderRadius: Radii.full, marginRight: Spacing.sm },
  compName: { ...Typography.body, color: Colors.ink, fontWeight: '500', flex: 1 },
  compMeta: { ...Typography.caption, color: Colors.inkMuted },
  redFlagCard: {
    backgroundColor: Colors.errorBg,
    borderRadius: Radii.lg,
    marginHorizontal: Spacing.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.error + '30',
  },
  redFlagTitle: { ...Typography.body, color: Colors.error, fontWeight: '600', marginBottom: Spacing.sm },
  redFlagItem: { ...Typography.bodySm, color: Colors.error, marginBottom: 4 },
  faqItem: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: Radii.md,
    padding: Spacing.base,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.hairline,
  },
  faqRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  faqQ: { ...Typography.body, color: Colors.ink, fontWeight: '500', flex: 1, marginRight: Spacing.sm },
  faqChevron: { ...Typography.bodySm, color: Colors.inkMuted },
  faqA: { ...Typography.bodySm, color: Colors.inkSecondary, marginTop: Spacing.xs },
  ctaWrap: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl },
  cta: {
    backgroundColor: Colors.primary,
    borderRadius: Radii.pill,
    paddingVertical: Spacing.base,
    alignItems: 'center',
    minHeight: 52,
  },
  ctaText: { ...Typography.body, color: Colors.inkInverse, fontWeight: '600' },
});
