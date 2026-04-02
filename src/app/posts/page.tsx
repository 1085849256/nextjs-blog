/**
 * 文章列表页
 */

import { Suspense } from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { PostCard } from '@/components/posts/post-card';
import { Pagination } from '@/components/ui/pagination';
import type { PostListItem } from '@/types';

interface PageProps {
  searchParams: Promise<{ page?: string; category?: string; tag?: string }>;
}

// 获取文章列表
async function getPosts(params: { page: number; category?: string; tag?: string }) {
  const { page, category, tag } = params;
  const pageSize = 9;

  const where: any = {
    status: 'PUBLISHED',
    isDeleted: false,
  };

  if (category) {
    const cat = await prisma.category.findUnique({ where: { slug: category } });
    if (cat) {
      where.categoryId = cat.id;
    }
  }

  if (tag) {
    const tagRecord = await prisma.tag.findUnique({ where: { slug: tag } });
    if (tagRecord) {
      where.tags = { some: { id: tagRecord.id } };
    }
  }

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      include: {
        author: { select: { id: true, name: true, avatar: true } },
        category: { select: { id: true, name: true, slug: true } },
        tags: { select: { id: true, name: true, slug: true } },
      },
      orderBy: [{ isPinned: 'desc' }, { publishedAt: 'desc' }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.post.count({ where }),
  ]);

  return {
    posts: posts.map((post) => ({
      ...post,
      publishedAt: post.publishedAt?.toISOString(),
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    })) as PostListItem[],
    total,
    totalPages: Math.ceil(total / pageSize),
  };
}

// 获取所有分类
async function getCategories() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { posts: true } } },
    orderBy: { order: 'asc' },
  });
  return categories;
}

// 获取所有标签
async function getTags() {
  const tags = await prisma.tag.findMany({
    include: { _count: { select: { posts: true } } },
    orderBy: { name: 'asc' },
  });
  return tags;
}

export default async function PostsPage({ searchParams }: PageProps) {
  const { page: pageParam, category, tag } = await searchParams;
  const page = parseInt(pageParam || '1');
  const { posts, total, totalPages } = await getPosts({ page, category, tag });
  const [categories, tags] = await Promise.all([getCategories(), getTags()]);

  const currentCategory = category
    ? categories.find((c) => c.slug === category)
    : null;
  const currentTag = tag ? tags.find((t) => t.slug === tag) : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {currentCategory ? currentCategory.name : currentTag ? `#${currentTag.name}` : '所有文章'}
        </h1>
        {(currentCategory || currentTag) && (
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            {currentCategory?.description || `标签 ${currentTag?.name} 下的文章`}
          </p>
        )}
      </div>

      <div className="grid lg:grid-cols-[1fr_280px] gap-8">
        {/* 文章列表 */}
        <div>
          {posts.length > 0 ? (
            <>
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>

              {/* 分页 */}
              {totalPages > 1 && (
                <div className="mt-12 flex justify-center">
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    baseUrl="/posts"
                    params={{ category: category || '', tag: tag || '' }}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 p-12 text-center">
              <p className="text-gray-500 dark:text-gray-400">暂无文章</p>
              <Link href="/posts" className="mt-4 text-primary-600 hover:text-primary-700">
                查看全部文章
              </Link>
            </div>
          )}
        </div>

        {/* 侧边栏 */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-6">
            {/* 分类 */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">分类</h3>
              <div className="space-y-2">
                <Link
                  href="/posts"
                  className={`block py-1 text-sm ${
                    !category
                      ? 'text-primary-600 font-medium'
                      : 'text-gray-600 dark:text-gray-300 hover:text-primary-600'
                  }`}
                >
                  全部文章
                </Link>
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/posts?category=${cat.slug}`}
                    className={`flex items-center justify-between py-1 text-sm ${
                      category === cat.slug
                        ? 'text-primary-600 font-medium'
                        : 'text-gray-600 dark:text-gray-300 hover:text-primary-600'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className="text-xs text-gray-400">{cat._count.posts}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* 标签云 */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">标签</h3>
              <div className="flex flex-wrap gap-2">
                {tags.map((t) => (
                  <Link
                    key={t.id}
                    href={`/posts?tag=${t.slug}`}
                    className={`px-3 py-1 text-sm rounded-full transition-colors ${
                      tag === t.slug
                        ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-primary-50'
                    }`}
                  >
                    #{t.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
