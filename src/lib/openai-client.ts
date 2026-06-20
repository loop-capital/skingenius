// ───────────────────────────────────────────────────────────────
// OpenAI Client Setup — GPT-4o Vision for Pro Tier
// ───────────────────────────────────────────────────────────────

import OpenAI from "openai";

/**
 * Lazy-initialized OpenAI client.
 * Throws if OPENAI_API_KEY is missing.
 */
let _openai: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!_openai) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not set in environment");
    }
    _openai = new OpenAI({ apiKey });
  }
  return _openai;
}

/**
 * Reset client (useful in tests or after key rotation)
 */
export function resetOpenAIClient(): void {
  _openai = null;
}
