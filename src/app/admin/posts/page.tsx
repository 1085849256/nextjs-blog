/**
 * 文章管理页面
 */

import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { DeletePostButton, TogglePostStatus, TogglePinnedButton } from './actions';

async function getPosts() {
  return prisma.post.findMany({
    where: { isDeleted: false },
    include: {
      author: { select: { name: true } },
      category: { select: { name: true } },
      tags: { select: { name: true } },
      _count: { select: { comments: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

async function getCategories() {
  return prisma.category.findMany({ orderBy: { order: 'asc' } });
}

export default async function AdminPostsPage() {
  const [posts, categories] = await Promise.all([getPosts(), getCategories()]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">文章管理</h1>
        <Link href="/admin/posts/new">
          <Button>新建文章</Button>
        </Link>
      </div>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">标题</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">分类</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">状态</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">阅读</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">点赞</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">评论</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">发布时间</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {post.isPinned && <span className="text-warning-500">🔥</span>}
                      <Link
                        href={`/posts/${post.slug}`}
                        target="_blank"
                        className="font-medium text-gray-900 dark:text-white hover:text-primary-600"
                      >
                        {post.title}
                      </Link>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      作者: {post.author.name}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {post.category ? (
                      <Badge variant="primary" size="sm">{post.category.name}</Badge>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        post.status === 'PUBLISHED' ? 'success' :
                        post.status === 'DRAFT' ? 'warning' : 'default'
                      }
                      size="sm"
                    >
                      {post.status === 'PUBLISHED' ? '已发布' :
                       post.status === 'DRAFT' ? '草稿' : '归档'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{post.viewCount}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{post.likeCount}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{post._count.comments}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {post.publishedAt ? formatDate(post.publishedAt) : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/posts/${post.id}`}>
                        <Button size="sm" variant="ghost">编辑</Button>
                      </Link>
                      <TogglePinnedButton postId={post.id} isPinned={post.isPinned} />
                      <TogglePostStatus postId={post.id} currentStatus={post.status} />
                      <DeletePostButton postId={post.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {posts.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">暂无文章</p>
            <Link href="/admin/posts/new" className="text-primary-600 hover:text-primary-700 mt-2 inline-block">
              创建第一篇文章 →
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
}
