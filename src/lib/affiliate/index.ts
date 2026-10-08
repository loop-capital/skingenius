/**
 * affiliate/index.ts — Affiliate link pipeline for SKINgenius.
 *
 * Central entry point: given a product with merchant URLs, returns a
 * purchase URL wrapped with the configured affiliate network.
 * Currently supports Skimlinks (Sephora, Ulta, Dermstore, +thousands more);
 * the interface is network-agnostic so additional networks or direct brand
 * deals can be added without touching callers.
 */

import { buildSkimlinksUrl, isSkimlinksConfigured } from "./skimlinks";

export interface AffiliateProduct {
  name: string;
  brand: string;
  /**
   * Direct merchant product URLs by retailer, e.g.
   * { sephora: "https://www.sephora.com/...", ulta: "https://www.ulta.com/..." }
   * First available URL wins (priority order below).
   */
  merchant_urls?: Record<string, string>;
  /** Fallback search URL when no direct merchant link exists. */
  fallback_search_url?: string;
}

export interface AffiliateLink {
  /** Full affiliate-wrapped URL to send the user to. */
  url: string;
  /** Which network generated it (for analytics). */
  network: "skimlinks" | "none";
  /** True when a revenue-generating tag was applied. */
  tagged: boolean;
  /** Which merchant the link points to, when known. */
  merchant?: string;
}

/** Merchant priority: preferred retailers first. */
const MERCHANT_PRIORITY = ["sephora", "ulta", "dermstore", "target"];

function pickMerchantUrl(
  merchant_urls?: Record<string, string>
): { url: string; merchant: string } | null {
  if (!merchant_urls) return null;
  for (const key of MERCHANT_PRIORITY) {
    if (merchant_urls[key]) return { url: merchant_urls[key], merchant: key };
  }
  const first = Object.entries(merchant_urls)[0];
  return first ? { url: first[1], merchant: first[0] } : null;
}

/**
 * Build the purchase link for a recommended product.
 * Prefers direct merchant URLs (Sephora > Ulta > Dermstore > ...),
 * falls back to a retailer search URL, always usable even untagged.
 */
export function buildAffiliateLink(product: AffiliateProduct): AffiliateLink {
  const tagged = isSkimlinksConfigured();
  const picked = pickMerchantUrl(product.merchant_urls);
  const rawUrl =
    picked?.url ??
    product.fallback_search_url ??
    `https://www.ulta.com/search?searchTerm=${encodeURIComponent(
      `${product.brand} ${product.name}`
    )}`;

  return {
    url: buildSkimlinksUrl(rawUrl),
    network: tagged ? "skimlinks" : "none",
    tagged,
    merchant: picked?.merchant,
  };
}

/** FTC-compliant disclosure shown near affiliate-linked recommendations. */
export const AFFILIATE_DISCLOSURE =
  "We may earn a commission on qualifying purchases made through links on this page, at no extra cost to you.";

export { isSkimlinksConfigured };
