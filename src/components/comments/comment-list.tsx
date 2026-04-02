/**
 * CommentList 评论列表组件
 */

'use client';

import { useState } from 'react';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/input';
import { formatRelativeTime, cn } from '@/lib/utils';
import type { Comment } from '@/types';

interface CommentListProps {
  comments: Comment[];
  onReply?: (parentId: string, content: string, authorName: string) => Promise<void>;
  onLike?: (commentId: string) => Promise<void>;
  onDelete?: (commentId: string) => Promise<void>;
}

export function CommentList({ comments, onReply, onLike, onDelete }: CommentListProps) {
  // 只显示顶级评论
  const topLevelComments = comments.filter((c) => !c.parentId);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
        评论 ({comments.length})
      </h2>

      {topLevelComments.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          还没有评论，来抢沙发吧~
        </div>
      ) : (
        <div className="space-y-6">
          {topLevelComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              replies={comments.filter((c) => c.parentId === comment.id)}
              onReply={onReply}
              onLike={onLike}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface CommentItemProps {
  comment: Comment;
  replies: Comment[];
  depth?: number;
  onReply?: (parentId: string, content: string, authorName: string) => Promise<void>;
  onLike?: (commentId: string) => Promise<void>;
  onDelete?: (commentId: string) => Promise<void>;
}

function CommentItem({ comment, replies, depth = 0, onReply, onLike, onDelete }: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const maxDepth = 3;

  const handleSubmitReply = async () => {
    if (!replyContent.trim() || !onReply) return;

    setIsSubmitting(true);
    try {
      await onReply(comment.id, replyContent, 'Guest');
      setReplyContent('');
      setShowReplyForm(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async () => {
    if (!onLike) return;
    setIsLiked(true);
    await onLike(comment.id);
  };

  return (
    <div className={cn('animate-fade-in', depth > 0 && 'ml-6 pl-4 border-l-2 border-gray-200 dark:border-gray-700')}>
      <div className="flex gap-3">
        <Avatar src={comment.authorAvatar} fallback={comment.authorName} size="md" />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-gray-900 dark:text-white">
              {comment.authorName}
            </span>
            {comment.authorWebsite && (
              <a
                href={comment.authorWebsite}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gray-500 hover:text-primary-600"
              >
                🌐
              </a>
            )}
            <span className="text-xs text-gray-400">
              {formatRelativeTime(comment.createdAt)}
            </span>
          </div>

          <div className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap">
            {comment.content}
          </div>

          <div className="flex items-center gap-4 mt-2">
            <button
              onClick={handleLike}
              disabled={!onLike}
              className={cn(
                'flex items-center gap-1 text-xs transition-colors',
                isLiked ? 'text-primary-600' : 'text-gray-400 hover:text-primary-600'
              )}
            >
              <svg className="w-4 h-4" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>点赞</span>
            </button>

            {depth < maxDepth && (
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="text-xs text-gray-400 hover:text-primary-600 transition-colors"
              >
                回复
              </button>
            )}
          </div>

          {/* 回复表单 */}
          {showReplyForm && (
            <div className="mt-4 space-y-3">
              <Textarea
                placeholder={`回复 @${comment.authorName}...`}
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                rows={3}
              />
              <div className="flex gap-2">
                <Button size="sm" isLoading={isSubmitting} onClick={handleSubmitReply}>
                  提交回复
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setShowReplyForm(false)}>
                  取消
                </Button>
              </div>
            </div>
          )}

          {/* 子评论 */}
          {replies.length > 0 && (
            <div className="mt-4 space-y-4">
              {replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  replies={[]}
                  depth={depth + 1}
                  onReply={onReply}
                  onLike={onLike}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
