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
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';

const apptTypes = ['Consultation', 'Botox touch-up', 'Filler', 'Laser', 'Facial', 'Body treatment', 'Follow-up', 'Other'];

export default function NewAppointmentScreen() {
  const router = useRouter();
  const [provider, setProvider] = useState('');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [type, setType] = useState('Consultation');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('60');
  const [notes, setNotes] = useState('');
  const [showTypePicker, setShowTypePicker] = useState(false);

  const handleSave = () => {
    if (!provider || !date || !time) {
      Alert.alert('Missing info', 'Please fill in provider, date, and time.');
      return;
    }
    // TODO: Replace with Supabase call
    Alert.alert('Saved', 'Appointment added!', [
      { text: 'OK', onPress: () => router.push('/appointments') },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.back}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>New Appointment</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Label>Provider name *</Label>
          <TextInput
            style={styles.input}
            value={provider}
            onChangeText={setProvider}
            placeholder="Dr. Smith"
            placeholderTextColor={Colors.inkMuted}
          />

          <Label>Location</Label>
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            placeholder="Glow Aesthetics, NYC"
            placeholderTextColor={Colors.inkMuted}
          />

          <Label>Phone</Label>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="(555) 123-4567"
            keyboardType="phone-pad"
            placeholderTextColor={Colors.inkMuted}
          />

          <Label>Email</Label>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="contact@glowaesthetics.com"
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor={Colors.inkMuted}
          />

          <Label>Type</Label>
          <TouchableOpacity
            style={styles.select}
            onPress={() => setShowTypePicker((s) => !s)}
          >
            <Text style={styles.selectText}>{type}</Text>
            <Text style={styles.selectChevron}>▼</Text>
          </TouchableOpacity>

          {showTypePicker && (
            <View style={styles.picker}>
              {apptTypes.map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.pickerItem, type === t && styles.pickerItemActive]}
                  onPress={() => {
                    setType(t);
                    setShowTypePicker(false);
                  }}
                >
                  <Text style={[styles.pickerItemText, type === t && styles.pickerItemTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Label>Date *</Label>
          <TextInput
            style={styles.input}
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={Colors.inkMuted}
          />

          <Label>Time *</Label>
          <TextInput
            style={styles.input}
            value={time}
            onChangeText={setTime}
            placeholder="10:00 AM"
            placeholderTextColor={Colors.inkMuted}
          />

          <Label>Duration (minutes)</Label>
          <TextInput
            style={styles.input}
            value={duration}
            onChangeText={setDuration}
            keyboardType="numeric"
            placeholderTextColor={Colors.inkMuted}
          />

          <Label>Notes</Label>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Questions to ask, prep reminders..."
            placeholderTextColor={Colors.inkMuted}
            multiline
            numberOfLines={4}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>Save Appointment</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function Label({ children }: { children: string }) {
  return <Text style={styles.label}>{children}</Text>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.canvas },
  scroll: { paddingBottom: Spacing.xl },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  back: { ...Typography.body, color: Colors.primary, fontWeight: '600' },
  title: { ...Typography.displayMd, color: Colors.ink, fontSize: 28 },
  form: { paddingHorizontal: Spacing.lg, gap: Spacing.base },
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
  select: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: Colors.hairline,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectText: { ...Typography.body, color: Colors.ink },
  selectChevron: { ...Typography.bodySm, color: Colors.inkMuted },
  picker: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: Colors.hairline,
    overflow: 'hidden',
    marginTop: Spacing.xs,
  },
  pickerItem: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.hairline,
  },
  pickerItemActive: { backgroundColor: Colors.primary50 },
  pickerItemText: { ...Typography.body, color: Colors.ink },
  pickerItemTextActive: { color: Colors.primary, fontWeight: '600' },
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
  buttonText: { ...Typography.body, color: Colors.inkInverse, fontWeight: '600' },
});
