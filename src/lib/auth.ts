/**
 * NextAuth.js 认证配置
 * @see https://next-auth.js.org/
 */

// 自动推断 NEXTAUTH_URL（Vercel 构建时 VERCEL_URL 可用）
if (process.env.VERCEL_URL && !process.env.NEXTAUTH_URL) {
  process.env.NEXTAUTH_URL = `https://${process.env.VERCEL_URL}`;
}

import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import prisma from './prisma';
import type { ExtendedUser } from '@/types';

// ===========================================
// NextAuth 配置选项
// ===========================================

export const authOptions: NextAuthOptions = {
  // 配置多个登录提供商
  providers: [
    // 邮箱密码登录（凭证登录）
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: {
          label: '邮箱',
          type: 'email',
          placeholder: 'your@email.com',
        },
        password: {
          label: '密码',
          type: 'password',
        },
      },
      async authorize(credentials) {
        // 验证输入
        if (!credentials?.email || !credentials?.password) {
          throw new Error('请输入邮箱和密码');
        }

        // 查找用户
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error('用户不存在');
        }

        // 验证密码
        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          throw new Error('密码错误');
        }

        // 返回用户信息
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.avatar,
        } as ExtendedUser;
      },
    }),
  ],

  // 会话配置
  session: {
    strategy: 'jwt', // 使用 JWT 存储会话
    maxAge: 30 * 24 * 60 * 60, // 30 天过期
  },

  // JWT 配置
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 天
  },

  // 回调配置
  callbacks: {
    // JWT 回调 - 登录时将用户信息存入 JWT
    async jwt({ token, user }) {
      if (user) {
        const extendedUser = user as ExtendedUser;
        token.role = extendedUser.role;
        token.avatar = extendedUser.avatar;
      }
      return token;
    },

    // Session 回调 - 从 JWT 中获取用户信息到 session
    async session({ session, token }) {
      if (token && session.user) {
        session.user.role = token.role as ExtendedUser['role'];
        session.user.avatar = token.avatar as string | undefined;
      }
      return session;
    },
  },

  // 页面配置
  pages: {
    signIn: '/login', // 自定义登录页
    error: '/login', // 自定义错误页
    newUser: '/register', // 新用户注册页
  },

  // 调试模式（生产环境关闭）
  debug: process.env.NODE_ENV === 'development',

  // 自定义事件处理
  events: {
    // 登录成功事件
    async signIn({ user }) {
      console.log('用户登录成功:', user.email);
    },
    // 登录错误事件
    async signOut({ token }) {
      console.log('用户登出:', token?.email);
    },
  },
};

// ===========================================
// 获取当前会话用户
// ===========================================

/**
 * 获取当前登录用户的角色
 */
export function getUserRole(user: ExtendedUser | null): string {
  return user?.role || 'GUEST';
}

/**
 * 检查用户是否有管理员权限
 */
export function isAdmin(user: ExtendedUser | null): boolean {
  return user?.role === 'ADMIN';
}

/**
 * 检查用户是否有编辑权限
 */
export function isEditor(user: ExtendedUser | null): boolean {
  return user?.role === 'ADMIN' || user?.role === 'EDITOR';
}

// ===========================================
// 密码工具
// ===========================================

/**
 * 哈希密码
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

/**
 * 验证密码
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// ===========================================
// 认证中间件辅助函数
// ===========================================

/**
 * 检查是否已登录
 */
export function isAuthenticated(session: { user?: ExtendedUser } | null): boolean {
  return !!session?.user;
}

/**
 * 获取用户可访问的路由
 */
export function getAccessibleRoutes(role: string): string[] {
  const commonRoutes = ['/dashboard', '/profile'];

  switch (role) {
    case 'ADMIN':
      return [...commonRoutes, '/admin', '/settings', '/users'];
    case 'EDITOR':
      return [...commonRoutes, '/posts', '/categories', '/tags', '/comments'];
    default:
      return commonRoutes;
  }
}
