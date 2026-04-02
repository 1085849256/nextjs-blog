/**
 * 搜索页面
 */

'use client';

import { Suspense } from 'react';
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { PostCard } from '@/components/posts/post-card';
import { Card } from '@/components/ui/card';
import type { PostListItem } from '@/types';

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<PostListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    try {
      const params = new URLSearchParams({ search: q, page: '1', pageSize: '20' });
      const response = await fetch(`/api/posts?${params}`);
      const data = await response.json();

      if (data.success) {
        setResults(data.data.items);
      }
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 初始化搜索
  useEffect(() => {
    if (initialQuery) {
      search(initialQuery);
    }
  }, [initialQuery, search]);

  // 防抖搜索
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query !== initialQuery) {
        search(query);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, initialQuery, search]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* 搜索框 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">搜索</h1>
        <div className="relative">
          <Input
            type="search"
            placeholder="搜索文章..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-12 text-lg py-6"
            autoFocus
          />
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* 加载状态 */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-gray-500">搜索中...</p>
        </div>
      )}

      {/* 搜索结果 */}
      {!isLoading && hasSearched && (
        <div>
          <p className="text-gray-500 mb-6">
            {results.length > 0
              ? `找到 ${results.length} 个结果`
              : '未找到相关文章'}
          </p>

          {results.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              {results.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                没有找到包含「{query}」的文章
              </p>
              <p className="text-sm text-gray-400 mt-2">
                试试其他关键词？
              </p>
            </Card>
          )}
        </div>
      )}

      {/* 初始状态 */}
      {!isLoading && !hasSearched && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            输入关键词搜索文章
          </p>
        </div>
      )}
    </div>
  );
}

function SearchFallback() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">搜索</h1>
      <div className="text-center py-12">
        <div className="inline-block w-8 h-8 border-4 border-gray-300 border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-gray-500">加载搜索...</p>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchFallback />}>
      <SearchContent />
    </Suspense>
  );
}
