/**
 * 后台标签管理页面
 */

import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';

async function getTags() {
  return prisma.tag.findMany({
    include: {
      _count: { select: { posts: true } },
    },
    orderBy: { name: 'asc' },
  });
}

export default async function AdminTagsPage() {
  const tags = await getTags();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">标签管理</h1>
        <Button>新建标签</Button>
      </div>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">名称</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Slug</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">文章数</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">创建时间</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {tags.map((tag) => (
                <tr key={tag.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">#{tag.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{tag.slug}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{tag._count.posts}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{formatDate(tag.createdAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button size="sm" variant="ghost">编辑</Button>
                      <Button size="sm" variant="ghost">删除</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {tags.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">暂无标签</p>
          </div>
        )}
      </Card>
    </div>
  );
}
