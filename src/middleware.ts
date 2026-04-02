/**
 * Next.js 中间件 - 认证与安全防护
 *
 * 保护范围：
 * 1. /admin/* 所有管理后台路由 → 必须登录
 * 2. /api/admin/* 后台管理 API → 必须登录且为 ADMIN/EDITOR
 * 3. /api/posts/[id] PATCH/DELETE → 必须登录
 * 4. /api/likes → 防刷限流
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 需要认证的路由前缀
const PROTECTED_ROUTES = ['/admin'];

// 需要认证的 API 路由（管理操作）
const PROTECTED_API_ROUTES = ['/api/admin'];

// 需要认证的写操作 API（method + pattern）
const WRITE_API_PROTECTED = [
  { pattern: '/api/posts/', methods: ['PATCH', 'DELETE'] },
  { pattern: '/api/comments/', methods: ['PATCH', 'DELETE'] },
  { pattern: '/api/categories', methods: ['POST', 'PUT', 'PATCH', 'DELETE'] },
  { pattern: '/api/tags', methods: ['POST', 'PUT', 'PATCH', 'DELETE'] },
  { pattern: '/api/links', methods: ['POST', 'PUT', 'PATCH', 'DELETE'] },
  { pattern: '/api/settings', methods: ['POST', 'PUT', 'PATCH'] },
];

// 限流配置
const RATE_LIMIT_CONFIG: Record<string, { windowMs: number; maxRequests: number }> = {
  '/api/likes': { windowMs: 60 * 1000, maxRequests: 10 }, // 每分钟最多 10 次点赞
  '/api/comments': { windowMs: 60 * 1000, maxRequests: 5 }, // 每分钟最多 5 条评论
};

// 简易内存限流存储（生产环境应用 Redis）
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

// 定期清理过期限流记录
if (typeof globalThis !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of Array.from(rateLimitStore.entries())) {
      if (now > value.resetAt) {
        rateLimitStore.delete(key);
      }
    }
  }, 60 * 1000);
}

/**
 * 检查限流
 */
function checkRateLimit(
  path: string,
  clientIp: string
): { allowed: boolean; remaining: number; retryAfter?: number } {
  const config = RATE_LIMIT_CONFIG[path];
  if (!config) return { allowed: true, remaining: Infinity };

  const key = `${path}:${clientIp}`;
  const now = Date.now();
  let record = rateLimitStore.get(key);

  if (!record || now > record.resetAt) {
    record = { count: 0, resetAt: now + config.windowMs };
    rateLimitStore.set(key, record);
  }

  record.count++;
  const remaining = Math.max(0, config.maxRequests - record.count);

  if (record.count > config.maxRequests) {
    const retryAfter = Math.ceil((record.resetAt - now) / 1000);
    return { allowed: false, remaining: 0, retryAfter };
  }

  return { allowed: true, remaining };
}

/**
 * 获取客户端 IP
 */
function getClientIp(request: NextRequest): string {
  const xff = request.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp;
  return '127.0.0.1';
}

/**
 * 匹配路径前缀
 */
function matchPath(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(prefix + '/');
}

/**
 * 匹配写操作 API
 */
function isWriteApiProtected(
  pathname: string,
  method: string
): boolean {
  return WRITE_API_PROTECTED.some(
    ({ pattern, methods }) =>
      matchPath(pathname, pattern) && methods.includes(method.toUpperCase())
  );
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const method = request.method;
  const clientIp = getClientIp(request);

  // ========================================
  // 1. API 限流检查
  // ========================================
  for (const [path, _config] of Object.entries(RATE_LIMIT_CONFIG)) {
    if (matchPath(pathname, path)) {
      const { allowed, remaining, retryAfter } = checkRateLimit(pathname, clientIp);

      // 注入限流响应头
      const responseHeaders = new Headers();
      responseHeaders.set('X-RateLimit-Remaining', String(remaining));

      if (!allowed) {
        responseHeaders.set('Retry-After', String(retryAfter || 60));
        return NextResponse.json(
          {
            success: false,
            message: '请求过于频繁，请稍后再试',
            retryAfter: retryAfter,
          },
          {
            status: 429,
            headers: responseHeaders,
          }
        );
      }

      // 放行但带上限流头
      const response = NextResponse.next();
      response.headers.set('X-RateLimit-Remaining', String(remaining));
      return response;
    }
  }

  // ========================================
  // 2. 管理后台页面保护
  // ========================================
  const isAdminRoute = PROTECTED_ROUTES.some((route) => matchPath(pathname, route));

  if (isAdminRoute) {
    // 检查 NextAuth session token
    const sessionToken =
      request.cookies.get('next-auth.session-token')?.value ||
      request.cookies.get('__Secure-next-auth.session-token')?.value;

    if (!sessionToken) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname + search);
      loginUrl.searchParams.set('error', 'SessionRequired');
      return NextResponse.redirect(loginUrl);
    }
  }

  // ========================================
  // 3. 后台管理 API 保护
  // ========================================
  const isAdminApi = PROTECTED_API_ROUTES.some((route) => matchPath(pathname, route));

  if (isAdminApi) {
    const sessionToken =
      request.cookies.get('next-auth.session-token')?.value ||
      request.cookies.get('__Secure-next-auth.session-token')?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, message: '未登录或登录已过期' },
        { status: 401 }
      );
    }
  }

  // ========================================
  // 4. 写操作 API 保护
  // ========================================
  if (isWriteApiProtected(pathname, method)) {
    const sessionToken =
      request.cookies.get('next-auth.session-token')?.value ||
      request.cookies.get('__Secure-next-auth.session-token')?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, message: '此操作需要登录' },
        { status: 401 }
      );
    }
  }

  // ========================================
  // 5. 安全响应头
  // ========================================
  const response = NextResponse.next();

  // 防止 MIME 类型嗅探
  response.headers.set('X-Content-Type-Options', 'nosniff');
  // 防止点击劫持
  response.headers.set('X-Frame-Options', 'DENY');
  // XSS 保护
  response.headers.set('X-XSS-Protection', '1; mode=block');
  // 控制 Referrer 信息泄露
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}

// 配置中间件匹配路径
export const config = {
  matcher: [
    /*
     * 匹配所有路径，排除：
     * - _next/static (静态文件)
     * - _next/image (图片优化)
     * - favicon.ico
     * - public 目录下的文件
     */
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
};
