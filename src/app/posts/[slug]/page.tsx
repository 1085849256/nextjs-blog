/**
 * 文章详情页
 */

import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { prisma } from '@/lib/prisma';
import { formatDate, calculateReadingTime } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { CommentSection } from '@/components/comments/comment-section';
import { LikeButton } from '@/components/posts/like-button';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
// 自定义 MDX 组件
const mdxComponents = {
  pre: ({ children, ...props }: React.HTMLAttributes<HTMLPreElement>) => (
    <div className="relative group">
      <pre {...props} className="bg-gray-900 dark:bg-gray-950 rounded-lg p-4 overflow-x-auto text-sm">
        {children}
      </pre>
    </div>
  ),
  code: ({ children, className, ...props }: React.HTMLAttributes<HTMLElement>) => {
    const isInline = !className;
    if (isInline) {
      return (
        <code
          {...props}
          className="px-1.5 py-0.5 mx-0.5 rounded bg-gray-100 dark:bg-gray-800 text-primary-600 dark:text-primary-400 text-sm font-mono"
        >
          {children}
        </code>
      );
    }
    return <code className={className} {...props}>{children}</code>;
  },
  a: ({ children, href, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a
      href={href}
      {...props}
      className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 underline underline-offset-2 hover:underline"
      target={href?.startsWith('http') ? '_blank' : undefined}
      rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
    >
      {children}
    </a>
  ),
  img: ({ src, alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <span className="block my-4">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt || ''} className="rounded-lg max-w-full h-auto mx-auto" loading="lazy" {...props} />
      {alt && <span className="block text-center text-sm text-gray-500 dark:text-gray-400 mt-2">{alt}</span>}
    </span>
  ),
  blockquote: ({ children, ...props }: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote {...props} className="border-l-4 border-primary-500 pl-4 my-4 italic text-gray-600 dark:text-gray-300">
      {children}
    </blockquote>
  ),
  table: ({ children, ...props }: React.HTMLAttributes<HTMLTableElement>) => (
    <div className="overflow-x-auto my-4">
      <table {...props} className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">{children}</table>
    </div>
  ),
  th: ({ children, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) => (
    <th {...props} className="px-4 py-2 bg-gray-50 dark:bg-gray-800 text-left text-sm font-semibold text-gray-900 dark:text-white">
      {children}
    </th>
  ),
  td: ({ children, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) => (
    <td {...props} className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border-t border-gray-200 dark:border-gray-700">
      {children}
    </td>
  ),
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

// 获取文章数据
async function getPost(slug: string) {
  const post = await prisma.post.findUnique({
    where: { slug, isDeleted: false },
    include: {
      author: true,
      category: true,
      tags: true,
    },
  });

  if (!post || post.status !== 'PUBLISHED') {
    return null;
  }

  // 增加阅读量
  await prisma.post.update({
    where: { id: post.id },
    data: { viewCount: { increment: 1 } },
  });

  // 获取相关文章
  const relatedPosts = await prisma.post.findMany({
    where: {
      status: 'PUBLISHED',
      isDeleted: false,
      id: { not: post.id },
      OR: [
        { categoryId: post.categoryId },
        { tags: { some: { id: { in: post.tags.map((t) => t.id) } } } },
      ],
    },
    include: {
      author: { select: { id: true, name: true, avatar: true } },
      category: { select: { id: true, name: true, slug: true } },
      tags: { select: { id: true, name: true, slug: true } },
    },
    take: 4,
  });

  // 获取评论
  const comments = await prisma.comment.findMany({
    where: { postId: post.id, isApproved: true },
    include: {
      user: { select: { id: true, name: true, avatar: true } },
    },
    orderBy: { createdAt: 'asc' },
  });

  return {
    ...post,
    comments,
    relatedPosts: relatedPosts.map((p) => ({
      ...p,
      publishedAt: p.publishedAt?.toISOString(),
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    })),
  };
}

// 生成页面元数据
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return { title: '文章未找到' };
  }

  return {
    title: post.title,
    description: post.excerpt || post.content.slice(0, 160),
    authors: [{ name: post.author.name }],
    openGraph: {
      title: post.title,
      description: post.excerpt || post.content.slice(0, 160),
      type: 'article',
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: [post.author.name],
      images: post.coverImage ? [{ url: post.coverImage }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt || post.content.slice(0, 160),
      images: post.coverImage ? [post.coverImage] : [],
    },
  };
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  const readingTime = calculateReadingTime(post.content);

  // 序列化评论
  const serializedComments = post.comments.map((c) => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
    authorAvatar: c.user?.avatar || undefined,
  }));

  return (
    <article className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* 面包屑 */}
      <nav className="mb-6 text-sm text-gray-500 dark:text-gray-400">
        <ol className="flex items-center gap-2">
          <li><Link href="/" className="hover:text-primary-600">首页</Link></li>
          <li>/</li>
          <li><Link href="/posts" className="hover:text-primary-600">文章</Link></li>
          {post.category && (
            <>
              <li>/</li>
              <li><Link href={`/categories/${post.category.slug}`} className="hover:text-primary-600">{post.category.name}</Link></li>
            </>
          )}
          <li>/</li>
          <li className="text-gray-700 dark:text-gray-200">{post.title}</li>
        </ol>
      </nav>

      {/* 文章头部 */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          {post.isPinned && <Badge variant="warning">置顶</Badge>}
          {post.category && <Badge variant="primary">{post.category.name}</Badge>}
          {post.tags.map((tag) => (
            <Link key={tag.id} href={`/tags/${tag.slug}`}>
              <Badge variant="secondary" className="hover:bg-secondary-200">#{tag.name}</Badge>
            </Link>
          ))}
        </div>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl lg:text-5xl mb-4">
          {post.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <Avatar src={post.author.avatar} fallback={post.author.name} size="sm" />
            <span>{post.author.name}</span>
          </div>
          <span>·</span>
          <time dateTime={post.publishedAt?.toISOString()}>
            {post.publishedAt ? formatDate(post.publishedAt) : '草稿'}
          </time>
          <span>·</span>
          <span>{readingTime} 分钟阅读</span>
          <span>·</span>
          <span>{post.viewCount + 1} 阅读</span>
        </div>
      </header>

      {/* 封面图 */}
      {post.coverImage && (
        <div className="relative aspect-[21/9] mb-8 overflow-hidden rounded-xl">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 1200px"
          />
        </div>
      )}

      <div className="grid lg:grid-cols-[1fr_280px] gap-8">
        {/* 文章内容 */}
        <div className="min-w-0">
          {/* 阅读进度条 */}
          <div className="fixed top-16 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-800 z-40">
            <div id="reading-progress" className="h-full bg-primary-500 transition-all duration-150" style={{ width: '0%' }} />
          </div>

          <article className="prose prose-gray dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-primary-600 prose-headings:scroll-mt-20 prose-pre:bg-gray-900 prose-pre:border prose-pre:border-gray-800 prose-img:rounded-lg prose-img:shadow-lg">
            <MDXRemote
              source={post.content}
              options={{
                mdxOptions: {
                  remarkPlugins: [remarkGfm],
                  rehypePlugins: [
                    rehypeSlug,
                    [rehypeAutolinkHeadings, { behavior: 'wrap' }],
                  ],
                },
              }}
              components={mdxComponents}
            />
          </article>

          {/* 点赞 */}
          <div className="mt-8 pt-8 border-t">
            <LikeButton postId={post.id} likeCount={post.likeCount} />
          </div>

          {/* 标签 */}
          {post.tags.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2">
              <span className="text-gray-500 dark:text-gray-400 mr-2">标签：</span>
              {post.tags.map((tag) => (
                <Link key={tag.id} href={`/tags/${tag.slug}`}>
                  <Badge variant="secondary" className="hover:bg-secondary-200">
                    #{tag.name}
                  </Badge>
                </Link>
              ))}
            </div>
          )}

          {/* 分享 */}
          <div className="mt-8 flex items-center gap-4">
            <span className="text-gray-500 dark:text-gray-400">分享到：</span>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`${process.env.NEXT_PUBLIC_SITE_URL}/posts/${post.slug}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-blue-400"
            >
              Twitter
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${process.env.NEXT_PUBLIC_SITE_URL}/posts/${post.slug}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-blue-600"
            >
              Facebook
            </a>
          </div>

          {/* 评论 */}
          <div className="mt-12">
            <CommentSection postId={post.id} comments={serializedComments} />
          </div>
        </div>

        {/* 侧边栏 */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-6">
            {/* 作者信息 */}
            <Card>
              <div className="text-center">
                <Avatar src={post.author.avatar} fallback={post.author.name} size="xl" />
                <h3 className="mt-4 font-semibold text-gray-900 dark:text-white">{post.author.name}</h3>
                {post.author.bio && (
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{post.author.bio}</p>
                )}
              </div>
            </Card>

            {/* 相关文章 */}
            {post.relatedPosts.length > 0 && (
              <Card>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">相关推荐</h3>
                <div className="space-y-4">
                  {post.relatedPosts.map((related) => (
                    <Link key={related.id} href={`/posts/${related.slug}`} className="block group">
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-primary-600 line-clamp-2">
                        {related.title}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {related.viewCount} 阅读
                      </div>
                    </Link>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </aside>
      </div>
    </article>
  );
}
