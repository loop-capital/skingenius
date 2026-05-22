/**
 * Tier 1: INCIDecoder Scraper
 * Searches incidecoder.com by product name or INCI list.
 * Returns full ingredient list + functions + safety ratings.
 *
 * All free — no API key required. Uses fetch + HTML parsing.
 */

export interface IncidecoderIngredient {
  name: string;
  inciName?: string;
  function?: string;
  safetyRating?: "safe" | "low_concern" | "moderate_concern" | "high_concern" | "avoid";
  notes?: string;
}

export interface IncidecoderProduct {
  productName: string;
  brand?: string;
  category?: string;
  ingredients: IncidecoderIngredient[];
  url: string;
  matched: boolean;
}

const INCIDECODER_BASE = "https://incidecoder.com";
const SEARCH_URL = `${INCIDECODER_BASE}/search?query=`;

/**
 * Search INCIDecoder for a product by name.
 * Returns the first product page result, then scrapes ingredients.
 */
export async function searchIncidecoder(
  productName: string
): Promise<IncidecoderProduct | null> {
  try {
    const searchRes = await fetch(`${SEARCH_URL}${encodeURIComponent(productName)}`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
          "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "text/html",
      },
    });
    if (!searchRes.ok) return null;

    const html = await searchRes.text();

    // Extract first product link from search results
    const productLinkMatch = html.match(
      /href="(\/products\/[^"]+)"/i
    );
    if (!productLinkMatch) return null;

    const productUrl = `${INCIDECODER_BASE}${productLinkMatch[1]}`;
    return await scrapeProductPage(productUrl);
  } catch (err) {
    console.error("[tier1-incidecoder] search error:", err);
    return null;
  }
}

/**
 * Scrape a specific INCIDecoder product page for ingredients.
 */
export async function scrapeProductPage(
  url: string
): Promise<IncidecoderProduct | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
          "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "text/html",
      },
    });
    if (!res.ok) return null;

    const html = await res.text();

    // Extract product name
    const nameMatch = html.match(/<h1[^>]*>(.*?)<\/h1>/is);
    const productName = nameMatch
      ? stripHtml(nameMatch[1]).trim()
      : "Unknown Product";

    // Extract brand (first link in breadcrumb or meta)
    const brandMatch = html.match(/"brand":\s*"([^"]+)"/i);
    const brand = brandMatch ? brandMatch[1] : undefined;

    // Parse ingredients from the page.
    // INCIDecoder lists ingredients in divs with class "ingredient" or within a specific section.
    const ingredients: IncidecoderIngredient[] = [];

    // Try structured JSON-LD first
    const jsonLdMatch = html.match(
      /<script type="application\/ld\+json">(.*?)<\/script>/is
    );
    if (jsonLdMatch) {
      try {
        const jsonLd = JSON.parse(jsonLdMatch[1]);
        const description = jsonLd.description || "";
        const ingList = extractIngredientList(description);
        for (const raw of ingList) {
          ingredients.push(parseIngredientBlock(raw, html));
        }
      } catch {
        /* ignore JSON parse errors */
      }
    }

    // Fallback: regex scrape ingredient names from the HTML
    if (ingredients.length === 0) {
      const ingSection = html.match(
        /Ingredients[\s\S]*?<div[^>]*class="[^"]*ingredient[^"]*"[\s\S]*?<\/div>/is
      );
      if (ingSection) {
        const rawNames = [...ingSection[0].matchAll(/class="ingredient-name"[^>]*>([^<]+)</gi)];
        for (const m of rawNames) {
          ingredients.push({ name: cleanText(m[1]) });
        }
      }
    }

    // Absolute fallback: extract any comma-separated list after "Ingredients:"
    if (ingredients.length === 0) {
      const fallbackMatch = html.match(/Ingredients:\s*([^<]+)/i);
      if (fallbackMatch) {
        const list = fallbackMatch[1].split(",").map((s) => s.trim()).filter(Boolean);
        for (const name of list) {
          ingredients.push({ name: cleanText(name) });
        }
      }
    }

    return {
      productName,
      brand,
      ingredients,
      url,
      matched: ingredients.length > 0,
    };
  } catch (err) {
    console.error("[tier1-incidecoder] scrape error:", err);
    return null;
  }
}

/* ------------------------------------------------------------------ */
// Helpers
/* ------------------------------------------------------------------ */

function stripHtml(raw: string): string {
  return raw.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function cleanText(raw: string): string {
  return raw.replace(/\*+/g, "").replace(/\s+/g, " ").trim();
}

function extractIngredientList(description: string): string[] {
  const lower = description.toLowerCase();
  const idx = lower.indexOf("ingredients");
  if (idx === -1) return [];
  const snippet = description.slice(idx + "ingredients".length);
  // Split by comma, period, or semicolon
  return snippet
    .split(/[,;.]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 1 && !s.match(/^[0-9\s%]+$/));
}

function parseIngredientBlock(raw: string, fullHtml: string): IncidecoderIngredient {
  const name = cleanText(raw);
  // Try to find safety badge or class in the HTML near the ingredient name
  const safeMatch = fullHtml.match(
    new RegExp(
      `${escapeRegex(name)}[\\s\\S]{0,200}(safe|superstar|goodie|ick|badie)`,
      "i"
    )
  );
  let safetyRating: IncidecoderIngredient["safetyRating"] = undefined;
  if (safeMatch) {
    const badge = safeMatch[1].toLowerCase();
    if (badge === "superstar" || badge === "goodie" || badge === "safe") {
      safetyRating = "safe";
    } else if (badge === "ick") {
      safetyRating = "low_concern";
    } else if (badge === "badie") {
      safetyRating = "moderate_concern";
    }
  }
  return { name, safetyRating };
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
