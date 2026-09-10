import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { skin_conditions } = body;

    if (!skin_conditions || skin_conditions.length === 0) {
      return NextResponse.json(
        { error: "skin_conditions is required" },
        { status: 400 }
      );
    }

    // Test the connection first
    const { createClient } = await import("@supabase/supabase-js");

    const url = process.env.GETUPLOOK_SUPABASE_URL || "***";
    const key = ***

    const supabase = createClient(url, key);

    // Just try to fetch users to test the connection
    const { data, error, count } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true });

    if (error) {
      return NextResponse.json({
        error: "Supabase connection failed",
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Connection works",
      user_count: count,
      conditions: skin_conditions,
    });
  } catch (e) {
    const error = e as Error;
    return NextResponse.json({
      error: "Server error",
      message: error.message,
      stack: error.stack,
      name: error.name,
    }, { status: 500 });
  }
}
