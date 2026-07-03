import { randomUUID, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const SESSION_COOKIE = "erp-session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 天（秒）

// 服务端 session 存储，key 为随机 token，value 为创建时间
const sessions = new Map<string, { createdAt: number }>();

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
 * 生成随机 session token 并存入服务端 Map
 */
export function generateSessionToken(): string {
  const token = randomUUID();
  sessions.set(token, { createdAt: Date.now() });
  return token;
}

/**
 * 创建会话 cookie，设置 7 天过期
 */
export async function createSession(): Promise<Response> {
  const token = generateSessionToken();
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
  return new Response(null, { status: 200 });
}

/**
 * 销毁会话 cookie 及对应的 session 记录
 */
export async function destroySession(): Promise<Response> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    sessions.delete(token);
  }
  cookieStore.delete(SESSION_COOKIE);
  return new Response(null, { status: 200 });
}

/**
 * 检查当前请求是否已通过认证
 * 先验证 cookie 存在，再验证 session token 是否有效且未过期
 */
export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return false;

  const session = sessions.get(token);
  if (!session) return false;

  // 检查 session 是否过期
  if (Date.now() - session.createdAt > SESSION_MAX_AGE * 1000) {
    sessions.delete(token);
    return false;
  }

  return true;
}

/**
 * 检查给定的 session token 是否有效（供 middleware 等外部使用）
 */
export function isValidSessionToken(token: string): boolean {
  const session = sessions.get(token);
  if (!session) return false;
  if (Date.now() - session.createdAt > SESSION_MAX_AGE * 1000) {
    sessions.delete(token);
    return false;
  }
  return true;
}
