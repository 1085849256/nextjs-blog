/**
 * 标签列表页面
 */

import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/card';

export const metadata = {
  title: '标签',
  description: '按标签浏览文章',
};

async function getTags() {
  return prisma.tag.findMany({
    include: {
      _count: { select: { posts: true } },
    },
    orderBy: { name: 'asc' },
  });
}

export default async function TagsPage() {
  const tags = await getTags();

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">标签</h1>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          按标签查找相关文章。
        </p>
      </div>

      {tags.length > 0 ? (
        <div className="flex flex-wrap gap-3 justify-center">
          {tags.map((tag) => (
            <Link
              key={tag.id}
              href={`/posts?tag=${tag.slug}`}
              className="group"
            >
              <Card
                className="px-5 py-3 transition-all hover:border-primary-500 hover:shadow-md hover:-translate-y-0.5"
                variant="bordered"
                padding="none"
              >
                <div className="flex items-center gap-2">
                  <span className="text-gray-700 dark:text-gray-300 group-hover:text-primary-600 transition-colors font-medium">
                    #{tag.name}
                  </span>
                  <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                    {tag._count.posts}
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">暂无标签</p>
        </Card>
      )}
    </div>
  );
}
