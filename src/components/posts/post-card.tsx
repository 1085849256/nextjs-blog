/**
 * PostCard 文章卡片组件
 */

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { formatDate, formatRelativeTime } from '@/lib/utils';
import type { PostListItem } from '@/types';

interface PostCardProps {
  post: PostListItem;
  featured?: boolean;
}

export function PostCard({ post, featured = false }: PostCardProps) {
  const {
    title,
    slug,
    excerpt,
    coverImage,
    publishedAt,
    viewCount,
    likeCount,
    author,
    category,
    tags,
    isPinned,
  } = post;

  if (featured) {
    return (
      <Card className="group overflow-hidden" padding="none" hover>
        <Link href={`/posts/${slug}`} className="block">
          <div className="grid md:grid-cols-2">
            {/* Cover Image */}
            {coverImage && (
              <div className="relative aspect-[16/10] md:aspect-auto overflow-hidden">
                <Image
                  src={coverImage}
                  alt={title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            )}
            {/* Content */}
            <div className="flex flex-col justify-center p-6 md:p-8">
              <div className="flex items-center gap-2 mb-3">
                {isPinned && (
                  <Badge variant="warning" size="sm">
                    🔥 置顶
                  </Badge>
                )}
                {category && (
                  <Badge variant="primary" size="sm">
                    {category.name}
                  </Badge>
                )}
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors mb-4">
                {title}
              </h2>
              {excerpt && (
                <p className="text-gray-600 dark:text-gray-300 line-clamp-3 mb-4">
                  {excerpt}
                </p>
              )}
              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <Avatar src={author.avatar} fallback={author.name} size="sm" />
                  <span>{author.name}</span>
                </div>
                <span>·</span>
                <time dateTime={publishedAt || undefined}>
                  {publishedAt ? formatRelativeTime(publishedAt) : '草稿'}
                </time>
                <span>·</span>
                <span>{viewCount} 阅读</span>
              </div>
            </div>
          </div>
        </Link>
      </Card>
    );
  }

  return (
    <Card className="group overflow-hidden" padding="none" hover>
      <Link href={`/posts/${slug}`} className="block">
        {/* Cover Image */}
        {coverImage && (
          <div className="relative aspect-[16/9] overflow-hidden">
            <Image
              src={coverImage}
              alt={title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}
        {/* Content */}
        <div className="p-5">
          <div className="flex items-center gap-2 mb-2">
            {isPinned && (
              <Badge variant="warning" size="sm">
                🔥 置顶
              </Badge>
            )}
            {category && (
              <Badge variant="primary" size="sm">
                {category.name}
              </Badge>
            )}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors mb-2 line-clamp-2">
            {title}
          </h3>
          {excerpt && (
            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">
              {excerpt}
            </p>
          )}
          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1.5">
              <Avatar src={author.avatar} fallback={author.name} size="sm" />
              <span>{author.name}</span>
            </div>
            <span>·</span>
            <time dateTime={publishedAt || undefined}>
              {publishedAt ? formatDate(publishedAt) : '草稿'}
            </time>
            <span>·</span>
            <span>{viewCount} 阅读</span>
          </div>
          {/* Tags */}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {tags.slice(0, 3).map((tag) => (
                <span
                  key={tag.id}
                  className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded"
                >
                  #{tag.name}
                </span>
              ))}
              {tags.length > 3 && (
                <span className="px-2 py-0.5 text-xs text-gray-500">
                  +{tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </Link>
    </Card>
  );
}
