import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const GOOGLE_OAUTH_SCOPES = [
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/userinfo.profile",
  "https://www.googleapis.com/auth/userinfo.email",
].join(" ");

export async function GET(req: NextRequest) {
  const clientId = (
    process.env.GOOGLE_CLIENT_ID ||
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    ""
  ).trim();

  const lang = req.nextUrl.searchParams.get("lang") === "en" ? "en" : "es";
  const state = (req.nextUrl.searchParams.get("state") || "").trim();

  if (!clientId) {
    return NextResponse.redirect(
      new URL(`/${lang}?tool=ai-image-streamer&drive_error=not_configured`, req.nextUrl.origin)
    );
  }

  const redirectUri = `${req.nextUrl.origin}/google-drive-callback`;
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "token",
    scope: GOOGLE_OAUTH_SCOPES,
    include_granted_scopes: "true",
    prompt: "consent select_account",
  });

  if (state) {
    params.set("state", state);
  }

  return NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  );
}
