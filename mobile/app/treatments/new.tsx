import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Radii, Typography, Shadows } from '../../src/constants/theme';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ProgressIndicator } from '../../src/components/ProgressIndicator';

const categories = [
  { label: 'Injectables', icon: '💉' },
  { label: 'Laser', icon: '⚡' },
  { label: 'Body', icon: '🏋️' },
  { label: 'Skincare', icon: '🧴' },
  { label: 'Supplements', icon: '💊' },
  { label: 'GLP-1', icon: '📉' },
  { label: 'Wellness', icon: '🧘' },
];

export default function NewTreatmentScreen() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const totalSteps = 4;

  // Step 0
  const [category, setCategory] = useState<string | null>(null);

  // Step 1
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [provider, setProvider] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [cost, setCost] = useState('');

  // Step 2
  const [notes, setNotes] = useState('');
  const [rating, setRating] = useState(0);
  const [sideEffects, setSideEffects] = useState('');

  const canAdvance = () => {
    if (step === 0) return !!category;
    if (step === 1) return name.length > 0 && provider.length > 0 && date.length > 0;
    return true;
  };

  const handleNext = () => {
    if (step < totalSteps - 1) setStep((s) => s + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep((s) => s - 1);
    else router.back();
  };

  const handleSave = () => {
    // TODO: Replace with Supabase call
    Alert.alert('Saved', 'Treatment logged successfully!', [
      { text: 'OK', onPress: () => router.push('/treatments') },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={handleBack}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.stepLabel}>
          Step {step + 1} of {totalSteps}
        </Text>
      </View>

      <ProgressIndicator currentStep={step} totalSteps={totalSteps} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Step 1: Category Picker */}
        {step === 0 && (
          <View>
            <Text style={styles.heading}>Choose a category</Text>
            <View style={styles.grid}>
              {categories.map((c) => (
                <TouchableOpacity
                  key={c.label}
                  style={[
                    styles.gridItem,
                    category === c.label && styles.gridItemSelected,
                  ]}
                  onPress={() => setCategory(c.label)}
                >
                  <Text style={styles.gridIcon}>{c.icon}</Text>
                  <Text
                    style={[
                      styles.gridLabel,
                      category === c.label && styles.gridLabelSelected,
                    ]}
                  >
                    {c.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Step 2: Details */}
        {step === 1 && (
          <View>
            <Text style={styles.heading}>Treatment details</Text>
            <View style={styles.form}>
              <Label>Category</Label>
              <ReadOnlyValue>{category}</ReadOnlyValue>

              <Label>Treatment name *</Label>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="e.g., Botox - Forehead"
                placeholderTextColor={Colors.inkMuted}
              />

              <Label>Brand</Label>
              <TextInput
                style={styles.input}
                value={brand}
                onChangeText={setBrand}
                placeholder="e.g., Allergan"
                placeholderTextColor={Colors.inkMuted}
              />

              <Label>Provider *</Label>
              <TextInput
                style={styles.input}
                value={provider}
                onChangeText={setProvider}
                placeholder="e.g., Dr. Smith"
                placeholderTextColor={Colors.inkMuted}
              />

              <Label>Location</Label>
              <TextInput
                style={styles.input}
                value={location}
                onChangeText={setLocation}
                placeholder="e.g., Glow Aesthetics, NYC"
                placeholderTextColor={Colors.inkMuted}
              />

              <Label>Date *</Label>
              <TextInput
                style={styles.input}
                value={date}
                onChangeText={setDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={Colors.inkMuted}
              />

              <Label>Cost ($)</Label>
              <TextInput
                style={styles.input}
                value={cost}
                onChangeText={setCost}
                placeholder="e.g., 450"
                keyboardType="numeric"
                placeholderTextColor={Colors.inkMuted}
              />
            </View>
          </View>
        )}

        {/* Step 3: Optional extras */}
        {step === 2 && (
          <View>
            <Text style={styles.heading}>Optional extras</Text>
            <View style={styles.form}>
              <Label>Notes</Label>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={notes}
                onChangeText={setNotes}
                placeholder="How did it go? Any observations?"
                placeholderTextColor={Colors.inkMuted}
                multiline
                numberOfLines={4}
              />

              <Label>Satisfaction rating</Label>
              <View style={styles.starRow}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <TouchableOpacity key={s} onPress={() => setRating(s)}>
                    <Text style={[styles.star, s <= rating && styles.starFilled]}>
                      {s <= rating ? '★' : '☆'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Label>Side effects</Label>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={sideEffects}
                onChangeText={setSideEffects}
                placeholder="Any bruising, swelling, etc."
                placeholderTextColor={Colors.inkMuted}
                multiline
                numberOfLines={3}
              />
            </View>
          </View>
        )}

        {/* Step 4: Photo upload */}
        {step === 3 && (
          <View>
            <Text style={styles.heading}>Add photos</Text>
            <Text style={styles.body}>Upload before photos to track progress over time.</Text>
            <TouchableOpacity style={styles.photoUpload}>
              <Text style={styles.photoUploadText}>📷 Take or select photo</Text>
            </TouchableOpacity>
            <Text style={styles.caption}>You can skip this and add photos later.</Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.footer}>
        {step < totalSteps - 1 ? (
          <TouchableOpacity
            style={[styles.button, !canAdvance() && styles.buttonDisabled]}
            onPress={handleNext}
            disabled={!canAdvance()}
          >
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.button} onPress={handleSave}>
            <Text style={styles.buttonText}>Save Treatment</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

function Label({ children }: { children: string }) {
  return <Text style={styles.label}>{children}</Text>;
}

function ReadOnlyValue({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.readOnly}>
      <Text style={styles.readOnlyText}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.canvas },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  back: { ...Typography.body, color: Colors.primary, fontWeight: '600' },
  stepLabel: { ...Typography.caption, color: Colors.inkMuted },
  scrollContent: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl },
  heading: { ...Typography.headline, color: Colors.ink, marginBottom: Spacing.md, marginTop: Spacing.sm },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  gridItem: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: Colors.surfaceCard,
    borderRadius: Radii.lg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.hairline,
    ...Shadows.card,
  },
  gridItemSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary50,
  },
  gridIcon: { fontSize: 28, marginBottom: Spacing.xs },
  gridLabel: { ...Typography.caption, color: Colors.inkSecondary, fontWeight: '500' },
  gridLabelSelected: { color: Colors.primaryActive, fontWeight: '700' },
  form: { gap: Spacing.base },
  label: { ...Typography.captionUppercase, color: Colors.inkMuted, marginBottom: 2 },
  input: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: Colors.hairline,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    ...Typography.body,
    color: Colors.ink,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: Spacing.sm,
  },
  readOnly: {
    backgroundColor: Colors.surfaceMuted,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
  },
  readOnlyText: { ...Typography.body, color: Colors.inkSecondary },
  starRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.xs },
  star: { fontSize: 32, color: Colors.inkMuted },
  starFilled: { color: Colors.tertiary },
  photoUpload: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: Radii.lg,
    borderWidth: 2,
    borderColor: Colors.hairline,
    borderStyle: 'dashed',
    padding: Spacing.xl,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  photoUploadText: { ...Typography.body, color: Colors.primary, fontWeight: '600' },
  caption: { ...Typography.caption, color: Colors.inkMuted, marginTop: Spacing.sm, textAlign: 'center' },
  body: { ...Typography.body, color: Colors.inkSecondary, marginTop: Spacing.xs },
  footer: {
    padding: Spacing.lg,
    backgroundColor: Colors.surfaceCard,
    borderTopColor: Colors.hairline,
    borderTopWidth: 1,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: Radii.pill,
    paddingVertical: Spacing.base,
    alignItems: 'center',
    minHeight: 52,
  },
  buttonDisabled: { backgroundColor: Colors.hairline },
  buttonText: { ...Typography.body, color: Colors.inkInverse, fontWeight: '600' },
});
