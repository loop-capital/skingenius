// SKINgenius — Supabase Client
import { createClient } from '@supabase/supabase-js';
// import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://cnzoilxsttoqtvwotexd.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Auth helpers
export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// Scan storage
export async function saveScanResult(result: {
  condition: string;
  confidence: number;
  imageUri: string;
  recommendations: string[];
  tier: 'free' | 'paid';
}) {
  const user = await getUser();
  if (!user) throw new Error('Not authenticated');

  // Upload image to storage
  const fileName = `${user.id}/${Date.now()}.jpg`;
  const { error: uploadError } = await supabase.storage
    .from('scan-images')
    .upload(fileName, { uri: result.imageUri, type: 'image/jpeg' } as any);

  if (uploadError) throw uploadError;

  // Save scan record
  const { data, error } = await supabase.from('scans').insert({
    user_id: user.id,
    condition_detected: result.condition,
    confidence: result.confidence,
    image_path: fileName,
    recommendations: result.recommendations,
    tier: result.tier,
  }).select().single();

  if (error) throw error;
  return data;
}

export async function getUserScans(limit = 10) {
  const user = await getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('scans')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit);

  return data || [];
}
