/**
 * amazon.ts — Amazon Associates URL builder.
 *
 * Generates affiliate-tagged Amazon URLs for product recommendations.
 * V1 uses search URLs (always resolve); upgrade to direct ASIN links
 * once exact ASINs are verified for each product.
 */

const AMAZON_BASE = "https://www.amazon.com";

/**
 * Build an Amazon search URL tagged with the Associates ID.
 * Falls back to an untagged URL if no tag is configured (dev safety).
 */
export function buildAmazonSearchUrl(
  productName: string,
  brand: string,
  tag?: string
): string {
  const query = encodeURIComponent(`${brand} ${productName}`);
  const url = `${AMAZON_BASE}/s?k=${query}`;
  const affiliateTag = tag ?? process.env.AFFILIATE_AMAZON_TAG;
  return affiliateTag ? `${url}&tag=${encodeURIComponent(affiliateTag)}` : url;
}

/**
 * Build a direct Amazon product URL from an ASIN, tagged with the
 * Associates ID. Prefer this over search URLs when the ASIN is known.
 */
export function buildAmazonProductUrl(asin: string, tag?: string): string {
  const url = `${AMAZON_BASE}/dp/${encodeURIComponent(asin)}`;
  const affiliateTag = tag ?? process.env.AFFILIATE_AMAZON_TAG;
  return affiliateTag ? `${url}?tag=${encodeURIComponent(affiliateTag)}` : url;
}

/** True when an Associates tag is configured (revenue is live). */
export function isAffiliateConfigured(): boolean {
  return Boolean(
    process.env.AFFILIATE_AMAZON_TAG ?? process.env.NEXT_PUBLIC_AFFILIATE_AMAZON_TAG
  );
}
