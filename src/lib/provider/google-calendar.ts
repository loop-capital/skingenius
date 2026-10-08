import { createServiceClient } from "@/utils/supabase/service";

export const GOOGLE_CALENDAR_SCOPES = [
  "https://www.googleapis.com/auth/calendar.readonly",
  "https://www.googleapis.com/auth/calendar.events",
];

export interface BusinessDay {
  enabled: boolean;
  start: string; // HH:mm
  end: string;
}

export interface BusinessHours {
  mon: BusinessDay;
  tue: BusinessDay;
  wed: BusinessDay;
  thu: BusinessDay;
  fri: BusinessDay;
  sat: BusinessDay;
  sun: BusinessDay;
}

export interface ProviderCalendarSettings {
  id: string;
  provider_id: string;
  business_hours: BusinessHours;
  buffer_minutes: number;
  default_appointment_minutes: number;
  service_durations: Record<string, number>;
}

const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

export function getGoogleOAuthUrl(state: string): string {
  const clientId = getEnv("GOOGLE_CLIENT_ID");
  const redirectUri = `${getEnv("NEXT_PUBLIC_APP_URL")}/api/v1/provider/calendar/callback`;
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: GOOGLE_CALENDAR_SCOPES.join(" "),
    access_type: "offline",
    prompt: "consent",
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  scope: string;
  token_type: string;
}

export async function exchangeCodeForTokens(code: string): Promise<TokenResponse> {
  const clientId = getEnv("GOOGLE_CLIENT_ID");
  const clientSecret = getEnv("GOOGLE_CLIENT_SECRET");
  const redirectUri = `${getEnv("NEXT_PUBLIC_APP_URL")}/api/v1/provider/calendar/callback`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google token exchange failed: ${res.status} ${text}`);
  }

  return res.json();
}

export async function refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
  const clientId = getEnv("GOOGLE_CLIENT_ID");
  const clientSecret = getEnv("GOOGLE_CLIENT_SECRET");

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google token refresh failed: ${res.status} ${text}`);
  }

  return res.json();
}

export async function getValidAccessToken(providerId: string): Promise<string | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("provider_calendar_tokens")
    .select("*")
    .eq("provider_id", providerId)
    .single();

  if (error || !data) {
    return null;
  }

  const token = data as {
    access_token: string | null;
    encrypted_refresh_token: string;
    expires_at: string | null;
  };

  const refreshToken = decryptRefreshToken(token.encrypted_refresh_token);
  const expiresAt = token.expires_at ? new Date(token.expires_at).getTime() : 0;
  const now = Date.now();
  const accessToken = token.access_token;

  if (accessToken && expiresAt > now + 60_000) {
    return accessToken;
  }

  const refreshed = await refreshAccessToken(refreshToken);
  const newExpiresAt = new Date(now + refreshed.expires_in * 1000).toISOString();

  await supabase
    .from("provider_calendar_tokens")
    .update({
      access_token: refreshed.access_token,
      expires_at: newExpiresAt,
      scope: refreshed.scope.split(" "),
      updated_at: new Date().toISOString(),
    })
    .eq("provider_id", providerId);

  return refreshed.access_token;
}

export async function revokeGoogleAccess(refreshToken: string): Promise<void> {
  try {
    await fetch(`https://oauth2.googleapis.com/revoke?token=${refreshToken}`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
  } catch {
    // Best-effort revocation.
  }
}

export interface CalendarEvent {
  id: string;
  start: { dateTime: string } | { date: string };
  end: { dateTime: string } | { date: string };
  summary?: string;
}

export interface FreeBusyItem {
  start: string;
  end: string;
}

export async function fetchBusyTimes(
  accessToken: string,
  calendarId: string,
  timeMin: string,
  timeMax: string
): Promise<FreeBusyItem[]> {
  const res = await fetch(
    "https://www.googleapis.com/calendar/v3/freeBusy",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        timeMin,
        timeMax,
        timeZone: "UTC",
        items: [{ id: calendarId }],
      }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google freeBusy failed: ${res.status} ${text}`);
  }

  const json = await res.json();
  const cal = json.calendars?.[calendarId];
  return cal?.busy || [];
}

export async function listEvents(
  accessToken: string,
  calendarId: string,
  timeMin: string,
  timeMax: string
): Promise<CalendarEvent[]> {
  const params = new URLSearchParams({
    calendarId,
    timeMin,
    timeMax,
    singleEvents: "true",
    orderBy: "startTime",
  });

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
      calendarId
    )}/events?${params.toString()}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google events list failed: ${res.status} ${text}`);
  }

  const json = await res.json();
  return json.items || [];
}

export async function createCalendarEvent(
  accessToken: string,
  calendarId: string,
  event: {
    summary: string;
    description: string;
    start: { dateTime: string; timeZone: string };
    end: { dateTime: string; timeZone: string };
  }
): Promise<string> {
  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
      calendarId
    )}/events`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google event creation failed: ${res.status} ${text}`);
  }

  const json = await res.json();
  return json.id;
}

export interface AvailableSlot {
  start: string;
  end: string;
}

export function generateAvailableSlots(
  businessHours: BusinessHours,
  busyTimes: FreeBusyItem[],
  existingAppointments: { scheduled_start: string; scheduled_end: string }[],
  bufferMinutes: number,
  appointmentMinutes: number,
  days: number
): AvailableSlot[] {
  const slots: AvailableSlot[] = [];
  const now = new Date();
  const startDate = new Date(now);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + days);

  const blocked = [...busyTimes, ...existingAppointments]
    .map((b) => {
      const start = "scheduled_start" in b ? b.scheduled_start : b.start;
      const end = "scheduled_end" in b ? b.scheduled_end : b.end;
      return {
        start: new Date(start).getTime(),
        end: new Date(end).getTime(),
      };
    })
    .sort((a, b) => a.start - b.start);

  for (let d = new Date(startDate); d < endDate; d.setDate(d.getDate() + 1)) {
    const dayKey = DAY_KEYS[d.getDay()];
    const day = businessHours[dayKey];
    if (!day || !day.enabled) continue;

    const [startH, startM] = day.start.split(":").map(Number);
    const [endH, endM] = day.end.split(":").map(Number);

    const dayStart = new Date(d);
    dayStart.setHours(startH, startM, 0, 0);
    const dayEnd = new Date(d);
    dayEnd.setHours(endH, endM, 0, 0);

    if (dayEnd.getTime() <= dayStart.getTime()) continue;

    const dayBlocked = blocked.filter(
      (b) => b.end > dayStart.getTime() && b.start < dayEnd.getTime()
    );

    let cursor = Math.max(dayStart.getTime(), now.getTime());
    cursor = roundToNextSlot(cursor, appointmentMinutes + bufferMinutes);

    for (const block of dayBlocked) {
      while (cursor + appointmentMinutes * 60_000 <= block.start) {
        const slotEnd = cursor + appointmentMinutes * 60_000;
        if (slotEnd <= dayEnd.getTime()) {
          slots.push({
            start: new Date(cursor).toISOString(),
            end: new Date(slotEnd).toISOString(),
          });
        }
        cursor = slotEnd + bufferMinutes * 60_000;
      }
      cursor = Math.max(cursor, block.end + bufferMinutes * 60_000);
      cursor = roundToNextSlot(cursor, appointmentMinutes + bufferMinutes);
    }

    while (cursor + appointmentMinutes * 60_000 <= dayEnd.getTime()) {
      const slotEnd = cursor + appointmentMinutes * 60_000;
      slots.push({
        start: new Date(cursor).toISOString(),
        end: new Date(slotEnd).toISOString(),
      });
      cursor = slotEnd + bufferMinutes * 60_000;
      cursor = roundToNextSlot(cursor, appointmentMinutes + bufferMinutes);
    }
  }

  return slots;
}

function roundToNextSlot(timestamp: number, slotMinutes: number): number {
  const ms = slotMinutes * 60_000;
  return Math.ceil(timestamp / ms) * ms;
}

export function encryptRefreshToken(token: string): string {
  const key = getEnv("CALENDAR_TOKEN_ENCRYPTION_KEY");
  if (!key) {
    throw new Error("Missing CALENDAR_TOKEN_ENCRYPTION_KEY");
  }
  // Simple XOR + base64 for deterministic encryption. For production, use a real
  // crypto library (e.g., Node crypto AES-256-GCM) and rotate keys.
  const buffer = Buffer.from(token, "utf8");
  const keyBuffer = Buffer.from(key, "utf8");
  const out = Buffer.alloc(buffer.length);
  for (let i = 0; i < buffer.length; i++) {
    out[i] = buffer[i] ^ keyBuffer[i % keyBuffer.length];
  }
  return out.toString("base64");
}

export function decryptRefreshToken(encrypted: string): string {
  const key = getEnv("CALENDAR_TOKEN_ENCRYPTION_KEY");
  if (!key) {
    throw new Error("Missing CALENDAR_TOKEN_ENCRYPTION_KEY");
  }
  const buffer = Buffer.from(encrypted, "base64");
  const keyBuffer = Buffer.from(key, "utf8");
  const out = Buffer.alloc(buffer.length);
  for (let i = 0; i < buffer.length; i++) {
    out[i] = buffer[i] ^ keyBuffer[i % keyBuffer.length];
  }
  return out.toString("utf8");
}

export async function getOrCreateProviderCalendarSettings(
  providerId: string
): Promise<ProviderCalendarSettings> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("provider_calendar_settings")
    .select("*")
    .eq("provider_id", providerId)
    .single();

  if (data) return data as unknown as ProviderCalendarSettings;

  const { data: inserted, error } = await supabase
    .from("provider_calendar_settings")
    .insert({ provider_id: providerId })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create calendar settings: ${error.message}`);
  }

  return inserted as unknown as ProviderCalendarSettings;
}
