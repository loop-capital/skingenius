/**
 * skimlinks.ts — Skimlinks affiliate URL builder.
 *
 * Skimlinks aggregates thousands of merchants (Sephora, Ulta, Dermstore,
 * and more) behind a single publisher ID. Any merchant product URL gets
 * wrapped and the commission is tracked automatically.
 *
 * Jason signs up at skimlinks.com → gets a publisher ID → sets it as
 * SKIMLINKS_PUBLISHER_ID. No per-merchant setup needed.
 */

/**
 * Wrap any merchant product URL with the Skimlinks affiliate redirect.
 * Falls back to the raw URL if no publisher ID is configured (dev safety).
 */
export function buildSkimlinksUrl(
  merchantUrl: string,
  publisherId?: string
): string {
  const pid =
    publisherId ??
    process.env.SKIMLINKS_PUBLISHER_ID ??
    process.env.NEXT_PUBLIC_SKIMLINKS_PUBLISHER_ID;
  if (!pid || !merchantUrl) return merchantUrl;
  return (
    `https://go.skimresources.com?id=${encodeURIComponent(pid)}` +
    `&xs=1&url=${encodeURIComponent(merchantUrl)}`
  );
}

/** True when a Skimlinks publisher ID is configured (revenue is live). */
export function isSkimlinksConfigured(): boolean {
  return Boolean(
    process.env.SKIMLINKS_PUBLISHER_ID ??
      process.env.NEXT_PUBLIC_SKIMLINKS_PUBLISHER_ID
  );
}
