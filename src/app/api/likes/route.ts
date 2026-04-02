/**
 * 点赞 API
 * POST /api/likes - 点赞
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { postId } = await request.json();

    if (!postId) {
      return NextResponse.json(
        { success: false, message: '文章 ID 不能为空' },
        { status: 400 }
      );
    }

    // 获取访客 ID（简化实现，实际应该使用更可靠的方式）
    const visitorId = request.headers.get('x-visitor-id') || 'anonymous';

    // 检查是否已经点赞
    const existingLike = await prisma.like.findFirst({
      where: {
        postId,
        visitorId,
      },
    });

    if (existingLike) {
      return NextResponse.json(
        { success: false, message: '已经点过赞了' },
        { status: 400 }
      );
    }

    // 创建点赞记录并更新文章点赞数
    await prisma.$transaction([
      prisma.like.create({
        data: {
          postId,
          visitorId,
          ipAddress: request.headers.get('x-forwarded-for') || '',
        },
      }),
      prisma.post.update({
        where: { id: postId },
        data: { likeCount: { increment: 1 } },
      }),
    ]);

    // 获取新的点赞数
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { likeCount: true },
    });

    return NextResponse.json({
      success: true,
      message: '点赞成功',
      data: { likeCount: post?.likeCount || 0 },
    });
  } catch (error: any) {
    console.error('Failed to like post:', error);
    return NextResponse.json(
      { success: false, message: '点赞失败' },
      { status: 500 }
    );
  }
}
