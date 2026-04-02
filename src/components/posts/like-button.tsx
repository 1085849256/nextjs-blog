/**
 * LikeButton 点赞按钮组件
 */

'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface LikeButtonProps {
  postId: string;
  likeCount: number;
}

export function LikeButton({ postId, likeCount }: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [count, setCount] = useState(likeCount);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // 检查是否已经点赞
    const liked = localStorage.getItem(`liked_${postId}`);
    if (liked === 'true') {
      setIsLiked(true);
    }
  }, [postId]);

  const handleLike = async () => {
    if (isLiked) return;

    // 乐观更新 UI
    setIsLiked(true);
    setCount(count + 1);
    setIsAnimating(true);

    // 持久化到本地
    localStorage.setItem(`liked_${postId}`, 'true');

    try {
      await fetch(`/api/likes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId }),
      });
    } catch (error) {
      // 失败回滚
      setIsLiked(false);
      setCount(count);
      localStorage.removeItem(`liked_${postId}`);
      console.error('Failed to like post:', error);
    } finally {
      setTimeout(() => setIsAnimating(false), 500);
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={isLiked}
      className={cn(
        'inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all duration-300',
        isLiked
          ? 'border-primary-500 bg-primary-50 text-primary-600 dark:bg-primary-900/30 cursor-default'
          : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-primary-500 hover:text-primary-600',
        isAnimating && 'scale-110'
      )}
    >
      {/* Heart Icon */}
      <svg
        className={cn(
          'w-5 h-5 transition-all',
          isLiked && 'fill-current',
          isAnimating && 'animate-pulse'
        )}
        fill={isLiked ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>

      <span className="font-medium">{isLiked ? '已点赞' : '点赞'}</span>
      <span className="text-sm opacity-70">({count})</span>
    </button>
  );
}
