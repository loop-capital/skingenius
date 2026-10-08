import { NextRequest, NextResponse } from "next/server";
import { getProviderWithServices } from "@/lib/booking/providers";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const provider = await getProviderWithServices(id);

    if (!provider) {
      return NextResponse.json(
        { error: "Provider not found or not bookable" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, provider });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: "Failed to load provider", detail: message },
      { status: 500 }
    );
  }
}
