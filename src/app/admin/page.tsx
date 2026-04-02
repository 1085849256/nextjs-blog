/**
 * 管理后台仪表盘
 */

import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';

async function getStats() {
  const [postCount, categoryCount, tagCount, commentCount, recentPosts, recentComments] = await Promise.all([
    prisma.post.count({ where: { isDeleted: false } }),
    prisma.category.count(),
    prisma.tag.count(),
    prisma.comment.count(),
    prisma.post.findMany({
      where: { isDeleted: false },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        category: { select: { name: true } },
      },
    }),
    prisma.comment.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        post: { select: { title: true, slug: true } },
      },
    }),
  ]);

  return {
    postCount,
    categoryCount,
    tagCount,
    commentCount,
    recentPosts,
    recentComments,
  };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">仪表盘</h1>

      {/* 统计卡片 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">文章总数</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.postCount}</p>
            </div>
            <span className="text-4xl opacity-50">📝</span>
          </div>
          <Link href="/admin/posts" className="text-sm text-primary-600 hover:text-primary-700 mt-2 block">
            查看全部 →
          </Link>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">分类</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.categoryCount}</p>
            </div>
            <span className="text-4xl opacity-50">📂</span>
          </div>
          <Link href="/admin/categories" className="text-sm text-primary-600 hover:text-primary-700 mt-2 block">
            管理分类 →
          </Link>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">标签</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.tagCount}</p>
            </div>
            <span className="text-4xl opacity-50">🏷️</span>
          </div>
          <Link href="/admin/tags" className="text-sm text-primary-600 hover:text-primary-700 mt-2 block">
            管理标签 →
          </Link>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">评论</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.commentCount}</p>
            </div>
            <span className="text-4xl opacity-50">💬</span>
          </div>
          <Link href="/admin/comments" className="text-sm text-primary-600 hover:text-primary-700 mt-2 block">
            管理评论 →
          </Link>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 最近文章 */}
        <Card padding="none">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="font-semibold text-gray-900 dark:text-white">最近文章</h2>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {stats.recentPosts.map((post) => (
              <div key={post.id} className="p-4 flex items-center justify-between">
                <div>
                  <Link
                    href={`/admin/posts/${post.id}`}
                    className="font-medium text-gray-900 dark:text-white hover:text-primary-600"
                  >
                    {post.title}
                  </Link>
                  <div className="text-sm text-gray-500 mt-1">
                    {post.category?.name} · {formatDate(post.createdAt)}
                  </div>
                </div>
                <span
                  className={`px-2 py-1 text-xs rounded ${
                    post.status === 'PUBLISHED'
                      ? 'bg-success-100 text-success-700'
                      : post.status === 'DRAFT'
                      ? 'bg-warning-100 text-warning-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {post.status === 'PUBLISHED' ? '已发布' : post.status === 'DRAFT' ? '草稿' : '归档'}
                </span>
              </div>
            ))}
            {stats.recentPosts.length === 0 && (
              <p className="p-4 text-center text-gray-500">暂无文章</p>
            )}
          </div>
        </Card>

        {/* 最近评论 */}
        <Card padding="none">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="font-semibold text-gray-900 dark:text-white">最近评论</h2>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {stats.recentComments.map((comment) => (
              <div key={comment.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {comment.authorName}
                    </span>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                      {comment.content}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      comment.isApproved
                        ? 'bg-success-100 text-success-700'
                        : 'bg-warning-100 text-warning-700'
                    }`}
                  >
                    {comment.isApproved ? '已审核' : '待审核'}
                  </span>
                </div>
                <Link
                  href={`/posts/${comment.post?.slug}`}
                  target="_blank"
                  className="text-sm text-primary-600 hover:text-primary-700 mt-2 block"
                >
                  {comment.post?.title}
                </Link>
              </div>
            ))}
            {stats.recentComments.length === 0 && (
              <p className="p-4 text-center text-gray-500">暂无评论</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
