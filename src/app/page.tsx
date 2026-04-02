/**
 * 首页
 * 展示置顶文章和最新文章列表
 */

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PostCard } from '@/components/posts/post-card';
import prisma from '@/lib/prisma';
import type { PostListItem } from '@/types';

// 获取置顶文章
async function getPinnedPosts(): Promise<PostListItem[]> {
  const posts = await prisma.post.findMany({
    where: {
      status: 'PUBLISHED',
      isDeleted: false,
      isPinned: true,
    },
    include: {
      author: {
        select: { id: true, name: true, avatar: true },
      },
      category: {
        select: { id: true, name: true, slug: true },
      },
      tags: {
        select: { id: true, name: true, slug: true },
      },
    },
    orderBy: { publishedAt: 'desc' },
    take: 3,
  });

  return posts.map((post) => ({
    ...post,
    status: post.status as PostListItem['status'],
    publishedAt: post.publishedAt?.toISOString(),
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
  })) as PostListItem[];
}

// 获取最新文章
async function getLatestPosts(page: number = 1, pageSize: number = 6): Promise<{
  posts: PostListItem[];
  total: number;
  hasMore: boolean;
}> {
  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where: {
        status: 'PUBLISHED',
        isDeleted: false,
        isPinned: false,
      },
      include: {
        author: {
          select: { id: true, name: true, avatar: true },
        },
        category: {
          select: { id: true, name: true, slug: true },
        },
        tags: {
          select: { id: true, name: true, slug: true },
        },
      },
      orderBy: { publishedAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.post.count({
      where: {
        status: 'PUBLISHED',
        isDeleted: false,
        isPinned: false,
      },
    }),
  ]);

  return {
    posts: posts.map((post) => ({
      ...post,
      status: post.status as PostListItem['status'],
      publishedAt: post.publishedAt?.toISOString(),
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    })) as PostListItem[],
    total,
    hasMore: page * pageSize < total,
  };
}

// 获取分类统计
async function getCategories() {
  const categories = await prisma.category.findMany({
    include: {
      _count: { select: { posts: true } },
    },
    orderBy: { order: 'asc' },
    take: 6,
  });

  return categories.map((cat) => ({
    ...cat,
    createdAt: cat.createdAt.toISOString(),
    updatedAt: cat.updatedAt.toISOString(),
    postCount: cat._count.posts,
  }));
}

export default async function HomePage() {
  const [pinnedPosts, latestData, categories] = await Promise.all([
    getPinnedPosts(),
    getLatestPosts(1, 6),
    getCategories(),
  ]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-100/50 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
              <span className="gradient-text">探索技术</span>
              <br />
              <span>分享成长</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 dark:text-gray-300">
              记录学习历程，分享技术心得。在这里，你可以找到关于前端开发、后端架构、云原生等领域的深度文章。
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link
                href="/posts"
                className="rounded-lg bg-primary-600 px-6 py-3 font-medium text-white shadow-lg shadow-primary-500/30 transition-all hover:bg-primary-700 hover:shadow-xl hover:-translate-y-0.5"
              >
                浏览文章
              </Link>
              <Link
                href="/about"
                className="rounded-lg border-2 border-gray-300 px-6 py-3 font-medium text-gray-700 transition-all hover:border-primary-500 hover:text-primary-600 dark:border-gray-600 dark:text-gray-200 dark:hover:border-primary-500"
              >
                关于我
              </Link>
            </div>
          </div>
        </div>

        {/* 装饰性元素 */}
        <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-primary-100/50 blur-3xl" />
        <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-secondary-100/50 blur-3xl" />
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* 置顶文章 */}
        {pinnedPosts.length > 0 && (
          <section className="mb-16">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">🔥 置顶文章</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {pinnedPosts.map((post) => (
                <PostCard key={post.id} post={post} featured />
              ))}
            </div>
          </section>
        )}

        {/* 分类导航 */}
        {categories.length > 0 && (
          <section className="mb-16">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">📂 分类</h2>
              <Link href="/categories" className="text-sm text-primary-600 hover:text-primary-700">
                查看全部 →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {categories.map((category) => (
                <Link key={category.id} href={`/categories/${category.slug}`}>
                  <Card className="p-4 text-center transition-all hover:border-primary-500 hover:shadow-md" variant="bordered" padding="none">
                    <span className="text-3xl mb-2 block">
                      {category.slug === 'frontend' ? '🎨' : category.slug === 'backend' ? '⚙️' : category.slug === 'devops' ? '🚀' : '📝'}
                    </span>
                    <h3 className="font-medium text-gray-900 dark:text-white">{category.name}</h3>
                    <p className="text-sm text-gray-500">{category.postCount} 篇文章</p>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 最新文章 */}
        <section className="mb-16">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">📖 最新文章</h2>
            <Link href="/posts" className="text-sm text-primary-600 hover:text-primary-700">
              查看全部 →
            </Link>
          </div>

          {latestData.posts.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {latestData.posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <p className="text-gray-500 dark:text-gray-400">还没有文章，敬请期待...</p>
            </Card>
          )}
        </section>

        {/* CTA Section */}
        <section className="rounded-2xl bg-gradient-to-r from-primary-600 to-secondary-600 p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-2">订阅更新</h2>
          <p className="text-primary-100 mb-6">订阅我的博客，第一时间获取最新文章</p>
          <Link
            href="/rss.xml"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-medium text-primary-600 transition-all hover:bg-primary-50"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19.01 7.38 20 6.18 20C4.98 20 4 19.01 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27V4.44m0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93V10.1z"/>
            </svg>
            RSS 订阅
          </Link>
        </section>
      </div>
    </div>
  );
}
