import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "erp-session";

/**
 * 中间层认证检查：仅验证 cookie 是否存在且非空
 * 完整的 session token 有效性验证在 API routes / Server Components 中
 * 通过 auth.ts 的 isAuthenticated() 完成
 */
export function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get(SESSION_COOKIE)?.value;
  const hasSession = !!sessionToken && sessionToken.length > 0;
  const pathname = request.nextUrl.pathname;

  // 静态资源和认证 API 不需要检查
  const isStatic =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/api/auth");

  if (isStatic) return NextResponse.next();

  const isLogin = pathname === "/login";

  // 未登录且不在登录页 -> 重定向到登录页
  if (!hasSession && !isLogin) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 已登录但在登录页 -> 重定向到首页
  if (hasSession && isLogin) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
