/**
 * cloudVision.ts — GPT-4o Vision analysis for pro/pro_plus tiers.
 *
 * analyzeImageWithVision() takes a base64 image and returns the same
 * MockOnDeviceResult shape the scan route already consumes, so the route,
 * persistence, and UI layers need no changes.
 *
 * Safety design:
 *  - Model output is validated; anything invalid falls back to the mock.
 *  - API errors, timeouts, and missing keys all fall back to the mock.
 *  - A model outage NEVER 500s a scan — worst case the user gets mock data.
 *  - Token usage is logged per scan for cost monitoring.
 */

import { getOpenAIClient } from "@/lib/openai-client";
import {
  buildMockOnDeviceResponse,
  type MockOnDeviceResult,
} from "@/lib/scan/mockOnDeviceResponse";
import {
  VISION_SYSTEM_PROMPT,
  buildVisionUserPrompt,
  CONDITION_TAXONOMY,
} from "@/lib/scan/visionPrompt";
import type { ScanType } from "@/types/api";

// ─── Config ──────────────────────────────────────────────────────────────────

const VISION_MODEL = "gpt-4o";
const VISION_TIMEOUT_MS = 45_000;
const MAX_RETRIES = 1;

const VALID_SEVERITIES = new Set(["mild", "moderate", "severe"]);
const VALID_FITZPATRICK = new Set(["I", "II", "III", "IV", "V", "VI"]);
const VALID_CONDITION_IDS = new Set<string>(CONDITION_TAXONOMY as readonly string[]);
const VALID_ZONES = new Set([
  "forehead",
  "nose",
  "cheeks",
  "chin",
  "jawline",
  "around-eyes",
  "around-mouth",
  "neck",
]);

// ─── Lightweight validation (no zod dependency) ──────────────────────────────

interface RawVisionOutput {
  conditions?: unknown;
  skin_zones?: unknown;
  overall_score?: unknown;
  primary_concern?: unknown;
  urgent_flag?: unknown;
  fitzpatrick_type?: unknown;
  clinical_notes?: unknown;
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

/** Validate + sanitize model output. Returns null if unusable. */
function validateVisionOutput(raw: unknown): Omit<
  MockOnDeviceResult,
  "recommendations" | "productRecommendations" | "processingTimeMs"
> | null {
  if (!isRecord(raw)) return null;
  const o = raw as RawVisionOutput;

  // conditions
  if (!Array.isArray(o.conditions)) return null;
  const conditions = [];
  for (const c of o.conditions) {
    if (!isRecord(c)) continue;
    const id = typeof c.id === "string" ? c.id : "";
    if (!VALID_CONDITION_IDS.has(id)) continue;
    const severity =
      typeof c.severity === "string" && VALID_SEVERITIES.has(c.severity)
        ? c.severity
        : "mild";
    const affected = Array.isArray(c.affected_areas)
      ? c.affected_areas.filter(
          (z): z is string => typeof z === "string" && VALID_ZONES.has(z)
        )
      : [];
    conditions.push({
      id,
      name: typeof c.name === "string" ? c.name.slice(0, 80) : id,
      confidence:
        typeof c.confidence === "number"
          ? clamp(c.confidence, 0, 1)
          : 0.5,
      severity: severity as "mild" | "moderate" | "severe",
      affected_areas: affected,
    });
  }

  // skin_zones
  const skinZones = [];
  if (Array.isArray(o.skin_zones)) {
    for (const z of o.skin_zones) {
      if (!isRecord(z)) continue;
      const zone = typeof z.zone === "string" ? z.zone : "";
      if (!VALID_ZONES.has(zone)) continue;
      const severity =
        typeof z.severity === "string" && VALID_SEVERITIES.has(z.severity)
          ? z.severity
          : "mild";
      skinZones.push({
        zone,
        primary_concern:
          typeof z.primary_concern === "string"
            ? z.primary_concern.slice(0, 80)
            : "None",
        description:
          typeof z.description === "string"
            ? z.description.slice(0, 300)
            : "",
        severity: severity as "mild" | "moderate" | "severe",
        confidence:
          typeof z.confidence === "number" ? clamp(z.confidence, 0, 1) : 0.5,
      });
    }
  }

  const overallScore =
    typeof o.overall_score === "number"
      ? Math.round(clamp(o.overall_score, 0, 100))
      : 70;
  const primaryConcern =
    typeof o.primary_concern === "string"
      ? o.primary_concern.slice(0, 120)
      : "No significant concerns detected";
  const urgentFlag = o.urgent_flag === true;
  const fitzpatrickType =
    typeof o.fitzpatrick_type === "string" &&
    VALID_FITZPATRICK.has(o.fitzpatrick_type)
      ? o.fitzpatrick_type
      : "IV";

  return {
    conditions,
    skinZones,
    overallScore,
    primaryConcern,
    urgentFlag,
    fitzpatrickType,
  };
}

// ─── Main entry ──────────────────────────────────────────────────────────────

/**
 * Analyze a facial image with GPT-4o Vision.
 * Falls back to the deterministic mock on ANY failure — never throws.
 */
export async function analyzeImageWithVision(
  imageBase64: string,
  scanType: ScanType,
  skinToneHint = 4
): Promise<MockOnDeviceResult> {
  const started = performance.now();
  const fallback = () =>
    buildMockOnDeviceResponse(skinToneHint, scanType);

  // Normalize data URL prefix
  const dataUrl = imageBase64.startsWith("data:")
    ? imageBase64
    : `data:image/jpeg;base64,${imageBase64}`;

  let lastError: unknown = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const client = getOpenAIClient(); // throws if OPENAI_API_KEY missing

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), VISION_TIMEOUT_MS);

      const completion = await client.chat.completions.create(
        {
          model: VISION_MODEL,
          response_format: { type: "json_object" },
          max_tokens: 2000,
          messages: [
            { role: "system", content: VISION_SYSTEM_PROMPT },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: buildVisionUserPrompt(scanType, skinToneHint),
                },
                {
                  type: "image_url",
                  image_url: { url: dataUrl, detail: "high" },
                },
              ],
            },
          ],
        },
        { signal: controller.signal as unknown as AbortSignal }
      );

      clearTimeout(timeout);

      // Cost monitoring
      const usage = completion.usage;
      if (usage) {
        console.log(
          `[vision] tokens prompt=${usage.prompt_tokens} completion=${usage.completion_tokens} total=${usage.total_tokens}`
        );
      }

      const rawText = completion.choices[0]?.message?.content;
      if (!rawText) throw new Error("Empty model response");

      const parsed: unknown = JSON.parse(rawText);
      const validated = validateVisionOutput(parsed);
      if (!validated) throw new Error("Model output failed validation");

      console.log(
        `[vision] success: ${validated.conditions.length} conditions, score=${validated.overallScore}, urgent=${validated.urgentFlag}`
      );

      return {
        ...validated,
        // Recommendations come from the existing recommendation engine
        // downstream; the mock's are deterministic placeholders.
        recommendations: fallback().recommendations,
        productRecommendations: fallback().productRecommendations,
        processingTimeMs: Math.round(performance.now() - started),
      };
    } catch (err) {
      lastError = err;
      console.warn(
        `[vision] attempt ${attempt + 1} failed:`,
        err instanceof Error ? err.message : err
      );
    }
  }

  console.error(
    "[vision] all attempts failed, falling back to mock:",
    lastError instanceof Error ? lastError.message : lastError
  );
  const mock = fallback();
  return { ...mock, processingTimeMs: Math.round(performance.now() - started) };
}
