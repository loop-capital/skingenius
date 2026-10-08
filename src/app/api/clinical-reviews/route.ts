import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createClinicalReview, getClinicalReviewsByStatus } from "@/lib/clinical/reviews";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    if (!body.scan_id || !body.patient_name || !body.patient_email) {
      return NextResponse.json(
        { error: "Missing required fields: scan_id, patient_name, patient_email" },
        { status: 400 },
      );
    }

    if (!body.consent_hipaa || !body.consent_share) {
      return NextResponse.json(
        { error: "Both consent checkboxes are required" },
        { status: 400 },
      );
    }

    const review = await createClinicalReview({
      ...body,
      user_id: user.id,
    });

    return NextResponse.json({ data: review });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") ?? undefined;

    const reviews = await getClinicalReviewsByStatus(status);
    return NextResponse.json({ data: reviews });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
