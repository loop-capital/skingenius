import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getGoogleOAuthUrl } from "@/lib/provider/google-calendar";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const returnUrl = req.nextUrl.searchParams.get("returnUrl") || "/provider/calendar/settings";
    const state = Buffer.from(
      JSON.stringify({ providerId: user.id, returnUrl })
    ).toString("base64url");

    const url = getGoogleOAuthUrl(state);
    return NextResponse.redirect(url);
  } catch (e: any) {
    return NextResponse.json(
      { error: "Failed to start Google OAuth", message: e.message },
      { status: 500 }
    );
  }
}
