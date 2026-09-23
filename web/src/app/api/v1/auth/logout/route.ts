import { NextResponse } from "next/server";
import { withApi } from "@/lib/api-guard";

async function handler() {
  const response = NextResponse.json({ ok: true }, { status: 200 });

  response.cookies.set("hc_token", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return response;
}

export const POST = withApi(handler);
