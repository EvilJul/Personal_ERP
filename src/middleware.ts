import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "erp-session";

/**
 * 中间件认证检查：验证 JWT 签名和有效期
 */
export async function middleware(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const pathname = request.nextUrl.pathname;

  // 静态资源和认证 API 不需要检查
  const isStatic =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/api/auth");

  if (isStatic) return NextResponse.next();

  const isLogin = pathname === "/login";

  // 未登录且不在登录页 -> 重定向到登录页
  if (!token) {
    if (!isLogin) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  // 已登录：验证 JWT 签名
  try {
    const secret = new TextEncoder().encode(process.env.SESSION_SECRET);
    await jwtVerify(token, secret);
  } catch {
    // JWT 无效，清除 cookie 并重定向到登录页
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete(SESSION_COOKIE);
    return response;
  }

  // 已登录且在登录页 -> 重定向到首页
  if (isLogin) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
