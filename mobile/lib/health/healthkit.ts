// SKINgenius — HealthKit Integration (Apple Health)
// Pulls wearable data to correlate with skin health

export interface HealthData {
  heartRate?: number;           // bpm (latest)
  heartRateVariability?: number; // ms (latest)
  sleepDuration?: number;       // hours (last night)
  sleepQuality?: string;        // 'good' | 'fair' | 'poor'
  stepCount?: number;           // today
  activeMinutes?: number;       // today
  oxygenSaturation?: number;    // % (latest)
  bodyTemperature?: number;     // °C (latest)
  hba1c?: number;               // % (if available from CGM)
}

/**
 * Request HealthKit permissions and read latest data.
 * Requires: expo-health (install when ready)
 */
export async function getHealthData(): Promise<HealthData> {
  // TODO: Implement with expo-health or react-native-health
  // For now, return mock data
  console.log('HealthKit integration — returning mock data');

  return {
    heartRate: 72 + Math.floor(Math.random() * 20),
    heartRateVariability: 40 + Math.floor(Math.random() * 30),
    sleepDuration: 6.5 + Math.random() * 2,
    sleepQuality: ['good', 'fair', 'poor'][Math.floor(Math.random() * 3)],
    stepCount: 4000 + Math.floor(Math.random() * 8000),
    activeMinutes: 20 + Math.floor(Math.random() * 40),
    oxygenSaturation: 96 + Math.floor(Math.random() * 4),
  };
}

/**
 * Get skin health insights based on wearable data.
 */
export function getSkinInsights(health: HealthData): string[] {
  const insights: string[] = [];

  // Sleep
  if (health.sleepDuration && health.sleepDuration < 7) {
    insights.push(
      '😴 Low sleep detected — poor sleep reduces skin repair and increases dark circles. Aim for 7-9 hours.'
    );
  }

  // Stress (HRV)
  if (health.heartRateVariability && health.heartRateVariability < 30) {
    insights.push(
      '⚡ Low HRV suggests elevated stress — stress hormones can trigger breakouts and inflammation.'
    );
  }

  // Activity
  if (health.stepCount && health.stepCount < 5000) {
    insights.push(
      '🚶 Low activity today — exercise improves circulation and gives skin a healthy glow.'
    );
  }

  // SpO2
  if (health.oxygenSaturation && health.oxygenSaturation < 95) {
    insights.push(
      '💨 Lower oxygen levels detected — good circulation is important for skin cell renewal.'
    );
  }

  // HbA1c (glycation)
  if (health.hba1c) {
    if (health.hba1c > 5.7) {
      insights.push(
        '🍬 Elevated HbA1c — high blood sugar causes glycation, which damages collagen and accelerates skin aging. Consider reducing sugar intake.'
      );
    } else if (health.hba1c < 5.7) {
      insights.push(
        '✅ Healthy HbA1c — your blood sugar levels are in a range that supports healthy collagen.'
      );
    }
  }

  if (insights.length === 0) {
    insights.push(
      '✨ Your health metrics look good! Keep it up for healthy, glowing skin.'
    );
  }

  return insights;
}
