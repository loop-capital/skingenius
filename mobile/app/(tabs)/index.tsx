// SKINgenius — Home Screen (Rebuilt with design system)
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { router } from 'expo-router';
import { Colors, Spacing, Radii, Typography, Shadows } from '../../src/constants/theme';
import { ChatBubble } from '../../src/components/ChatBubble';
import { DataCard } from '../../src/components/DataCard';

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header with avatar */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>Good morning ✨</Text>
          <Text style={styles.title}>Your Skin,{'\n'}Understood.</Text>
        </View>
        <TouchableOpacity style={styles.avatarButton}>
          <Image
            source={require('../../assets/kora-hero.jpg')}
            style={styles.avatarSmall}
          />
        </TouchableOpacity>
      </View>

      {/* Conversational prompt */}
      <ChatBubble
        message="Ready for your daily skin check? I can analyze your skin, suggest products, or track your progress."
        subtitle="Tap below to start"
      />

      {/* Primary CTA */}
      <TouchableOpacity
        style={styles.scanButton}
        onPress={() => router.push('/scan')}
        activeOpacity={0.8}
      >
        <Text style={styles.scanButtonText}>📸  Start Skin Scan</Text>
      </TouchableOpacity>

      {/* Skin Score */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Skin Score</Text>
        <View style={styles.scoreCard}>
          <Text style={styles.scoreNumber}>—</Text>
          <Text style={styles.scoreLabel}>Complete your first scan to see your score</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/scan')}>
            <Text style={styles.actionIcon}>🔍</Text>
            <Text style={styles.actionLabel}>Condition{'\n'}Check</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
            <Text style={styles.actionIcon}>⏱️</Text>
            <Text style={styles.actionLabel}>Skin{'\n'}Age</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
            <Text style={styles.actionIcon}>💡</Text>
            <Text style={styles.actionLabel}>Ingredient{'\n'}Guide</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
            <Text style={styles.actionIcon}>📈</Text>
            <Text style={styles.actionLabel}>Progress{'\n'}Log</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Wearable Insights */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Health Insights</Text>
        <Text style={styles.sectionSubtitle}>
          Connect your wearable to see how lifestyle affects your skin.
        </Text>
        <View style={styles.dataCardsRow}>
          <DataCard icon="❤️" label="Heart Rate" value="—" color={Colors.error} />
          <DataCard icon="😴" label="Sleep" value="—" color={Colors.info} />
          <DataCard icon="🏃" label="Activity" value="—" color={Colors.success} />
        </View>
        <TouchableOpacity style={styles.wearableButton}>
          <Text style={styles.wearableButtonText}>🔗  Connect Apple Health</Text>
        </TouchableOpacity>
      </View>

      {/* Disclaimer */}
      <Text style={styles.disclaimer}>
        SKINgenius provides wellness information only. Not medical advice.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.canvas,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.lg,
    paddingTop: 60,
    paddingBottom: Spacing.md,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    ...Typography.bodySm,
    color: Colors.inkMuted,
    marginBottom: Spacing.xs,
  },
  title: {
    ...Typography.displayMd,
    color: Colors.ink,
    lineHeight: 44,
  },
  avatarButton: {
    width: 48,
    height: 48,
    borderRadius: Radii.full,
    overflow: 'hidden',
    ...Shadows.card,
  },
  avatarSmall: {
    width: 48,
    height: 48,
    borderRadius: Radii.full,
  },
  scanButton: {
    backgroundColor: Colors.primary,
    borderRadius: Radii.pill,
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.xl,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
    alignItems: 'center',
    ...Shadows.glow,
  },
  scanButtonText: {
    ...Typography.body,
    color: Colors.inkInverse,
    fontWeight: '600',
    fontSize: 18,
  },
  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.subhead,
    color: Colors.ink,
    marginBottom: Spacing.sm,
  },
  sectionSubtitle: {
    ...Typography.bodySm,
    color: Colors.inkSecondary,
    marginBottom: Spacing.base,
  },
  scoreCard: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: Radii.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.hairline,
    ...Shadows.card,
  },
  scoreNumber: {
    ...Typography.displayMd,
    color: Colors.primary,
  },
  scoreLabel: {
    ...Typography.bodySm,
    color: Colors.inkMuted,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  actionCard: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: Radii.lg,
    padding: Spacing.base,
    alignItems: 'center',
    width: '47%',
    borderWidth: 1,
    borderColor: Colors.hairline,
    ...Shadows.card,
  },
  actionIcon: {
    fontSize: 28,
    marginBottom: Spacing.xs,
  },
  actionLabel: {
    ...Typography.bodySm,
    color: Colors.ink,
    fontWeight: '500',
    textAlign: 'center',
  },
  dataCardsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.base,
  },
  wearableButton: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: Radii.md,
    padding: Spacing.base,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  wearableButtonText: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '600',
  },
  disclaimer: {
    ...Typography.caption,
    color: Colors.inkMuted,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxl,
    marginTop: Spacing.md,
  },
});
