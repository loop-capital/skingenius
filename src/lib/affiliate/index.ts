/**
 * affiliate/index.ts — Affiliate link pipeline for SKINgenius.
 *
 * Central entry point: given a product (name, brand, optional ASIN),
 * returns a purchase URL tagged with the configured affiliate network.
 * Currently supports Amazon Associates; the interface is network-agnostic
 * so additional networks (Skimlinks, direct brand deals) can be added
 * without touching callers.
 */

import {
  buildAmazonSearchUrl,
  buildAmazonProductUrl,
  isAffiliateConfigured,
} from "./amazon";

export interface AffiliateProduct {
  name: string;
  brand: string;
  /** Amazon ASIN when known — produces a direct product link. */
  asin?: string;
}

export interface AffiliateLink {
  /** Full affiliate-tagged URL to send the user to. */
  url: string;
  /** Which network generated it (for analytics). */
  network: "amazon" | "none";
  /** True when a revenue-generating tag was applied. */
  tagged: boolean;
}

/**
 * Build the purchase link for a recommended product.
 * Uses a direct ASIN link when available, otherwise an Amazon search URL.
 * Always returns a usable URL — the tag is applied when configured.
 */
export function buildAffiliateLink(product: AffiliateProduct): AffiliateLink {
  const tagged = isAffiliateConfigured();
  const url = product.asin
    ? buildAmazonProductUrl(product.asin)
    : buildAmazonSearchUrl(product.name, product.brand);
  return { url, network: "amazon", tagged };
}

/** FTC-compliant disclosure shown near affiliate-linked recommendations. */
export const AFFILIATE_DISCLOSURE =
  "We may earn a commission on qualifying purchases made through links on this page, at no extra cost to you.";

export { isAffiliateConfigured };
