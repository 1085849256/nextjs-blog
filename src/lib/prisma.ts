/**
 * Prisma 客户端单例
 *
 * 在开发环境中避免热重载时创建多个 Prisma 实例
 * @see https://www.prisma.io/docs/guides/database/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices
 */

import { PrismaClient } from '@prisma/client';

// 全局变量存储 Prisma 实例
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// 根据环境创建或复用 Prisma 实例
export const prisma =
  global.prisma ||
  new PrismaClient({
    // 开发环境启用日志
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

// 生产环境外，所有热重载都复用同一个实例
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma;
