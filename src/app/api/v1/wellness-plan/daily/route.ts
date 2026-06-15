import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/utils/supabase/service";

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------

interface DailyItem {
  plan_item_id: string;
  category: string;
  item_type: string;
  title: string;
  description: string | null;
  dosage: string | null;
  timing: string | null;
  frequency: string | null;
  priority: string;
  evidence_level: string | null;
  condition_slug: string | null;
  status: "pending" | "completed" | "skipped" | "partially_completed";
  completed_at: string | null;
  skip_reason: string | null;
  user_notes: string | null;
  actual_dosage: string | null;
  actual_timing: string | null;
}

interface DailyResponse {
  plan_id: string;
  entry_date: string;
  total_items: number;
  completed_items: number;
  skipped_items: number;
  completion_pct: number;
  items: DailyItem[];
}

// ------------------------------------------------------------------
// Utility
// ------------------------------------------------------------------

function apiError(message: string, status = 400): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

// ------------------------------------------------------------------
// GET /api/v1/wellness-plan/daily?user_id=...&date=2026-06-15
// ------------------------------------------------------------------

export async function GET(request: NextRequest): Promise<NextResponse> {
  const supabase = createServiceClient();

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("user_id");
  const dateParam =
    searchParams.get("date") ?? new Date().toISOString().split("T")[0];

  if (!userId) {
    return apiError("user_id is required");
  }

  // 1. Find active plan
  const { data: activePlan, error: planError } = await supabase
    .from("wellness_plans")
    .select("id")
    .eq("user_id", userId)
    .eq("active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (planError || !activePlan) {
    return apiError("No active wellness plan found. Generate one first.", 404);
  }

  const planId = activePlan.id;

  // 2. Get all plan items
  const { data: planItems, error: itemsError } = await supabase
    .from("wellness_plan_items")
    .select(
      `
      id, category, item_type, title, description,
      dosage, timing, frequency, priority, evidence_level,
      condition_slug, sort_order
    `,
    )
    .eq("plan_id", planId)
    .order("sort_order", { ascending: true });

  if (itemsError) {
    return apiError("Failed to load plan items", 500);
  }

  // 3. Get existing daily entries for this date
  const { data: existingEntries, error: entriesError } = await supabase
    .from("wellness_plan_daily_entries")
    .select("*")
    .eq("user_id", userId)
    .eq("plan_id", planId)
    .eq("entry_date", dateParam);

  if (entriesError) {
    return apiError("Failed to load daily entries", 500);
  }

  // 4. Create missing daily entries (lazy init for the day)
  const existingItemIds = new Set(
    (existingEntries ?? []).map((e) => e.plan_item_id),
  );
  const missingItems = (planItems ?? []).filter(
    (item) => !existingItemIds.has(item.id),
  );

  if (missingItems.length > 0) {
    const newEntries = missingItems.map((item) => ({
      user_id: userId,
      plan_id: planId,
      plan_item_id: item.id,
      entry_date: dateParam,
      status: "pending" as const,
    }));

    const { data: inserted, error: insertError } = await supabase
      .from("wellness_plan_daily_entries")
      .insert(newEntries)
      .select();

    if (insertError) {
      console.error("[wellness-plan/daily] insert error:", insertError);
    } else {
      existingEntries?.push(...(inserted ?? []));
    }
  }

  // 5. Merge plan items with daily entries
  const entryMap = new Map(
    (existingEntries ?? []).map((e) => [e.plan_item_id, e]),
  );

  const items: DailyItem[] = (planItems ?? []).map((item) => {
    const entry = entryMap.get(item.id);
    return {
      plan_item_id: item.id,
      category: item.category,
      item_type: item.item_type,
      title: item.title,
      description: item.description,
      dosage: item.dosage,
      timing: item.timing,
      frequency: item.frequency,
      priority: item.priority,
      evidence_level: item.evidence_level,
      condition_slug: item.condition_slug,
      status: (entry?.status as DailyItem["status"]) ?? "pending",
      completed_at: entry?.completed_at ?? null,
      skip_reason: entry?.skip_reason ?? null,
      user_notes: entry?.user_notes ?? null,
      actual_dosage: entry?.actual_dosage ?? null,
      actual_timing: entry?.actual_timing ?? null,
    };
  });

  const completedCount = items.filter((i) => i.status === "completed").length;
  const skippedCount = items.filter((i) => i.status === "skipped").length;

  const response: DailyResponse = {
    plan_id: planId,
    entry_date: dateParam,
    total_items: items.length,
    completed_items: completedCount,
    skipped_items: skippedCount,
    completion_pct:
      items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0,
    items,
  };

  return NextResponse.json(response, { status: 200 });
}
