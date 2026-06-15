import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/utils/supabase/service";

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------

interface CheckinRequest {
  user_id: string;
  plan_item_id: string;
  date?: string; // defaults to today
  status: "completed" | "skipped" | "partially_completed";
  skip_reason?: string;
  user_notes?: string;
  actual_dosage?: string;
  actual_timing?: string;
}

// ------------------------------------------------------------------
// Utility
// ------------------------------------------------------------------

function apiError(message: string, status = 400): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

// ------------------------------------------------------------------
// POST /api/v1/wellness-plan/checkin
// ------------------------------------------------------------------

export async function POST(request: NextRequest): Promise<NextResponse> {
  const supabase = createServiceClient();

  let body: CheckinRequest;
  try {
    body = await request.json();
  } catch {
    return apiError("Invalid JSON body");
  }

  const {
    user_id,
    plan_item_id,
    date = new Date().toISOString().split("T")[0],
    status,
    skip_reason,
    user_notes,
    actual_dosage,
    actual_timing,
  } = body;

  if (!user_id || !plan_item_id || !status) {
    return apiError("user_id, plan_item_id, and status are required");
  }

  // 1. Verify the plan item belongs to this user
  const { data: itemData, error: itemError } = await supabase
    .from("wellness_plan_items")
    .select("id, plan_id, plan:user_id")
    .eq("id", plan_item_id)
    .single();

  if (itemError || !itemData) {
    return apiError("Plan item not found", 404);
  }

  // 2. Upsert daily entry
  const upsertPayload = {
    user_id,
    plan_id: itemData.plan_id,
    plan_item_id,
    entry_date: date,
    status,
    completed_at: status === "completed" ? new Date().toISOString() : null,
    skip_reason: status === "skipped" ? skip_reason : null,
    user_notes: user_notes ?? null,
    actual_dosage: actual_dosage ?? null,
    actual_timing: actual_timing ?? null,
  };

  const { data: upserted, error: upsertError } = await supabase
    .from("wellness_plan_daily_entries")
    .upsert(upsertPayload, { onConflict: "plan_item_id,entry_date" })
    .select()
    .single();

  if (upsertError) {
    console.error("[wellness-plan/checkin] upsert error:", upsertError);
    return apiError("Failed to record check-in", 500);
  }

  // 3. Return the updated entry
  return NextResponse.json(
    {
      plan_item_id,
      status: upserted.status,
      completed_at: upserted.completed_at,
      skip_reason: upserted.skip_reason,
      user_notes: upserted.user_notes,
      actual_dosage: upserted.actual_dosage,
      actual_timing: upserted.actual_timing,
      entry_date: upserted.entry_date,
    },
    { status: 200 },
  );
}
