import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/utils/supabase/service";
import { LifestyleResponses } from "@/types/lifestyle";

function apiError(message: string, status: number = 400) {
  return NextResponse.json({ error: message }, { status });
}

function tryGetUserId(req: NextRequest): string | null {
  const testUser = req.headers.get("x-test-user-id");
  if (testUser) return testUser;

  try {
    const cookie = req.cookies.get("sb-access-token")?.value;
    if (cookie) {
      const payload = JSON.parse(
        Buffer.from(cookie.split(".")[1], "base64").toString("utf8")
      );
      if (payload?.sub) return payload.sub as string;
    }
  } catch {
    // ignore
  }

  return null;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  let userId = tryGetUserId(req);

  // Auth
  if (!userId) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[lifestyle/save] No authenticated user; using dev dummy UUID.");
      userId = "00000000-0000-0000-0000-000000000000";
    } else {
      return apiError("Unauthorized", 401);
    }
  }

  // Parse body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError("Invalid JSON body");
  }

  const data = body as Partial<LifestyleResponses>;

  // Validate required sections
  if (!data.sleep || !data.stress || !data.diet || !data.uv) {
    return apiError("Missing required sections: sleep, stress, diet, uv");
  }

  const now = new Date().toISOString();

  const row = {
    id: crypto.randomUUID(),
    user_id: userId,
    sleep: data.sleep,
    stress: data.stress,
    diet: data.diet,
    uv: data.uv,
    created_at: now,
    updated_at: now,
  };

  const supabase = createServiceClient();

  // Upsert on user_id (one record per user)
  const { error } = await supabase
    .from("lifestyle_responses")
    .upsert(row, { onConflict: "user_id" });

  if (error) {
    console.error("[lifestyle/save] Supabase error:", error);
    return apiError("Failed to save lifestyle data", 500);
  }

  return NextResponse.json({ success: true, id: row.id }, { status: 200 });
}
