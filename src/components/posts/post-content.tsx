/**
 * PostContent 文章内容渲染组件
 * 支持 Markdown/MDX，带有代码高亮、目录、阅读进度等功能
 */

import { MDXRemote } from 'next-mdx-remote';
import { cn } from '@/lib/utils';
import { TableOfContents } from './table-of-contents';

// 代码块组件
function CodeBlock({ children, ...props }: React.HTMLAttributes<HTMLPreElement>) {
  return (
    <div className="relative group">
      <pre {...props} className="bg-gray-900 dark:bg-gray-950 rounded-lg p-4 overflow-x-auto text-sm">
        <code>{children}</code>
      </pre>
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
      {/* eslint-disable-next-line @next/next/no-img-element */}
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
  return (
    <div className="relative">
      <div className="flex gap-8">
        {/* 主内容 */}
        <article
          className={cn(
            'prose prose-gray dark:prose-invert max-w-none',
            'prose-headings:scroll-mt-20',
            'prose-a:text-primary-600 prose-a:no-underline hover:prose-a:underline',
            'prose-pre:bg-gray-900 prose-pre:border prose-pre:border-gray-800',
            'prose-img:rounded-lg prose-img:shadow-lg',
            className
          )}
        >
          <MDXRemote components={mdxComponents}>
            {source}
          </MDXRemote>
        </article>

        {/* 目录占位 */}
        {showToc && <span className="hidden xl:block w-64 flex-shrink-0" />}
      </div>
    </div>
  );
}
