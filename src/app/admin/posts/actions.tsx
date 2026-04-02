/**
 * 文章操作按钮组件
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface ActionButtonProps {
  postId: string;
}

export function DeletePostButton({ postId }: ActionButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('确定要删除这篇文章吗？')) return;

    setIsDeleting(true);
    try {
      await fetch(`/api/posts/${postId}`, { method: 'DELETE' });
      router.refresh();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button size="sm" variant="ghost" onClick={handleDelete} isLoading={isDeleting}>
      删除
    </Button>
  );
}

export function TogglePostStatus({ postId, currentStatus }: ActionButtonProps & { currentStatus: string }) {
  const router = useRouter();
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = async () => {
    setIsToggling(true);
    try {
      const newStatus = currentStatus === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
      await fetch(`/api/posts/${postId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      router.refresh();
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <Button size="sm" variant="ghost" onClick={handleToggle} isLoading={isToggling}>
      {currentStatus === 'PUBLISHED' ? '取消发布' : '发布'}
    </Button>
  );
}

export function TogglePinnedButton({ postId, isPinned }: ActionButtonProps & { isPinned: boolean }) {
  const router = useRouter();
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = async () => {
    setIsToggling(true);
    try {
      await fetch(`/api/posts/${postId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPinned: !isPinned }),
      });
      router.refresh();
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <Button size="sm" variant="ghost" onClick={handleToggle} isLoading={isToggling}>
      {isPinned ? '取消置顶' : '置顶'}
    </Button>
  );
}
