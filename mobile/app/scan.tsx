// SKINgenius — Scan Screen (Rebuilt with design system)
import { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import * as ImageManipulator from 'expo-image-manipulator';
import { Colors, Spacing, Radii, Typography, Shadows } from '../src/constants/theme';
import { ChatBubble } from '../src/components/ChatBubble';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { analyzeSkin } from '../lib/ml/inference';

type ScanState = 'idle' | 'capturing' | 'analyzing' | 'results';

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [state, setState] = useState<ScanState>('idle');
  const [result, setResult] = useState<any>(null);
  const cameraRef = useRef<CameraView>(null);

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Image
          source={require('../assets/kora-hero.jpg')}
          style={styles.permissionAvatar}
        />
        <ChatBubble
          message="I need camera access to analyze your skin. Your photos stay on your device — nothing is uploaded."
          showAvatar={false}
        />
        <PrimaryButton title="Grant Camera Access" onPress={requestPermission} />
      </View>
    );
  }

  const captureAndAnalyze = async () => {
    if (!cameraRef.current) return;
    setState('capturing');
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: false,
      });
      if (!photo) { setState('idle'); return; }

      const manipulated = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ resize: { width: 224, height: 224 } }],
        { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
      );

      setState('analyzing');
      const analysisResult = await analyzeSkin(manipulated.uri);
      setResult(analysisResult);
      setState('results');
    } catch (error) {
      console.error('Scan error:', error);
      Alert.alert('Scan Failed', 'Something went wrong. Please try again.');
      setState('idle');
    }
  };

  if (state === 'analyzing') {
    return (
      <View style={styles.analyzingContainer}>
        <Image
          source={require('../assets/kora-hero.jpg')}
          style={styles.analyzingAvatar}
        />
        <ActivityIndicator size="large" color={Colors.primary} style={styles.spinner} />
        <Text style={styles.analyzingTitle}>Analyzing your skin...</Text>
        <Text style={styles.analyzingSubtext}>Running on-device AI</Text>
        <Text style={styles.privacyNote}>🔒 Your photo stays private</Text>
      </View>
    );
  }

  if (state === 'results' && result) {
    return (
      <ScrollView style={styles.resultsContainer}>
        <Image
          source={require('../assets/kora-hero.jpg')}
          style={styles.resultsAvatar}
        />
        <ChatBubble
          message={result.isMalignantWarning
            ? "I found something that needs attention. Please see a dermatologist."
            : `I detected ${result.topCondition} with ${Math.round(result.confidence * 100)}% confidence.`
          }
          subtitle={`Analysis completed in ${result.inferenceTimeMs}ms`}
        />

        <View style={styles.resultCard}>
          <Text style={styles.resultLabel}>Primary Detection</Text>
          <Text style={styles.resultCondition}>{result.topCondition}</Text>
          <Text style={styles.resultConfidence}>
            {Math.round(result.confidence * 100)}% confidence
          </Text>
        </View>

        {result.conditions.length > 1 && (
          <View style={styles.resultCard}>
            <Text style={styles.resultLabel}>Also Detected</Text>
            {result.conditions.slice(1, 3).map((c: any, i: number) => (
              <Text key={i} style={styles.secondaryCondition}>
                • {c.displayName} ({Math.round(c.confidence * 100)}%)
              </Text>
            ))}
          </View>
        )}

        <View style={styles.resultCard}>
          <Text style={styles.resultLabel}>Recommended Ingredients</Text>
          {result.recommendations.map((r: string, i: number) => (
            <Text key={i} style={styles.recommendation}>• {r}</Text>
          ))}
        </View>

        <Text style={styles.disclaimer}>{result.disclaimer}</Text>

        <PrimaryButton title="View Routine" onPress={() => router.push('/(tabs)/routine')} />
        <View style={{ height: Spacing.sm }} />
        <PrimaryButton
          title="Scan Again"
          onPress={() => { setResult(null); setState('idle'); }}
          variant="secondary"
        />
        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing="front">
        <View style={styles.overlay}>
          <View style={styles.faceGuide} />
          <Text style={styles.guideText}>Position your face within the oval</Text>
        </View>
      </CameraView>
      <View style={styles.controls}>
        <TouchableOpacity style={styles.captureButton} onPress={captureAndAnalyze}>
          <View style={styles.captureButtonInner} />
        </TouchableOpacity>
        <Text style={styles.captureLabel}>Tap to scan</Text>
      </View>
    </View>
  );
}

import { ScrollView } from 'react-native';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.canvasDark },
  camera: { flex: 1 },
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  faceGuide: {
    width: 250, height: 320,
    borderWidth: 2, borderColor: Colors.primary + 'AA',
    borderRadius: 125, backgroundColor: 'transparent',
  },
  guideText: {
    ...Typography.body, color: Colors.inkInverse,
    marginTop: Spacing.base, textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.xs,
    borderRadius: Radii.md,
  },
  controls: {
    backgroundColor: Colors.canvas, padding: Spacing.xl, alignItems: 'center',
  },
  captureButton: {
    width: 72, height: 72, borderRadius: Radii.full,
    borderWidth: 4, borderColor: Colors.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  captureButtonInner: {
    width: 58, height: 58, borderRadius: Radii.full, backgroundColor: Colors.primary,
  },
  captureLabel: { ...Typography.bodySm, color: Colors.inkMuted, marginTop: Spacing.sm },
  permissionContainer: {
    flex: 1, backgroundColor: Colors.canvas,
    justifyContent: 'center', padding: Spacing.lg,
  },
  permissionAvatar: {
    width: 120, height: 120, borderRadius: Radii.full,
    alignSelf: 'center', marginBottom: Spacing.lg,
  },
  analyzingContainer: {
    flex: 1, backgroundColor: Colors.canvas,
    justifyContent: 'center', alignItems: 'center', padding: Spacing.lg,
  },
  analyzingAvatar: {
    width: 96, height: 96, borderRadius: Radii.full, marginBottom: Spacing.lg,
  },
  spinner: { marginBottom: Spacing.lg },
  analyzingTitle: { ...Typography.subhead, color: Colors.ink, marginBottom: Spacing.xs },
  analyzingSubtext: { ...Typography.bodySm, color: Colors.inkSecondary },
  privacyNote: { ...Typography.caption, color: Colors.inkMuted, marginTop: Spacing.lg },
  resultsContainer: { flex: 1, backgroundColor: Colors.canvas, padding: Spacing.lg },
  resultsAvatar: {
    width: 64, height: 64, borderRadius: Radii.full,
    alignSelf: 'center', marginBottom: Spacing.md,
  },
  resultCard: {
    backgroundColor: Colors.surfaceCard, borderRadius: Radii.md,
    padding: Spacing.base, marginBottom: Spacing.sm,
    borderWidth: 1, borderColor: Colors.hairline, ...Shadows.card,
  },
  resultLabel: {
    ...Typography.captionUppercase, color: Colors.inkMuted,
    letterSpacing: 1, marginBottom: Spacing.xs,
  },
  resultCondition: { ...Typography.subhead, color: Colors.primary, fontWeight: '700' },
  resultConfidence: { ...Typography.bodySm, color: Colors.inkSecondary, marginTop: 2 },
  secondaryCondition: { ...Typography.body, color: Colors.ink, marginTop: 4 },
  recommendation: { ...Typography.body, color: Colors.ink, marginTop: 6 },
  disclaimer: {
    ...Typography.caption, color: Colors.inkMuted,
    textAlign: 'center', marginVertical: Spacing.lg,
  },
});
