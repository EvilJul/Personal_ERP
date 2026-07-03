import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "erp-session";
const SESSION_VALUE = "authenticated";

export function middleware(request: NextRequest) {
  const session = request.cookies.get(SESSION_COOKIE);
  const isAuthenticated =
    session?.value === SESSION_VALUE;
  const pathname = request.nextUrl.pathname;

  // 静态资源和认证 API 不需要检查
  const isStatic =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/api/auth");

  if (isStatic) return NextResponse.next();

  const isLogin = pathname === "/login";

  // 未登录且不在登录页 -> 重定向到登录页
  if (!isAuthenticated && !isLogin) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 已登录但在登录页 -> 重定向到首页
  if (isAuthenticated && isLogin) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
