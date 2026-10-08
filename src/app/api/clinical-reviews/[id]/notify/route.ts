import { NextRequest, NextResponse } from "next/server";
import {
  getClinicalReviewById,
  updateClinicalReview,
  logClinicalReviewEmail,
} from "@/lib/clinical/reviews";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const review = await getClinicalReviewById(id);

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    const updated = await updateClinicalReview(id, {
      status: "complete",
      completed_at: new Date().toISOString(),
    });

    await logClinicalReviewEmail(review.id, review.patient_email);

    return NextResponse.json({ data: updated });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
