// SKINgenius — Avatar + Chat Bubble Component
// Conversational UI pattern: avatar with speech bubble
import { View, Text, Image, StyleSheet } from 'react-native';
import { Colors, Spacing, Radii, Typography, Shadows } from '../constants/theme';

interface ChatBubbleProps {
  message: string;
  subtitle?: string;
  showAvatar?: boolean;
}

export function ChatBubble({ message, subtitle, showAvatar = true }: ChatBubbleProps) {
  return (
    <View style={styles.container}>
      {showAvatar && (
        <View style={styles.avatarContainer}>
          <Image
            source={require('../../assets/kora-hero.jpg')}
            style={styles.avatar}
            accessibilityLabel="SKINgenius consultant"
          />
          <View style={styles.avatarGlow} />
        </View>
      )}
      <View style={[styles.bubble, !showAvatar && styles.bubbleFull]}>
        <Text style={styles.message}>{message}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: Spacing.sm,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: Radii.full,
    backgroundColor: Colors.primary50,
  },
  avatarGlow: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: Radii.full,
    backgroundColor: Colors.primary,
    opacity: 0.08,
    zIndex: -1,
  },
  bubble: {
    flex: 1,
    backgroundColor: Colors.surfaceCard,
    borderRadius: Radii.lg,
    padding: Spacing.base,
    ...Shadows.card,
  },
  bubbleFull: {
    marginLeft: 0,
  },
  message: {
    ...Typography.body,
    color: Colors.ink,
    fontWeight: '500',
  },
  subtitle: {
    ...Typography.bodySm,
    color: Colors.inkSecondary,
    marginTop: Spacing.xs,
  },
});
