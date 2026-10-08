import { NextRequest, NextResponse } from "next/server";
import { getBookableProviders } from "@/lib/booking/providers";

export async function GET(_req: NextRequest) {
  try {
    const providers = await getBookableProviders();
    return NextResponse.json({ success: true, providers });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: "Failed to load providers", detail: message },
      { status: 500 }
    );
  }
}
