/**
 * 后台友链管理页面
 */

import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';

async function getLinks() {
  return prisma.link.findMany({
    orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
  });
}

export default async function AdminLinksPage() {
  const links = await getLinks();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">友链管理</h1>
        <Button>新建友链</Button>
      </div>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">网站</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">链接</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">状态</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">排序</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">创建时间</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {links.map((link) => (
                <tr key={link.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {link.avatar ? (
                        <img src={link.avatar} alt={link.name} className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-sm">
                          {link.name[0]}
                        </div>
                      )}
                      <span className="font-medium text-gray-900 dark:text-white">{link.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-600 hover:text-primary-700 truncate block max-w-xs">
                      {link.url}
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded ${
                      link.isVisible
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {link.isVisible ? '显示' : '隐藏'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{link.order}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{formatDate(link.createdAt)}</td>
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

        {links.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">暂无友链</p>
          </div>
        )}
      </Card>
    </div>
  );
}
