// SKINgenius — Supabase TypeScript Types (Treatment Tracker)
// Strict mode compatible. No `any` without documented reason.

export interface TreatmentCategory {
  id: string;
  name: string;
  icon: string | null;
  sort_order: number;
  created_at: string;
}

export interface Treatment {
  id: string;
  user_id: string;
  category_id: string | null;
  name: string;
  brand: string | null;
  provider_name: string | null;
  provider_location: string | null;
  treatment_date: string; // ISO date
  cost: number | null;
  notes: string | null;
  follow_up_date: string | null; // ISO date
  follow_up_reminder: boolean;
  satisfaction_rating: number | null; // 1-5
  side_effects: string | null;
  created_at: string;
  updated_at: string;
}

export interface TreatmentWithCategory extends Treatment {
  treatment_categories: TreatmentCategory | null;
}

export interface TreatmentPhoto {
  id: string;
  user_id: string;
  treatment_id: string | null;
  photo_url: string;
  photo_type: 'before' | 'after' | 'progress';
  taken_at: string | null;
  body_area: string | null;
  lighting_notes: string | null;
  created_at: string;
}

export interface TreatmentReminder {
  id: string;
  user_id: string;
  treatment_id: string | null;
  reminder_type: 'follow_up' | 'retreatment' | 'check_in';
  reminder_date: string; // ISO date
  title: string;
  body: string | null;
  is_sent: boolean;
  created_at: string;
}

export interface Appointment {
  id: string;
  user_id: string;
  provider_name: string;
  provider_location: string | null;
  provider_phone: string | null;
  provider_email: string | null;
  appointment_type: string;
  status: 'upcoming' | 'completed' | 'cancelled' | 'no_show';
  scheduled_at: string; // ISO timestamp
  duration_minutes: number | null;
  notes: string | null;
  follow_up_notes: string | null;
  treatment_id: string | null;
  reminder_sent: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProcedureCard {
  id: string;
  slug: string;
  name: string;
  category: string;
  summary: string;
  mechanism_of_action: string | null;
  prep_guidance: string | null;
  recovery_timeline: string | null;
  downtime_days: number | null;
  pain_level: string | null;
  cost_range: string | null;
  results_duration: string | null;
  complications: ProcedureComplication[] | null;
  red_flag_symptoms: string[] | null;
  faqs: ProcedureFAQ[] | null;
  contraindications: string[] | null;
  ideal_candidates: string | null;
  alternatives: string[] | null;
  image_url: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProcedureComplication {
  name: string;
  likelihood: string;
  severity: string;
  when_to_seek_help: string;
}

export interface ProcedureFAQ {
  question: string;
  answer: string;
}

export interface ProcedureBookmark {
  id: string;
  user_id: string;
  card_id: string;
  notes: string | null;
  created_at: string;
  procedure_cards?: ProcedureCard | null;
}

export interface Achievement {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string | null;
  category: string;
  threshold: number;
  points: number;
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
  progress: number;
  achievements?: Achievement | null;
}

export interface AchievementWithProgress extends Achievement {
  user_achievements: UserAchievement[] | null;
  is_unlocked: boolean;
  current_progress: number;
}

export interface AestheticInsight {
  id: string;
  user_id: string;
  insight_type: 'pattern' | 'recommendation' | 'milestone' | 'comparison';
  title: string;
  body: string;
  data: Record<string, unknown> | null;
  is_read: boolean;
  created_at: string;
}

// Input types for inserts/updates (omit system-managed fields)
export interface CreateTreatmentInput {
  category_id?: string;
  name: string;
  brand?: string | null;
  provider_name?: string | null;
  provider_location?: string | null;
  treatment_date: string;
  cost?: number | null;
  notes?: string | null;
  follow_up_date?: string | null;
  follow_up_reminder?: boolean;
  satisfaction_rating?: number | null;
  side_effects?: string | null;
}

export interface CreateAppointmentInput {
  provider_name: string;
  provider_location?: string | null;
  provider_phone?: string | null;
  provider_email?: string | null;
  appointment_type: string;
  scheduled_at: string;
  duration_minutes?: number | null;
  notes?: string | null;
  treatment_id?: string | null;
}

export interface CreatePhotoInput {
  photo_url: string;
  photo_type: 'before' | 'after' | 'progress';
  body_area?: string | null;
  lighting_notes?: string | null;
  taken_at?: string | null;
}

export interface TreatmentFilters {
  category?: string;
  startDate?: string;
  endDate?: string;
}
