// SKINgenius — Profile Screen (Rebuilt with design system)
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Colors, Spacing, Radii, Typography, Shadows } from '../../src/constants/theme';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { ChatBubble } from '../../src/components/ChatBubble';

export default function ProfileScreen() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Avatar + Name */}
      <View style={styles.avatarSection}>
        <Image
          source={require('../../assets/kora-hero.jpg')}
          style={styles.avatar}
        />
        <Text style={styles.name}>Your Profile</Text>
        <Text style={styles.subtitle}>Complete your skin profile for better results</Text>
      </View>

      {/* Skin Info Cards */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Skin Profile</Text>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Skin Type</Text>
          <Text style={styles.cardValue}>Not set — complete your first scan</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Fitzpatrick Type</Text>
          <Text style={styles.cardValue}>Not set</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Primary Concerns</Text>
          <Text style={styles.cardValue}>None identified yet</Text>
        </View>
      </View>

      {/* Subscription */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Subscription</Text>
        <View style={styles.subscriptionCard}>
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>FREE TIER</Text>
            </View>
          </View>
          <Text style={styles.subscriptionText}>
            10 scans/month • Basic condition detection • Ingredient recommendations
          </Text>
          <PrimaryButton
            title="⚡  Upgrade to Pro"
            onPress={() => {}}
            variant="gold"
          />
        </View>
      </View>

      {/* Connected Devices */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Connected Devices</Text>
        <ChatBubble
          message="Connect your Apple Watch or Oura ring to see how sleep, stress, and activity affect your skin."
          showAvatar={false}
        />
        <TouchableOpacity style={styles.deviceButton}>
          <Text style={styles.deviceButtonText}>🔗  Connect Apple Health</Text>
        </TouchableOpacity>
      </View>

      {/* Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        <TouchableOpacity style={styles.settingsRow}>
          <Text style={styles.settingsLabel}>Notifications</Text>
          <Text style={styles.settingsArrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingsRow}>
          <Text style={styles.settingsLabel}>Privacy & Data</Text>
          <Text style={styles.settingsArrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingsRow}>
          <Text style={styles.settingsLabel}>About SKINgenius</Text>
          <Text style={styles.settingsArrow}>›</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.disclaimer}>
        SKINgenius provides wellness information only. Not medical advice.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.canvas },
  avatarSection: { alignItems: 'center', paddingTop: 60, paddingBottom: Spacing.lg },
  avatar: { width: 96, height: 96, borderRadius: Radii.full, marginBottom: Spacing.base },
  name: { ...Typography.headline, color: Colors.ink },
  subtitle: { ...Typography.bodySm, color: Colors.inkSecondary, marginTop: Spacing.xs },
  section: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.xl },
  sectionTitle: { ...Typography.subhead, color: Colors.ink, marginBottom: Spacing.sm },
  card: {
    backgroundColor: Colors.surfaceCard, borderRadius: Radii.md,
    padding: Spacing.base, marginBottom: Spacing.sm,
    borderWidth: 1, borderColor: Colors.hairline, ...Shadows.card,
  },
  cardLabel: { ...Typography.captionUppercase, color: Colors.inkMuted, letterSpacing: 1 },
  cardValue: { ...Typography.body, color: Colors.ink, marginTop: 4 },
  subscriptionCard: {
    backgroundColor: Colors.surfaceCard, borderRadius: Radii.lg,
    padding: Spacing.lg, borderWidth: 1, borderColor: Colors.hairline, ...Shadows.card,
  },
  badgeRow: { flexDirection: 'row', marginBottom: Spacing.sm },
  badge: {
    backgroundColor: Colors.primary50, borderRadius: Radii.pill,
    paddingHorizontal: Spacing.sm, paddingVertical: 4,
  },
  badgeText: { ...Typography.captionUppercase, color: Colors.primary, letterSpacing: 1 },
  subscriptionText: { ...Typography.bodySm, color: Colors.inkSecondary, marginBottom: Spacing.base },
  deviceButton: {
    backgroundColor: Colors.surfaceCard, borderRadius: Radii.md,
    padding: Spacing.base, alignItems: 'center',
    borderWidth: 1.5, borderColor: Colors.primary,
  },
  deviceButtonText: { ...Typography.body, color: Colors.primary, fontWeight: '600' },
  settingsRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: Colors.surfaceCard, borderRadius: Radii.md,
    padding: Spacing.base, marginBottom: Spacing.sm,
    borderWidth: 1, borderColor: Colors.hairline,
  },
  settingsLabel: { ...Typography.body, color: Colors.ink },
  settingsArrow: { ...Typography.headline, color: Colors.inkMuted },
  disclaimer: {
    ...Typography.caption, color: Colors.inkMuted, textAlign: 'center',
    paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xxl, marginTop: Spacing.md,
  },
});
