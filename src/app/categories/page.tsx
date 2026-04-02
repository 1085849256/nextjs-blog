/**
 * 分类列表页面
 */

import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/card';

export const metadata = {
  title: '分类',
  description: '按分类浏览文章',
};

async function getCategories() {
  return prisma.category.findMany({
    include: {
      _count: { select: { posts: true } },
    },
    orderBy: { order: 'asc' },
  });
}

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">分类</h1>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          按分类浏览所有文章，找到你感兴趣的技术领域。
        </p>
      </div>

      {categories.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link key={category.id} href={`/posts?category=${category.slug}`}>
              <Card className="h-full p-6 text-center transition-all hover:border-primary-500 hover:shadow-lg hover:-translate-y-1" variant="bordered">
                <span className="text-4xl mb-3 block">
                  {category.slug === 'frontend' ? '🎨' : category.slug === 'backend' ? '⚙️' : category.slug === 'devops' ? '🚀' : '📝'}
                </span>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {category.name}
                </h2>
                {category.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
                    {category.description}
                  </p>
                )}
                <p className="text-sm text-primary-600">
                  {category._count.posts} 篇文章
                </p>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">暂无分类</p>
        </Card>
      )}
    </div>
  );
}
