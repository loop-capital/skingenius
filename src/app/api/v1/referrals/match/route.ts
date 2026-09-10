import { NextRequest, NextResponse } from "next/server";
import { matchProviders } from "@/lib/getuplook";

interface MatchRequest {
  skin_conditions: string[];
  scan_id?: string;
  user_id?: string;
}

// POST /api/v1/referrals/match
export async function POST(req: NextRequest) {
  try {
    const body: MatchRequest = await req.json();
    const { skin_conditions } = body;

    if (
      !skin_conditions ||
      !Array.isArray(skin_conditions) ||
      skin_conditions.length === 0
    ) {
      return NextResponse.json(
        { error: "skin_conditions array is required" },
        { status: 400 },
      );
    }

    // Match providers based on skin conditions
    const matches = await matchProviders(skin_conditions);

    return NextResponse.json({
      success: true,
      matches,
      total_matches: matches.length,
    });
  } catch (error) {
    console.error("Provider matching error:", error);

    // Return the actual error details for debugging
    const errorMessage =
      error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    return NextResponse.json(
      {
        error: "Failed to match providers",
        details: errorMessage,
        stack: errorStack,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}

// GET /api/v1/referrals/match - Get all providers (for testing)
export async function GET() {
  try {
    const matches = await matchProviders(["acne", "wrinkles"]); // Test query
    return NextResponse.json({ matches, total_matches: matches.length });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
