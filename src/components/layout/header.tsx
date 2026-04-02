/**
 * Header 导航栏组件
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { cn } from '@/lib/utils';

const navigation = [
  { name: '首页', href: '/' },
  { name: '文章', href: '/posts' },
  { name: '分类', href: '/categories' },
  { name: '标签', href: '/tags' },
  { name: '友链', href: '/links' },
  { name: '关于', href: '/about' },
];

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200/50 bg-white/80 dark:border-gray-700/50 dark:bg-gray-900/80 backdrop-blur-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">📝</span>
              <span className="hidden font-bold text-gray-900 dark:text-white sm:inline-block">
                我的博客
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex md:gap-6">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'relative py-2 text-sm font-medium transition-colors hover:text-primary-600',
                    pathname === item.href
                      ? 'text-primary-600'
                      : 'text-gray-600 dark:text-gray-300'
                  )}
                >
                  {item.name}
                  {pathname === item.href && (
                    <span className="absolute -bottom-[1px] left-0 right-0 h-0.5 bg-primary-600" />
                  )}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-4">
            {/* Search button */}
            <Link
              href="/search"
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
              aria-label="搜索"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Link>

            {/* Theme toggle */}
            <ThemeToggle />

            {/* Admin link */}
            <Link
              href="/login"
              className="hidden text-sm text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 sm:block"
            >
              登录
            </Link>

            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="菜单"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="border-t border-gray-200 dark:border-gray-700 py-4 md:hidden animate-fade-in">
            <div className="flex flex-col gap-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                    pathname === item.href
                      ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                  )}
                >
                  {item.name}
                </Link>
              ))}
              <Link
                href="/login"
                className="mt-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white text-center"
              >
                登录后台
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
