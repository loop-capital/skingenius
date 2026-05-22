/**
 * Tier 3: EU CosIng Lookup
 * Queries the EU CosIng database for regulatory status, CAS numbers,
 * and functions of cosmetic ingredients.
 *
 * CosIng has no public REST API, but offers CSV/Excel downloads and
 * a search page. We use the search page + HTML parsing as a lightweight
 * free approach.
 */

export interface CosingIngredient {
  inciName: string;
  casNumber?: string;
  ecNumber?: string;
  cosmeticFunctions?: string[];
  restrictions?: string;
  // Regulatory status
  bannedInEu?: boolean;
  restrictedInEu?: boolean;
  colorant?: boolean;
  preservative?: boolean;
  uvFilter?: boolean;
}

export interface CosingResult {
  ingredients: CosingIngredient[];
  url: string;
  matched: boolean;
}

const COSING_SEARCH = "https://ec.europa.eu/growth/sectors/cosmetics/cosing_en";

/**
 * Search CosIng by INCI ingredient name.
 */
export async function searchCosing(
  ingredientName: string
): Promise<CosingResult | null> {
  try {
    const searchUrl = `${COSING_SEARCH}?search=${encodeURIComponent(ingredientName)}`;
    const res = await fetch(searchUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "text/html",
      },
    });
    if (!res.ok) return null;

    const html = await res.text();

    const ingredients: CosingIngredient[] = [];

    // Parse result rows — CosIng search results are table rows
    const rows = [...html.matchAll(/<tr[^>]*>[\s\S]*?<\/tr>/gi)];
    for (const rowMatch of rows) {
      const row = rowMatch[0];
      const cells = [...row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)];
      if (cells.length < 2) continue;

      const inciName = stripHtml(cells[0][1]);
      if (!inciName.toLowerCase().includes(ingredientName.toLowerCase())) continue;

      const casNumber = cells.length > 1 ? stripHtml(cells[1][1]) : undefined;
      const ecNumber = cells.length > 2 ? stripHtml(cells[2][1]) : undefined;

      // Parse functions/restrictions from remaining cells
      const cosmeticFunctions: string[] = [];
      let restrictions: string | undefined;
      let bannedInEu = false;
      let restrictedInEu = false;
      let colorant = false;
      let preservative = false;
      let uvFilter = false;

      for (let i = 3; i < cells.length; i++) {
        const text = stripHtml(cells[i][1]).toLowerCase();
        if (text.includes("banned")) bannedInEu = true;
        if (text.includes("restricted")) restrictedInEu = true;
        if (text.includes("colorant")) colorant = true;
        if (text.includes("preservative")) preservative = true;
        if (text.includes("uv filter") || text.includes("uv-filter")) uvFilter = true;
        if (text.length > 2) cosmeticFunctions.push(stripHtml(cells[i][1]));
        if (text.includes("restriction") || text.includes("max")) {
          restrictions = stripHtml(cells[i][1]);
        }
      }

      ingredients.push({
        inciName,
        casNumber: casNumber && casNumber !== "-" ? casNumber : undefined,
        ecNumber: ecNumber && ecNumber !== "-" ? ecNumber : undefined,
        cosmeticFunctions: cosmeticFunctions.length > 0 ? cosmeticFunctions : undefined,
        restrictions,
        bannedInEu,
        restrictedInEu,
        colorant,
        preservative,
        uvFilter,
      });
    }

    return {
      ingredients,
      url: searchUrl,
      matched: ingredients.length > 0,
    };
  } catch (err) {
    console.error("[tier3-cosing] search error:", err);
    return null;
  }
}

/**
 * Batch lookup multiple ingredients from CosIng.
 */
export async function batchSearchCosing(
  ingredientNames: string[]
): Promise<Map<string, CosingIngredient | null>> {
  const results = new Map<string, CosingIngredient | null>();
  // Sequential to avoid rate-limiting; can be parallelized if needed
  for (const name of ingredientNames) {
    const res = await searchCosing(name);
    if (res && res.ingredients.length > 0) {
      results.set(name, res.ingredients[0]);
    } else {
      results.set(name, null);
    }
  }
  return results;
}

/* ------------------------------------------------------------------ */
// Helpers
/* ------------------------------------------------------------------ */

function stripHtml(raw: string): string {
  return raw
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
