/**
 * 评论 API
 * POST /api/comments - 创建评论
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createCommentSchema } from '@/lib/validators';

// 发表评论
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createCommentSchema.parse(body);

    // 创建评论
    const comment = await prisma.comment.create({
      data: {
        content: validated.content,
        authorName: validated.authorName,
        authorEmail: validated.authorEmail || null,
        authorWebsite: validated.authorWebsite || null,
        postId: validated.postId,
        parentId: validated.parentId || null,
        // 默认审核状态，可配置
        isApproved: false,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: '评论提交成功，等待审核',
        data: {
          ...comment,
          createdAt: comment.createdAt.toISOString(),
          updatedAt: comment.updatedAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Failed to create comment:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, message: '参数验证失败', errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: '评论提交失败' },
      { status: 500 }
    );
  }
}

// 获取评论列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');

    const where: any = {};

    if (postId) {
      where.postId = postId;
    }

    const comments = await prisma.comment.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    // 构建树形结构
    const commentMap = new Map();
    const rootComments: any[] = [];

    comments.forEach((comment) => {
      commentMap.set(comment.id, {
        ...comment,
        authorAvatar: comment.user?.avatar || null,
        createdAt: comment.createdAt.toISOString(),
        updatedAt: comment.updatedAt.toISOString(),
        replies: [],
      });
    });

    comments.forEach((comment) => {
      const item = commentMap.get(comment.id);
      if (comment.parentId) {
        const parent = commentMap.get(comment.parentId);
        if (parent) {
          parent.replies.push(item);
        }
      } else {
        rootComments.push(item);
      }
    });

    return NextResponse.json({
      success: true,
      data: rootComments,
    });
  } catch (error: any) {
    console.error('Failed to fetch comments:', error);
    return NextResponse.json(
      { success: false, message: '获取评论失败' },
      { status: 500 }
    );
  }
}
