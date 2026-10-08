export interface ProviderProfile {
  id: string;
  user_id: string;
  business_name: string;
  provider_type: ProviderType;
  bio?: string | null;
  avatar_url?: string | null;
  address?: string | null;
  phone?: string | null;
  created_at?: string;
  updated_at?: string;
}

export type ProviderType =
  | "esthetician"
  | "injector_np_pa"
  | "medical_esthetician"
  | "dermatologist"
  | "plastic_surgeon";

export const BOOKABLE_PROVIDER_TYPES: ProviderType[] = [
  "esthetician",
  "injector_np_pa",
  "medical_esthetician",
];

export const PHYSICIAN_PROVIDER_TYPES: ProviderType[] = [
  "dermatologist",
  "plastic_surgeon",
];

export interface Service {
  id: string;
  provider_id: string;
  name: string;
  description?: string | null;
  price: number;
  duration_minutes: number;
  created_at?: string;
  updated_at?: string;
}

export interface ProviderWithServices extends ProviderProfile {
  services: Service[];
}

export interface AvailableSlot {
  start: string;
  end: string;
}

export interface Appointment {
  id: string;
  provider_id: string;
  user_id?: string | null;
  user_name: string;
  service_id?: string | null;
  service: string;
  scheduled_start: string;
  scheduled_end: string;
  notes?: string | null;
  status: AppointmentStatus;
  referral_id?: string | null;
  platform: Platform;
  deposit_amount?: number | null;
  square_payment_id?: string | null;
  google_event_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no_show";

export type Platform = "skingenius" | "getuplook";

export interface BookingIntent {
  provider_id: string;
  service_id: string;
  slot_start: string;
  slot_end: string;
  referral_id?: string | null;
  user_id?: string | null;
  user_name?: string | null;
}
