/**
 * 单篇文章 API
 * GET    /api/posts/[id] - 获取单篇文章（公开，只返回已发布的）
 * PATCH  /api/posts/[id] - 更新文章（需要管理员登录）
 * DELETE /api/posts/[id] - 删除文章（需要管理员登录）
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/api-auth';

// 获取单篇文章
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, avatar: true } },
        category: { select: { id: true, name: true, slug: true } },
        tags: { select: { id: true, name: true, slug: true } },
        _count: { select: { comments: true } },
      },
    });

    if (!post || post.isDeleted) {
      return NextResponse.json(
        { success: false, message: '文章不存在' },
        { status: 404 }
      );
    }

    // 非已发布文章不对外暴露（只返回公开字段）
    const isPublic = post.status === 'PUBLISHED';
    const responseData = {
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      coverImage: post.coverImage,
      content: post.content,
      status: post.status,
      isPinned: post.isPinned,
      likeCount: post.likeCount,
      commentCount: post._count.comments,
      viewCount: post.viewCount,
      publishedAt: post.publishedAt?.toISOString(),
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      ...(isPublic
        ? {
            category: post.category,
            tags: post.tags,
            author: {
              id: post.author.id,
              name: post.author.name,
              avatar: post.author.avatar,
            },
          }
        : {}),
    };

    return NextResponse.json({
      success: true,
      data: responseData,
    });
  } catch (error: any) {
    console.error('Failed to fetch post:', error);
    return NextResponse.json(
      { success: false, message: '获取文章失败' },
      { status: 500 }
    );
  }
}

// 更新文章 — 需要管理员权限
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // 鉴权检查
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response!;

  try {
    const { id } = await params;
    const body = await request.json();
    const { status, isPinned, title, content, excerpt, coverImage, categoryId, isDeleted } = body;

    // 验证文章是否存在
    const existing = await prisma.post.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, message: '文章不存在' },
        { status: 404 }
      );
    }

    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (isPinned !== undefined) updateData.isPinned = isPinned;
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (coverImage !== undefined) updateData.coverImage = coverImage;
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    if (isDeleted !== undefined) updateData.isDeleted = isDeleted;
    if (status === 'PUBLISHED' && !body.publishedAt) {
      updateData.publishedAt = new Date();
    }

    const post = await prisma.post.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: '更新成功',
      data: {
        ...post,
        publishedAt: post.publishedAt?.toISOString(),
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Failed to update post:', error);
    return NextResponse.json(
      { success: false, message: '更新失败', error: error.message },
      { status: 500 }
    );
  }
}

// 删除文章（软删除） — 需要管理员权限
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // 鉴权检查
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response!;

  try {
    const { id } = await params;

    // 验证文章是否存在
    const existing = await prisma.post.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, message: '文章不存在' },
        { status: 404 }
      );
    }

    await prisma.post.update({
      where: { id },
      data: { isDeleted: true },
    });

    return NextResponse.json({
      success: true,
      message: '删除成功',
    });
  } catch (error: any) {
    console.error('Failed to delete post:', error);
    return NextResponse.json(
      { success: false, message: '删除失败' },
      { status: 500 }
    );
  }
}
