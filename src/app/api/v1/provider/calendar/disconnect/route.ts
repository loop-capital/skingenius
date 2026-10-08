import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createServiceClient } from "@/utils/supabase/service";
import { decryptRefreshToken, revokeGoogleAccess } from "@/lib/provider/google-calendar";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const serviceClient = createServiceClient();
    const { data: token } = await serviceClient
      .from("provider_calendar_tokens")
      .select("encrypted_refresh_token")
      .eq("provider_id", user.id)
      .single();

    if (token?.encrypted_refresh_token) {
      const refreshToken = decryptRefreshToken(token.encrypted_refresh_token);
      await revokeGoogleAccess(refreshToken);
    }

    await serviceClient
      .from("provider_calendar_tokens")
      .delete()
      .eq("provider_id", user.id);

    return NextResponse.json({ success: true, disconnected: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Disconnect failed", message: e.message },
      { status: 500 }
    );
  }
}
