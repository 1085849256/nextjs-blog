/**
 * API 路由认证工具
 * 提供统一的鉴权检查函数，供 API 路由调用
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, isAdmin, isEditor } from '@/lib/auth';

/**
 * 检查 API 请求是否已认证
 * 未认证时直接返回 401 响应，已认证返回用户信息
 */
export async function requireAuth(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return {
        ok: false,
        response: NextResponse.json(
          { success: false, message: '未登录或登录已过期' },
          { status: 401 }
        ),
        session: null,
      };
    }

    return { ok: true, response: null, session };
  } catch {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, message: '认证检查失败' },
        { status: 500 }
      ),
      session: null,
    };
  }
}

/**
 * 检查 API 请求是否为管理员
 */
export async function requireAdmin(request: NextRequest) {
  const auth = await requireAuth(request);

  if (!auth.ok || !auth.session) {
    return auth;
  }

  const role = (auth.session.user as any).role;
  if (role !== 'ADMIN' && role !== 'EDITOR') {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, message: '权限不足，需要管理员权限' },
        { status: 403 }
      ),
      session: auth.session,
    };
  }

  return { ok: true, response: null, session: auth.session };
}
