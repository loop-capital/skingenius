/**
 * Tier 2: EWG Skin Deep Lookup
 * Looks up hazard scores for ingredients via ewg.org/skindeep.
 * Free tier — no API key. Uses HTML scraping.
 */

export interface EwgIngredient {
  name: string;
  hazardScore?: number; // 1-10
  dataAvailability?: "none" | "limited" | "fair" | "good" | "robust";
  concerns?: string[];
}

export interface EwgProductResult {
  overallHazard?: number; // 1-10
  ingredients: EwgIngredient[];
  url: string;
  matched: boolean;
}

const EWG_BASE = "https://www.ewg.org/skindeep";

/**
 * Search EWG Skin Deep by product name.
 */
export async function searchEwg(productName: string): Promise<EwgProductResult | null> {
  try {
    const searchUrl = `${EWG_BASE}/search?query=${encodeURIComponent(productName)}&search_group=products`;
    const res = await fetch(searchUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "text/html",
      },
    });
    if (!res.ok) return null;

    const html = await res.text();

    // Extract first product link
    const linkMatch = html.match(/href="(\/skindeep\/products\/[^"]+)"/i);
    if (!linkMatch) return null;

    const productUrl = `https://www.ewg.org${linkMatch[1]}`;
    return await scrapeEwgProductPage(productUrl);
  } catch (err) {
    console.error("[tier2-ewg] search error:", err);
    return null;
  }
}

/**
 * Scrape an EWG product page for ingredient hazard scores.
 */
export async function scrapeEwgProductPage(url: string): Promise<EwgProductResult | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "text/html",
      },
    });
    if (!res.ok) return null;

    const html = await res.text();

    // Parse overall score from meta or page header
    const overallMatch = html.match(/Overall Hazard[\s\S]*?(\d)\s*-\s*(\d)/i) || html.match(/"overallScore":\s*(\d)/);
    const overallHazard = overallMatch ? parseInt(overallMatch[1], 10) : undefined;

    const ingredients: EwgIngredient[] = [];

    // Find all ingredient rows
    const rowMatches = [...html.matchAll(/<tr[^>]*>.*?<td[^>]*>.*?<a[^>]*>([^<]+)<\/a>.*?<\/td>.*?<td[^>]*>(\d).*?<\/td>.*?<\/tr>/gis)];
    for (const m of rowMatches) {
      const name = cleanText(m[1]);
      const score = parseInt(m[2], 10);
      ingredients.push({ name, hazardScore: score });
    }

    // Fallback: parse any ingredient names without scores
    if (ingredients.length === 0) {
      const fallbackMatches = [...html.matchAll(/<a[^>]*href="\/skindeep\/ingredients\/[^"]*"[^>]*>([^<]+)<\/a>/gi)];
      for (const m of fallbackMatches) {
        ingredients.push({ name: cleanText(m[1]) });
      }
    }

    return {
      overallHazard,
      ingredients,
      url,
      matched: ingredients.length > 0,
    };
  } catch (err) {
    console.error("[tier2-ewg] scrape error:", err);
    return null;
  }
}

/**
 * Look up a single ingredient's hazard score.
 */
export async function lookupEwgIngredient(ingredientName: string): Promise<EwgIngredient | null> {
  try {
    const url = `${EWG_BASE}/search?query=${encodeURIComponent(ingredientName)}&search_group=ingredients`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "text/html",
      },
    });
    if (!res.ok) return null;

    const html = await res.text();

    // Extract first ingredient link
    const linkMatch = html.match(/href="(\/skindeep\/ingredients\/[^"]+)"/i);
    if (!linkMatch) return null;

    const ingUrl = `https://www.ewg.org${linkMatch[1]}`;
    const ingRes = await fetch(ingUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "text/html",
      },
    });
    if (!ingRes.ok) return null;

    const ingHtml = await ingRes.text();

    // Parse hazard score
    const scoreMatch = ingHtml.match(/class="score"[^>]*>\s*(\d)\s*-\s*\d\s*<\/span>/i) || ingHtml.match(/Hazard[\s\S]*?(\d)\s*-\s*\d/i);
    const hazardScore = scoreMatch ? parseInt(scoreMatch[1], 10) : undefined;

    // Parse data availability
    const dataMatch = ingHtml.match(/Data:[\s\S]*?(None|Limited|Fair|Good|Robust)/i);
    const dataAvailability = dataMatch
      ? (dataMatch[1].toLowerCase() as EwgIngredient["dataAvailability"])
      : undefined;

    // Parse concern categories
    const concerns: string[] = [];
    const concernMatches = [...ingHtml.matchAll(/<span[^>]*class="concern"[^>]*>([^<]+)<\/span>/gi)];
    for (const cm of concernMatches) {
      concerns.push(cleanText(cm[1]));
    }

    return {
      name: ingredientName,
      hazardScore,
      dataAvailability,
      concerns: concerns.length > 0 ? concerns : undefined,
    };
  } catch (err) {
    console.error("[tier2-ewg] ingredient lookup error:", err);
    return null;
  }
}

/* ------------------------------------------------------------------ */
// Helpers
/* ------------------------------------------------------------------ */

function cleanText(raw: string): string {
  return raw.replace(/\s+/g, " ").trim();
}
