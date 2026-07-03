import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { timingSafeEqual } from "crypto";

const SESSION_COOKIE = "erp-session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 天

// JWT secret - 从环境变量读取，或使用默认值
function getSecret() {
  const secret =
    process.env.SESSION_SECRET ||
    "personal-erp-default-secret-change-in-production";
  return new TextEncoder().encode(secret);
}

/**
 * 验证用户输入的密码是否与环境变量中的密码匹配
 * 使用 timingSafeEqual 防止时序攻击
 */
export function validatePassword(password: string): boolean {
  const expected = process.env.APP_PASSWORD;
  if (!expected) return false;
  const a = Buffer.from(password, "utf-8");
  const b = Buffer.from(expected, "utf-8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/**
 * 创建 JWT session cookie，设置 7 天过期
 */
export async function createSession(): Promise<void> {
  const token = await new SignJWT({ authenticated: true })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getSecret());

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

/**
 * 销毁会话 cookie
 */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

/**
 * 检查当前请求是否已通过认证
 * 验证 JWT token 签名和过期时间
 */
export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return false;

  try {
    await jwtVerify(token, getSecret());
    return true;
  } catch {
    return false;
  }
}

/**
 * 检查给定的 session token 是否有效（供 middleware 等外部使用）
 * 注意：JWT 签名验证是异步操作，此同步函数仅做基本非空检查
 * 完整验证应在 Server Component / API Route 中使用 isAuthenticated()
 */
export function isValidSessionToken(token: string): boolean {
  return !!token && token.length > 0;
}
