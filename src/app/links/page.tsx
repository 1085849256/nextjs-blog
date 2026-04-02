/**
 * 友链页面
 */

export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/card';

export const metadata = {
  title: '友链',
  description: '交换友链，共同成长',
};

async function getLinks() {
  return prisma.link.findMany({
    where: { isVisible: true },
    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
  });
}

export default async function LinksPage() {
  const links = await getLinks();

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">友链</h1>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          欢迎交换友链，可以在留言板留言或通过邮箱联系我。
        </p>
      </div>

      {/* 友链要求 */}
      <Card className="mb-12" variant="bordered">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">友链要求</h2>
        <ul className="space-y-2 text-gray-600 dark:text-gray-300">
          <li>• 网站内容原创、积极向上</li>
          <li>• 网站正常运行，HTTPS 加密</li>
          <li>• 文章更新频率正常</li>
          <li>• 权重相当，流量来源相似</li>
        </ul>
      </Card>

      {/* 友链列表 */}
      {links.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {links.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group"
            >
              <Card className="h-full transition-all hover:border-primary-500 hover:shadow-lg" variant="bordered">
                <div className="flex items-center gap-4">
                  {link.avatar ? (
                    <img
                      src={link.avatar}
                      alt={link.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-xl">
                      {link.name[0]}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-primary-600 truncate">
                      {link.name}
                    </h3>
                    {link.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                        {link.description}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            </a>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">暂无友链</p>
        </Card>
      )}

      {/* 留言 */}
      <div className="mt-12 text-center">
        <Link
          href="/guestbook"
          className="text-primary-600 hover:text-primary-700 dark:text-primary-400"
        >
          → 去留言板交换友链
        </Link>
      </div>
    </div>
  );
}
