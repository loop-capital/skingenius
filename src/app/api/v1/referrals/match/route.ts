import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const GETUPLOOK_URL =
  process.env.GETUPLOOK_SUPABASE_URL ||
  "https://prowvkbxcdhtoiidxowb.supabase.co";
const GETUPLOOK_KEY = ***

// Condition → Service category mapping
const CONDITION_SERVICES: Record<string, string[]> = {
  acne: ["facial", "hydrafacial", "chemical peel", "led therapy"],
  wrinkles: ["botox", "filler", "laser", "microneedling"],
  "fine lines": ["botox", "filler", "microneedling", "chemical peel"],
  redness: ["laser", "ipl", "calming facial"],
  hyperpigmentation: ["chemical peel", "laser", "brightening facial"],
  dryness: ["hydrafacial", "hydrating facial", "moisture treatment"],
  texture: ["microdermabrasion", "chemical peel", "microneedling"],
  "large pores": ["chemical peel", "laser", "microdermabrasion"],
};

function matchServiceToCondition(
  serviceName: string,
  conditions: string[],
): number {
  const nameLower = serviceName.toLowerCase();
  let score = 0;
  for (const condition of conditions) {
    const keywords = CONDITION_SERVICES[condition.toLowerCase()] || [];
    if (keywords.some((kw) => nameLower.includes(kw))) score++;
  }
  return score;
}

export async function POST(req: NextRequest) {
  try {
    const { skin_conditions } = await req.json();

    if (!skin_conditions?.length) {
      return NextResponse.json(
        { error: "skin_conditions array required" },
        { status: 400 },
      );
    }

    if (!GETUPLOOK_KEY) {
      return NextResponse.json(
        { error: "GETUPLOOK_ANON_KEY not configured" },
        { status: 500 },
      );
    }

    const supabase = createClient(GETUPLOOK_URL, GETUPLOOK_KEY);

    // Fetch all active providers - no RLS issues for reads
    const { data: providers, error: pErr } = await supabase
      .from("users")
      .select("id, first_name, last_name, email")
      .eq("role", "provider")
      .eq("is_active", true);

    if (pErr) {
      return NextResponse.json(
        { error: "Provider fetch failed", details: pErr.message },
        { status: 500 },
      );
    }

    // Fetch all active services
    const { data: services, error: sErr } = await supabase
      .from("services")
      .select("id, provider_id, name, price, duration_minutes")
      .eq("is_active", true);

    if (sErr) {
      return NextResponse.json(
        { error: "Service fetch failed", details: sErr.message },
        { status: 500 },
      );
    }

    // Fetch reviews for rating calculation
    const { data: reviews } = await supabase
      .from("reviews")
      .select("provider_id, rating");

    const ratings: Record<string, number[]> = {};
    reviews?.forEach((r) => {
      if (r.rating) {
        ratings[r.provider_id] = ratings[r.provider_id] || [];
        ratings[r.provider_id].push(r.rating);
      }
    });

    // Match providers to conditions
    const matches = providers
      .map((p) => {
        const providerServices =
          services?.filter((s) => s.provider_id === p.id) || [];
        const scored = providerServices
          .map((s) => ({
            ...s,
            match_score: matchServiceToCondition(s.name, skin_conditions),
          }))
          .filter((s) => s.match_score > 0);

        if (scored.length === 0) return null;

        const providerRatings = ratings[p.id] || [];
        const avgRating =
          providerRatings.length > 0
            ? providerRatings.reduce((a, b) => a + b, 0) /
              providerRatings.length
            : undefined;

        return {
          id: p.id,
          name: `${p.first_name} ${p.last_name}`,
          email: p.email,
          services: scored.sort(
            (a, b) => b.match_score - a.match_score,
          ),
          avg_rating: avgRating,
          total_match_score: scored.reduce(
            (sum, s) => sum + s.match_score,
            0,
          ),
        };
      })
      .filter(Boolean)
      .sort((a, b) => (b?.total_match_score || 0) - (a?.total_match_score || 0));

    return NextResponse.json({
      success: true,
      matches,
      total_matches: matches.length,
    });
  } catch (e) {
    const err = e as Error;
    return NextResponse.json(
      { error: "Match failed", message: err.message },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({ status: "ok" });
}
