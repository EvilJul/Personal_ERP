import { cookies } from "next/headers";

const SESSION_COOKIE = "erp-session";
const SESSION_VALUE = "authenticated";

/**
 * 验证用户输入的密码是否与环境变量中的密码匹配
 */
export function validatePassword(password: string): boolean {
  const expected = process.env.APP_PASSWORD;
  if (!expected) return false;
  return password === expected;
}

/**
 * 创建会话 cookie，设置 7 天过期
 */
export async function createSession(): Promise<Response> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, SESSION_VALUE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  return new Response(null, { status: 200 });
}

/**
 * 销毁会话 cookie
 */
export async function destroySession(): Promise<Response> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  return new Response(null, { status: 200 });
}

/**
 * 检查当前请求是否已通过认证
 */
export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value === SESSION_VALUE;
}
