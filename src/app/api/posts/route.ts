/**
 * 文章列表 API
 * GET /api/posts - 获取文章列表
 *   - 公开：只返回 PUBLISHED 状态
 *   - 管理员：可通过 status 参数筛选任意状态
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { postListQuerySchema } from '@/lib/validators';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // 检查当前用户是否为管理员
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    const isStaff = userRole === 'ADMIN' || userRole === 'EDITOR';

    // 验证查询参数
    const params = {
      page: searchParams.get('page') || '1',
      pageSize: searchParams.get('pageSize') || '10',
      category: searchParams.get('category') || undefined,
      tag: searchParams.get('tag') || undefined,
      status: searchParams.get('status') || undefined,
      search: searchParams.get('search') || undefined,
      sortBy: searchParams.get('sortBy') || 'createdAt',
      sortOrder: searchParams.get('sortOrder') || 'desc',
    };

    const validated = postListQuerySchema.parse(params);

    // 构建查询条件
    const where: any = {
      isDeleted: false,
      // 默认只返回已发布文章（公开访问时）
      status: 'PUBLISHED',
    };

    // 管理员才能查看非 PUBLISHED 状态
    if (isStaff && validated.status) {
      where.status = validated.status;
    } else if (!isStaff && validated.status && validated.status !== 'PUBLISHED') {
      // 非管理员尝试访问非公开状态 → 静默降级为 PUBLISHED
      where.status = 'PUBLISHED';
    }

    if (validated.category) {
      where.category = { slug: validated.category };
    }

    if (validated.tag) {
      where.tags = { some: { slug: validated.tag } };
    }

    if (validated.search) {
      where.OR = [
        { title: { contains: validated.search } },
        { content: { contains: validated.search } },
        { excerpt: { contains: validated.search } },
      ];
    }

    // 查询数据
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          author: { select: { id: true, name: true, avatar: true } },
          category: { select: { id: true, name: true, slug: true } },
          tags: { select: { id: true, name: true, slug: true } },
        },
        orderBy: { [validated.sortBy]: validated.sortOrder },
        skip: (validated.page - 1) * validated.pageSize,
        take: validated.pageSize,
      }),
      prisma.post.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        items: posts.map((post) => ({
          ...post,
          publishedAt: post.publishedAt?.toISOString(),
          createdAt: post.createdAt.toISOString(),
          updatedAt: post.updatedAt.toISOString(),
        })),
        total,
        page: validated.page,
        pageSize: validated.pageSize,
        totalPages: Math.ceil(total / validated.pageSize),
      },
    });
  } catch (error: any) {
    console.error('Failed to fetch posts:', error);
    return NextResponse.json(
      { success: false, message: '获取文章列表失败', error: error.message },
      { status: 500 }
    );
  }
}
