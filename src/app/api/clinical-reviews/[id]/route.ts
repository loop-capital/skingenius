import { NextRequest, NextResponse } from "next/server";
import { getClinicalReviewById, updateClinicalReview } from "@/lib/clinical/reviews";
import { ClinicalReviewUpdate } from "@/types/clinical";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const review = await getClinicalReviewById(id);

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    return NextResponse.json({ data: review });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body: ClinicalReviewUpdate = await req.json();

    const review = await updateClinicalReview(id, body);
    return NextResponse.json({ data: review });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
