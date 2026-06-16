// SKINgenius — Routine Screen (Rebuilt with design system)
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { Colors, Spacing, Radii, Typography, Shadows } from '../../src/constants/theme';
import { ChatBubble } from '../../src/components/ChatBubble';

export default function RoutineScreen() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Routine</Text>
      </View>

      <ChatBubble
        message="Complete a scan and I'll build a personalized skincare routine just for you. Every recommendation is backed by clinical research."
      />

      <View style={styles.emptyCard}>
        <Image
          source={require('../../assets/kora-hero.jpg')}
          style={styles.emptyAvatar}
        />
        <Text style={styles.emptyTitle}>No routine yet</Text>
        <Text style={styles.emptyText}>
          Take your first skin scan and I'll create a personalized routine with evidence-based ingredients.
        </Text>
      </View>

      {/* Sample routine structure (hidden until scan) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Morning Routine</Text>
        <View style={styles.stepCard}>
          <View style={styles.stepNumber}><Text style={styles.stepNumberText}>1</Text></View>
          <View style={styles.stepContent}>
            <Text style={styles.stepName}>Cleanser</Text>
            <Text style={styles.stepDesc}>Gentle, pH-balanced</Text>
          </View>
        </View>
        <View style={styles.stepCard}>
          <View style={styles.stepNumber}><Text style={styles.stepNumberText}>2</Text></View>
          <View style={styles.stepContent}>
            <Text style={styles.stepName}>Serum</Text>
            <Text style={styles.stepDesc}>Vitamin C for brightening</Text>
          </View>
        </View>
        <View style={styles.stepCard}>
          <View style={styles.stepNumber}><Text style={styles.stepNumberText}>3</Text></View>
          <View style={styles.stepContent}>
            <Text style={styles.stepName}>Moisturizer</Text>
            <Text style={styles.stepDesc}>Lightweight, non-comedogenic</Text>
          </View>
        </View>
        <View style={styles.stepCard}>
          <View style={styles.stepNumber}><Text style={styles.stepNumberText}>4</Text></View>
          <View style={styles.stepContent}>
            <Text style={styles.stepName}>SPF</Text>
            <Text style={styles.stepDesc}>Broad spectrum 30+</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.canvas },
  header: { paddingHorizontal: Spacing.lg, paddingTop: 60, paddingBottom: Spacing.md },
  title: { ...Typography.displayMd, color: Colors.ink, fontSize: 32 },
  emptyCard: {
    backgroundColor: Colors.surfaceCard, borderRadius: Radii.lg,
    padding: Spacing.xl, marginHorizontal: Spacing.lg, marginBottom: Spacing.xl,
    alignItems: 'center', borderWidth: 1, borderColor: Colors.hairline, ...Shadows.card,
  },
  emptyAvatar: { width: 80, height: 80, borderRadius: Radii.full, marginBottom: Spacing.base },
  emptyTitle: { ...Typography.subhead, color: Colors.ink, marginBottom: Spacing.xs },
  emptyText: { ...Typography.bodySm, color: Colors.inkSecondary, textAlign: 'center', lineHeight: 20 },
  section: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.xl },
  sectionTitle: { ...Typography.subhead, color: Colors.ink, marginBottom: Spacing.sm },
  stepCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surfaceCard, borderRadius: Radii.md,
    padding: Spacing.base, marginBottom: Spacing.sm,
    borderWidth: 1, borderColor: Colors.hairline, ...Shadows.card,
  },
  stepNumber: {
    width: 32, height: 32, borderRadius: Radii.full,
    backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center',
    marginRight: Spacing.sm,
  },
  stepNumberText: { ...Typography.bodySm, color: Colors.inkInverse, fontWeight: '700' },
  stepContent: { flex: 1 },
  stepName: { ...Typography.body, color: Colors.ink, fontWeight: '600' },
  stepDesc: { ...Typography.bodySm, color: Colors.inkSecondary, marginTop: 2 },
});
