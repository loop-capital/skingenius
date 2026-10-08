import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import {
  exchangeCodeForTokens,
  encryptRefreshToken,
  getOrCreateProviderCalendarSettings,
} from "@/lib/provider/google-calendar";

export async function GET(req: NextRequest) {
  try {
    const code = req.nextUrl.searchParams.get("code");
    const stateParam = req.nextUrl.searchParams.get("state");
    const errorParam = req.nextUrl.searchParams.get("error");

    if (errorParam) {
      return NextResponse.json(
        { error: "Google OAuth denied", details: errorParam },
        { status: 400 }
      );
    }

    if (!code || !stateParam) {
      return NextResponse.json(
        { error: "Missing code or state" },
        { status: 400 }
      );
    }

    let state: { providerId?: string; returnUrl?: string };
    try {
      state = JSON.parse(Buffer.from(stateParam, "base64url").toString("utf8"));
    } catch {
      return NextResponse.json({ error: "Invalid state" }, { status: 400 });
    }

    if (!state.providerId) {
      return NextResponse.json({ error: "Missing provider id" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user || user.id !== state.providerId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const tokens = await exchangeCodeForTokens(code);

    if (!tokens.refresh_token) {
      return NextResponse.json(
        { error: "No refresh token returned. Please reconnect and ensure consent is granted." },
        { status: 400 }
      );
    }

    const encryptedRefresh = encryptRefreshToken(tokens.refresh_token);
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

    await supabase.from("provider_calendar_tokens").upsert(
      {
        provider_id: user.id,
        encrypted_refresh_token: encryptedRefresh,
        access_token: tokens.access_token,
        expires_at: expiresAt,
        scope: tokens.scope.split(" "),
        connected: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "provider_id" }
    );

    await getOrCreateProviderCalendarSettings(user.id);

    const returnUrl = state.returnUrl || "/provider/calendar/settings";
    return NextResponse.redirect(new URL(returnUrl, req.url));
  } catch (e: any) {
    return NextResponse.json(
      { error: "Google OAuth callback failed", message: e.message },
      { status: 500 }
    );
  }
}
