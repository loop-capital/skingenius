export type ReferralStatus = "new" | "accepted" | "scheduled" | "completed" | "declined";
export type AppointmentStatus = "scheduled" | "confirmed" | "completed" | "no_show" | "cancelled";

export interface ScanSummary {
  conditions: { name: string; confidence: number }[];
  severity: "mild" | "moderate" | "severe" | "urgent";
  redFlags: string[];
}

export interface Referral {
  id: string;
  userId: string;
  userName: string;
  providerId: string;
  status: ReferralStatus;
  createdAt: string;
  scan: ScanSummary;
  recommendedServices: string[];
  matchScore: number;
  note?: string;
}

export interface Appointment {
  id: string;
  referralId?: string;
  userId: string;
  userName: string;
  service: string;
  scheduledStart: string;
  scheduledEnd: string;
  status: AppointmentStatus;
  price: number;
  deposit: number;
  locationType: "in_person" | "virtual";
  address?: string;
  meetingLink?: string;
  internalNotes?: string;
}

export interface Client {
  id: string;
  userId: string;
  name: string;
  email?: string;
  phone?: string;
  firstVisit: string;
  lastVisit: string;
  totalVisits: number;
  conditions: string[];
  appointments: Appointment[];
  notes: { id: string; text: string; createdAt: string }[];
  sharedScans: { date: string; severity: string; conditions: string[] }[];
}

const today = new Date();
const isoDate = (offsetDays: number, hour: number, minute: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + offsetDays);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};

export const mockReferrals: Referral[] = [
  {
    id: "ref-001",
    userId: "usr-101",
    userName: "Jane Doe",
    providerId: "prov-1",
    status: "new",
    createdAt: isoDate(-1, 9, 30),
    scan: {
      conditions: [
        { name: "Acne", confidence: 0.87 },
        { name: "Barrier dysfunction", confidence: 0.72 },
      ],
      severity: "moderate",
      redFlags: ["Dehydration"],
    },
    recommendedServices: ["HydraFacial", "Chemical Peel"],
    matchScore: 94,
  },
  {
    id: "ref-002",
    userId: "usr-102",
    userName: "Marcus Chen",
    providerId: "prov-1",
    status: "accepted",
    createdAt: isoDate(-3, 14, 0),
    scan: {
      conditions: [{ name: "Hyperpigmentation", confidence: 0.91 }],
      severity: "mild",
      redFlags: [],
    },
    recommendedServices: ["Brightening Facial", "Microneedling"],
    matchScore: 88,
  },
  {
    id: "ref-003",
    userId: "usr-103",
    userName: "Sarah Miller",
    providerId: "prov-1",
    status: "scheduled",
    createdAt: isoDate(-5, 10, 15),
    scan: {
      conditions: [
        { name: "Rosacea", confidence: 0.79 },
        { name: "Sensitivity", confidence: 0.85 },
      ],
      severity: "moderate",
      redFlags: ["Persistent redness"],
    },
    recommendedServices: ["Calming Facial", "LED Therapy"],
    matchScore: 91,
  },
  {
    id: "ref-004",
    userId: "usr-104",
    userName: "Emily Rodriguez",
    providerId: "prov-1",
    status: "completed",
    createdAt: isoDate(-12, 11, 0),
    scan: {
      conditions: [{ name: "Acne", confidence: 0.83 }],
      severity: "severe",
      redFlags: ["Cystic lesions"],
    },
    recommendedServices: ["Acne Consultation", "Chemical Peel"],
    matchScore: 89,
  },
  {
    id: "ref-005",
    userId: "usr-105",
    userName: "David Kim",
    providerId: "prov-1",
    status: "declined",
    createdAt: isoDate(-8, 16, 45),
    scan: {
      conditions: [{ name: "Eczema", confidence: 0.68 }],
      severity: "severe",
      redFlags: ["Open irritation"],
    },
    recommendedServices: ["Dermatology Referral"],
    matchScore: 62,
    note: "Condition outside our specialty",
  },
];

export const mockAppointments: Appointment[] = [
  {
    id: "apt-001",
    referralId: "ref-003",
    userId: "usr-103",
    userName: "Sarah Miller",
    service: "Calming Facial",
    scheduledStart: isoDate(0, 14, 0),
    scheduledEnd: isoDate(0, 15, 0),
    status: "confirmed",
    price: 120,
    deposit: 24,
    locationType: "in_person",
    address: "123 Main St, Columbus, OH",
    internalNotes: "Client prefers fragrance-free products",
  },
  {
    id: "apt-002",
    userId: "usr-106",
    userName: "Priya Patel",
    service: "HydraFacial",
    scheduledStart: isoDate(0, 10, 0),
    scheduledEnd: isoDate(0, 11, 0),
    status: "completed",
    price: 150,
    deposit: 30,
    locationType: "in_person",
    address: "123 Main St, Columbus, OH",
    internalNotes: "Completed without issues",
  },
  {
    id: "apt-003",
    referralId: "ref-001",
    userId: "usr-101",
    userName: "Jane Doe",
    service: "Chemical Peel",
    scheduledStart: isoDate(2, 11, 0),
    scheduledEnd: isoDate(2, 11, 45),
    status: "scheduled",
    price: 120,
    deposit: 24,
    locationType: "in_person",
    address: "123 Main St, Columbus, OH",
    internalNotes: "First-time peel; patch test completed",
  },
  {
    id: "apt-004",
    userId: "usr-107",
    userName: "Linda Brooks",
    service: "Microneedling",
    scheduledStart: isoDate(3, 13, 30),
    scheduledEnd: isoDate(3, 14, 30),
    status: "scheduled",
    price: 250,
    deposit: 50,
    locationType: "in_person",
    address: "123 Main St, Columbus, OH",
  },
  {
    id: "apt-005",
    userId: "usr-108",
    userName: "Tom Wright",
    service: "Virtual Consultation",
    scheduledStart: isoDate(-7, 10, 0),
    scheduledEnd: isoDate(-7, 10, 30),
    status: "no_show",
    price: 75,
    deposit: 15,
    locationType: "virtual",
    meetingLink: "https://meet.example.com/tom-wright",
  },
  {
    id: "apt-006",
    userId: "usr-104",
    userName: "Emily Rodriguez",
    service: "Acne Consultation",
    scheduledStart: isoDate(-12, 11, 0),
    scheduledEnd: isoDate(-12, 11, 45),
    status: "completed",
    price: 85,
    deposit: 17,
    locationType: "in_person",
    address: "123 Main St, Columbus, OH",
    internalNotes: "Recommended 6-week peel series",
  },
  {
    id: "apt-007",
    userId: "usr-102",
    userName: "Marcus Chen",
    service: "Brightening Facial",
    scheduledStart: isoDate(1, 15, 0),
    scheduledEnd: isoDate(1, 16, 0),
    status: "confirmed",
    price: 140,
    deposit: 28,
    locationType: "in_person",
    address: "123 Main St, Columbus, OH",
  },
];

export const mockClients: Client[] = [
  {
    id: "cli-101",
    userId: "usr-103",
    name: "Sarah Miller",
    email: "sarah.miller@example.com",
    phone: "(614) 555-0101",
    firstVisit: isoDate(-45, 10, 0),
    lastVisit: isoDate(0, 14, 0),
    totalVisits: 3,
    conditions: ["Rosacea", "Sensitivity"],
    appointments: mockAppointments.filter((a) => a.userId === "usr-103"),
    notes: [
      { id: "n-1", text: "Reactive to niacinamide above 4%", createdAt: isoDate(-30, 9, 0) },
      { id: "n-2", text: "Prefers LED over extractions", createdAt: isoDate(-14, 9, 0) },
    ],
    sharedScans: [
      { date: isoDate(-5, 10, 15), severity: "moderate", conditions: ["Rosacea", "Sensitivity"] },
      { date: isoDate(-30, 9, 0), severity: "moderate", conditions: ["Sensitivity"] },
    ],
  },
  {
    id: "cli-102",
    userId: "usr-104",
    name: "Emily Rodriguez",
    email: "emily.r@example.com",
    firstVisit: isoDate(-12, 11, 0),
    lastVisit: isoDate(-12, 11, 0),
    totalVisits: 1,
    conditions: ["Acne"],
    appointments: mockAppointments.filter((a) => a.userId === "usr-104"),
    notes: [{ id: "n-3", text: "Cystic acne; patch test salicylic acid next visit", createdAt: isoDate(-12, 12, 0) }],
    sharedScans: [{ date: isoDate(-12, 11, 0), severity: "severe", conditions: ["Acne"] }],
  },
  {
    id: "cli-103",
    userId: "usr-108",
    name: "Tom Wright",
    email: "tom.wright@example.com",
    firstVisit: isoDate(-30, 10, 0),
    lastVisit: isoDate(-7, 10, 0),
    totalVisits: 2,
    conditions: ["Aging", "Texture"],
    appointments: mockAppointments.filter((a) => a.userId === "usr-108"),
    notes: [{ id: "n-4", text: "No-show on 9/8 without notice", createdAt: isoDate(-7, 10, 30) }],
    sharedScans: [{ date: isoDate(-7, 10, 0), severity: "mild", conditions: ["Aging", "Texture"] }],
  },
  {
    id: "cli-104",
    userId: "usr-106",
    name: "Priya Patel",
    email: "priya.patel@example.com",
    firstVisit: isoDate(-60, 11, 0),
    lastVisit: isoDate(0, 10, 0),
    totalVisits: 4,
    conditions: ["Congestion", "Dullness"],
    appointments: mockAppointments.filter((a) => a.userId === "usr-106"),
    notes: [],
    sharedScans: [{ date: isoDate(-14, 11, 0), severity: "mild", conditions: ["Congestion", "Dullness"] }],
  },
];

export const currentProvider = {
  id: "prov-1",
  name: "PLEIJ Salon + Spa",
  specialty: "Licensed Esthetician",
  rating: 4.8,
  reviewCount: 124,
};

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function formatTime(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}
