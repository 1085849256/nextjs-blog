/**
 * TableOfContents 目录导航组件
 */

'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  headings: Heading[];
  activeId: string;
}

export function TableOfContents({ headings, activeId }: TableOfContentsProps) {
  if (headings.length === 0) return null;

  return (
    <nav className="sticky top-24">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">
        目录
      </h3>
      <ul className="space-y-2 border-l-2 border-gray-200 dark:border-gray-700">
        {headings.map((heading) => (
          <li key={heading.id} style={{ paddingLeft: `${(heading.level - 2) * 12}px` }}>
            <Link
              href={`#${heading.id}`}
              className={cn(
                'block text-sm py-1 transition-colors',
                heading.level > 2 ? 'text-gray-500 dark:text-gray-400' : 'text-gray-600 dark:text-gray-300',
                activeId === heading.id
                  ? 'text-primary-600 dark:text-primary-400 font-medium'
                  : 'hover:text-primary-600 dark:hover:text-primary-400'
              )}
            >
              {heading.text}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
