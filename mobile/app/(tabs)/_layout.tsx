// SKINgenius — Tab Layout (Rebuilt with design system)
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography } from '../../src/constants/theme';

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    home: '🏠',
    scan: '📸',
    routine: '✨',
    track: '📊',
    profile: '👤',
  };
  return (
    <View style={styles.iconContainer}>
      <Text style={[styles.icon, focused && styles.iconFocused]}>
        {icons[name] || '•'}
      </Text>
      {focused && <View style={styles.indicator} />}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.inkMuted,
        tabBarStyle: {
          backgroundColor: Colors.surfaceCard,
          borderTopColor: Colors.hairline,
          height: 85,
          paddingTop: 8,
        },
        headerStyle: { backgroundColor: Colors.canvas },
        headerTintColor: Colors.ink,
        headerTitleStyle: { ...Typography.subhead },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerShown: false,
          tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="scan-tab"
        options={{
          title: 'Scan',
          tabBarIcon: ({ focused }) => <TabIcon name="scan" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="routine"
        options={{
          title: 'Routine',
          tabBarIcon: ({ focused }) => <TabIcon name="routine" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="track"
        options={{
          title: 'Track',
          tabBarIcon: ({ focused }) => <TabIcon name="track" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => <TabIcon name="profile" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: { alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 22, opacity: 0.5 },
  iconFocused: { opacity: 1 },
  indicator: {
    width: 4, height: 4, borderRadius: 2,
    backgroundColor: Colors.primary, marginTop: 4,
  },
});
