// SKINgenius — Supabase Client Helpers (Treatment Tracker)
// All functions are async with try/catch returning null on error.
// TypeScript strict mode compatible.

import { supabase } from './client';
import {
  Treatment,
  TreatmentWithCategory,
  TreatmentPhoto,
  TreatmentReminder,
  Appointment,
  ProcedureCard,
  ProcedureBookmark,
  Achievement,
  UserAchievement,
  AchievementWithProgress,
  AestheticInsight,
  CreateTreatmentInput,
  CreateAppointmentInput,
  CreatePhotoInput,
  TreatmentFilters,
} from './types';

// ─────────────────────────────
// Treatments
// ─────────────────────────────

export async function getTreatments(
  userId: string,
  filters?: TreatmentFilters
): Promise<TreatmentWithCategory[] | null> {
  try {
    let query = supabase
      .from('treatments')
      .select('*, treatment_categories(*)')
      .eq('user_id', userId)
      .order('treatment_date', { ascending: false });

    if (filters?.category) {
      query = query.eq('treatment_categories.name', filters.category);
    }
    if (filters?.startDate) {
      query = query.gte('treatment_date', filters.startDate);
    }
    if (filters?.endDate) {
      query = query.lte('treatment_date', filters.endDate);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data as TreatmentWithCategory[]) ?? null;
  } catch (err) {
    console.error('getTreatments error:', err);
    return null;
  }
}

export async function getTreatment(id: string): Promise<(Treatment & { treatment_photos: TreatmentPhoto[] }) | null> {
  try {
    const { data, error } = await supabase
      .from('treatments')
      .select('*, treatment_photos(*)')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data ?? null;
  } catch (err) {
    console.error('getTreatment error:', err);
    return null;
  }
}

export async function createTreatment(data: CreateTreatmentInput): Promise<Treatment | null> {
  try {
    const user = await supabase.auth.getUser();
    if (!user.data.user) throw new Error('Not authenticated');

    const { data: result, error } = await supabase
      .from('treatments')
      .insert({ ...data, user_id: user.data.user.id })
      .select()
      .single();
    if (error) throw error;
    return result ?? null;
  } catch (err) {
    console.error('createTreatment error:', err);
    return null;
  }
}

export async function updateTreatment(id: string, data: Partial<CreateTreatmentInput>): Promise<Treatment | null> {
  try {
    const { data: result, error } = await supabase
      .from('treatments')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return result ?? null;
  } catch (err) {
    console.error('updateTreatment error:', err);
    return null;
  }
}

export async function deleteTreatment(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('treatments').delete().eq('id', id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('deleteTreatment error:', err);
    return false;
  }
}

// ─────────────────────────────
// Treatment Photos
// ─────────────────────────────

export async function addTreatmentPhoto(
  treatmentId: string,
  photo: CreatePhotoInput
): Promise<TreatmentPhoto | null> {
  try {
    const user = await supabase.auth.getUser();
    if (!user.data.user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('treatment_photos')
      .insert({
        treatment_id: treatmentId,
        user_id: user.data.user.id,
        photo_url: photo.photo_url,
        photo_type: photo.photo_type,
        body_area: photo.body_area ?? null,
        lighting_notes: photo.lighting_notes ?? null,
        taken_at: photo.taken_at ?? new Date().toISOString(),
      })
      .select()
      .single();
    if (error) throw error;
    return data ?? null;
  } catch (err) {
    console.error('addTreatmentPhoto error:', err);
    return null;
  }
}

// ─────────────────────────────
// Reminders
// ─────────────────────────────

export async function getUpcomingReminders(userId: string): Promise<TreatmentReminder[] | null> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('treatment_reminders')
      .select('*')
      .eq('user_id', userId)
      .gte('reminder_date', today)
      .eq('is_sent', false)
      .order('reminder_date', { ascending: true });
    if (error) throw error;
    return data ?? null;
  } catch (err) {
    console.error('getUpcomingReminders error:', err);
    return null;
  }
}

// ─────────────────────────────
// Appointments
// ─────────────────────────────

export async function getAppointments(userId: string, status?: string): Promise<Appointment[] | null> {
  try {
    let query = supabase
      .from('appointments')
      .select('*')
      .eq('user_id', userId)
      .order('scheduled_at', { ascending: true });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data ?? null;
  } catch (err) {
    console.error('getAppointments error:', err);
    return null;
  }
}

export async function createAppointment(data: CreateAppointmentInput): Promise<Appointment | null> {
  try {
    const user = await supabase.auth.getUser();
    if (!user.data.user) throw new Error('Not authenticated');

    const { data: result, error } = await supabase
      .from('appointments')
      .insert({ ...data, user_id: user.data.user.id })
      .select()
      .single();
    if (error) throw error;
    return result ?? null;
  } catch (err) {
    console.error('createAppointment error:', err);
    return null;
  }
}

export async function completeAppointment(id: string): Promise<Appointment | null> {
  try {
    const user = await supabase.auth.getUser();
    if (!user.data.user) throw new Error('Not authenticated');

    // 1. Mark appointment completed
    const { data: appt, error: apptError } = await supabase
      .from('appointments')
      .update({ status: 'completed', updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (apptError) throw apptError;
    if (!appt) return null;

    // 2. Auto-create treatment log entry if no linked treatment exists
    if (!appt.treatment_id) {
      const { error: treatmentError } = await supabase.from('treatments').insert({
        user_id: user.data.user.id,
        name: appt.appointment_type,
        provider_name: appt.provider_name,
        provider_location: appt.provider_location,
        treatment_date: new Date().toISOString().split('T')[0],
        notes: appt.follow_up_notes,
      });
      if (treatmentError) throw treatmentError;
    }

    return appt;
  } catch (err) {
    console.error('completeAppointment error:', err);
    return null;
  }
}

// ─────────────────────────────
// Procedure Cards
// ─────────────────────────────

export async function getProcedureCards(category?: string): Promise<ProcedureCard[] | null> {
  try {
    let query = supabase
      .from('procedure_cards')
      .select('*')
      .eq('is_published', true)
      .order('name', { ascending: true });

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data ?? null;
  } catch (err) {
    console.error('getProcedureCards error:', err);
    return null;
  }
}

export async function getProcedureCard(slug: string): Promise<ProcedureCard | null> {
  try {
    const { data, error } = await supabase
      .from('procedure_cards')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .single();
    if (error) throw error;
    return data ?? null;
  } catch (err) {
    console.error('getProcedureCard error:', err);
    return null;
  }
}

// ─────────────────────────────
// Bookmarks
// ─────────────────────────────

export async function bookmarkProcedure(userId: string, cardId: string): Promise<ProcedureBookmark | null> {
  try {
    const { data, error } = await supabase
      .from('procedure_bookmarks')
      .insert({ user_id: userId, card_id: cardId })
      .select()
      .single();
    if (error) throw error;
    return data ?? null;
  } catch (err) {
    console.error('bookmarkProcedure error:', err);
    return null;
  }
}

export async function unbookmarkProcedure(userId: string, cardId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('procedure_bookmarks')
      .delete()
      .eq('user_id', userId)
      .eq('card_id', cardId);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('unbookmarkProcedure error:', err);
    return false;
  }
}

export async function getUserBookmarks(userId: string): Promise<ProcedureBookmark[] | null> {
  try {
    const { data, error } = await supabase
      .from('procedure_bookmarks')
      .select('*, procedure_cards(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? null;
  } catch (err) {
    console.error('getUserBookmarks error:', err);
    return null;
  }
}

// ─────────────────────────────
// Achievements
// ─────────────────────────────

export async function getAchievements(userId: string): Promise<AchievementWithProgress[] | null> {
  try {
    const { data, error } = await supabase
      .from('achievements')
      .select('*, user_achievements!inner(*)')
      .eq('user_achievements.user_id', userId)
      .order('points', { ascending: false });

    if (error) throw error;

    // Also fetch achievements the user hasn't unlocked yet
    const { data: allAchievements, error: allError } = await supabase
      .from('achievements')
      .select('*, user_achievements(*)')
      .order('points', { ascending: false });

    if (allError) throw allError;

    const merged: AchievementWithProgress[] =
      allAchievements?.map((ach) => {
        const userAch = (ach.user_achievements as UserAchievement[] | undefined)?.[0] ?? null;
        return {
          ...ach,
          is_unlocked: !!userAch,
          current_progress: userAch?.progress ?? 0,
          user_achievements: userAch ? [userAch] : null,
        };
      }) ?? [];

    return merged;
  } catch (err) {
    console.error('getAchievements error:', err);
    return null;
  }
}

// ─────────────────────────────
// Aesthetic Insights
// ─────────────────────────────

export async function getAestheticInsights(userId: string): Promise<AestheticInsight[] | null> {
  try {
    const { data, error } = await supabase
      .from('aesthetic_insights')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? null;
  } catch (err) {
    console.error('getAestheticInsights error:', err);
    return null;
  }
}
