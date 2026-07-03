import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** POST /api/auth/logout - 登出并销毁 session */
export async function POST() {
  await destroySession();

  const baseUrl =
    process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
  return NextResponse.redirect(new URL("/login", baseUrl));
}
