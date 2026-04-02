/**
 * PostContent 文章内容渲染组件
 * 支持 Markdown/MDX，带有代码高亮、目录、阅读进度等功能
 */

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { MDXRemote } from 'next-mdx-remote';
import { cn, copyToClipboard } from '@/lib/utils';
import { TableOfContents } from './table-of-contents';

// 代码块组件（大写开头，允许使用 hooks）
function CodeBlock({ children, ...props }: React.HTMLAttributes<HTMLPreElement>) {
  const codeRef = useRef<HTMLElement>(null);

  const handleCopy = useCallback(async () => {
    const code = codeRef.current?.textContent;
    if (code) {
      await copyToClipboard(code);
    }
  }, []);

  return (
    <div className="relative group">
      <pre {...props} className="bg-gray-900 dark:bg-gray-950 rounded-lg p-4 overflow-x-auto text-sm">
        <code ref={codeRef}>{children}</code>
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-2 rounded-md bg-gray-700 hover:bg-gray-600 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="复制代码"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      </button>
    </div>
  );
}

// MDX 组件映射
const mdxComponents = {
  pre: (props: React.HTMLAttributes<HTMLPreElement>) => <CodeBlock {...props} />,

  // 行内代码
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

  // 链接
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

  // 图片
  img: ({ src, alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <span className="block my-4">
      <img src={src} alt={alt || ''} className="rounded-lg max-w-full h-auto mx-auto" loading="lazy" {...props} />
      {alt && <span className="block text-center text-sm text-gray-500 dark:text-gray-400 mt-2">{alt}</span>}
    </span>
  ),

  // 引用
  blockquote: ({ children, ...props }: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote {...props} className="border-l-4 border-primary-500 pl-4 my-4 italic text-gray-600 dark:text-gray-300">
      {children}
    </blockquote>
  ),

  // 表格
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

interface PostContentProps {
  source: string;
  className?: string;
  showToc?: boolean;
}

export function PostContent({ source, className, showToc = true }: PostContentProps) {
  const articleRef = useRef<HTMLElement>(null);
  const [readingProgress, setReadingProgress] = useState(0);
  const [headings, setHeadings] = useState<{ id: string; text: string; level: number }[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  // 提取标题生成目录
  useEffect(() => {
    const article = articleRef.current;
    if (!article) return;

    const headingElements = article.querySelectorAll('h2, h3, h4');
    const extractedHeadings: { id: string; text: string; level: number }[] = [];

    headingElements.forEach((heading) => {
      const id = heading.id || heading.textContent?.toLowerCase().replace(/\s+/g, '-') || '';
      if (!heading.id) heading.id = id;
      extractedHeadings.push({
        id,
        text: heading.textContent || '',
        level: parseInt(heading.tagName.substring(1)),
      });
    });

    setHeadings(extractedHeadings);
  }, [source]);

  // 阅读进度
  useEffect(() => {
    const handleScroll = () => {
      const article = articleRef.current;
      if (!article) return;

      const articleTop = article.offsetTop;
      const articleHeight = article.offsetHeight;
      const windowHeight = window.innerHeight;
      const scrolled = window.scrollY;

      const progress = Math.min(
        Math.max((scrolled - articleTop + windowHeight / 2) / articleHeight, 0),
        1
      );

      setReadingProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 滚动监听 - 更新活跃标题
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-80px 0px -80% 0px' }
    );

    headings.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [headings]);

  return (
    <div className="relative">
      {/* 阅读进度条 */}
      <div className="fixed top-16 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-800 z-40">
        <div className="h-full bg-primary-500 transition-all duration-150" style={{ width: `${readingProgress * 100}%` }} />
      </div>

      <div className="flex gap-8">
        {/* 主内容 */}
        <article
          ref={articleRef}
          className={cn(
            'prose prose-gray dark:prose-invert max-w-none',
            'prose-headings:scroll-mt-20',
            'prose-a:text-primary-600 prose-a:no-underline hover:prose-a:underline',
            'prose-pre:bg-gray-900 prose-pre:border prose-pre:border-gray-800',
            'prose-img:rounded-lg prose-img:shadow-lg',
            className
          )}
        >
          <MDXRemote source={source} components={mdxComponents} />
        </article>

        {/* 目录 */}
        {showToc && headings.length > 0 && (
          <aside className="hidden xl:block w-64 flex-shrink-0">
            <TableOfContents headings={headings} activeId={activeId} />
          </aside>
        )}
      </div>
    </div>
  );
}
