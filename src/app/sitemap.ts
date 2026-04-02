/**
 * 站点地图
 */

export const dynamic = 'force-dynamic';

import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  // 获取所有已发布的文章
  const posts = await prisma.post.findMany({
    where: {
      status: 'PUBLISHED',
      isDeleted: false,
    },
    select: {
      slug: true,
      updatedAt: true,
      publishedAt: true,
    },
  });

  // 生成文章 URL
  const postUrls = posts.map((post) => ({
    url: `${baseUrl}/posts/${post.slug}`,
    lastModified: post.publishedAt || post.updatedAt,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/posts`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/links`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.4,
    },
    ...postUrls,
  ];
}
