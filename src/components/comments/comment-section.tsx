/**
 * CommentSection 评论组件
 */

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { CommentList } from './comment-list';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { Comment } from '@/types';

interface CommentSectionProps {
  postId: string;
  comments: (Comment & { authorAvatar?: string })[];
}

interface CommentFormData {
  authorName: string;
  authorEmail: string;
  authorWebsite: string;
  content: string;
}

export function CommentSection({ postId, comments }: CommentSectionProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commentList, setCommentList] = useState(comments);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CommentFormData>({
    defaultValues: {
      authorName: '',
      authorEmail: '',
      authorWebsite: '',
      content: '',
    },
  });

  const onSubmit = async (data: CommentFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          postId,
        }),
      });

      if (response.ok) {
        const newComment = await response.json();
        setCommentList([...commentList, { ...newComment, replies: [] }]);
        reset();
      }
    } catch (error) {
      console.error('Failed to submit comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = async (parentId: string, content: string, authorName: string) => {
    try {
      const response = await fetch(`/api/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          authorName,
          postId,
          parentId,
        }),
      });

      if (response.ok) {
        const newReply = await response.json();
        setCommentList((prev) =>
          prev.map((c) =>
            c.id === parentId
              ? { ...c, replies: [...(c.replies || []), newReply] }
              : c
          )
        );
      }
    } catch (error) {
      console.error('Failed to submit reply:', error);
    }
  };

  return (
    <div className="space-y-8">
      {/* 评论列表 */}
      <CommentList comments={commentList} onReply={handleReply} />

      {/* 发表评论 */}
      <div className="border-t pt-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          发表评论
        </h3>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="昵称"
              placeholder="请输入昵称"
              required
              error={errors.authorName?.message}
              {...register('authorName', {
                required: '请输入昵称',
                minLength: { value: 2, message: '昵称至少2个字符' },
              })}
            />
            <Input
              label="邮箱"
              type="email"
              placeholder="选填，用于显示头像"
              error={errors.authorEmail?.message}
              {...register('authorEmail')}
            />
          </div>

          <Input
            label="网站"
            type="url"
            placeholder="选填，如 https://example.com"
            error={errors.authorWebsite?.message}
            {...register('authorWebsite')}
          />

          <Textarea
            label="评论内容"
            placeholder="请输入评论内容..."
            rows={5}
            required
            error={errors.content?.message}
            {...register('content', {
              required: '请输入评论内容',
              minLength: { value: 2, message: '评论内容至少2个字符' },
            })}
          />

          <div className="text-sm text-gray-500 dark:text-gray-400">
            <p>评论需要审核后才会显示，请耐心等待。</p>
          </div>

          <Button type="submit" isLoading={isSubmitting}>
            提交评论
          </Button>
        </form>
      </div>
    </div>
  );
}
