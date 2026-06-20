// SKINgenius — Root Layout (Rebuilt with design system)
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../src/constants/theme';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: Colors.canvas },
          headerTintColor: Colors.ink,
          headerTitleStyle: { fontWeight: '600', fontSize: 18 },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="scan"
          options={{
            title: 'Skin Scan',
            headerShown: false,
            presentation: 'fullScreenModal',
          }}
        />
        <Stack.Screen
          name="treatments"
          options={{
            title: 'Treatments',
            headerBackTitle: 'Back',
          }}
        />
        <Stack.Screen
          name="appointments"
          options={{
            title: 'Appointments',
            headerBackTitle: 'Back',
          }}
        />
        <Stack.Screen
          name="procedures"
          options={{
            title: 'Procedure Library',
            headerBackTitle: 'Back',
          }}
        />
      </Stack>
    </>
  );
}
