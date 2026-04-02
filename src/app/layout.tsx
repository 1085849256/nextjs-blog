/**
 * 根布局文件
 * 定义全局布局结构
 */

import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { ThemeProvider } from '@/components/theme/theme-provider';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Toaster } from 'react-hot-toast';
import './globals.css';

// ===========================================
// 字体配置
// ===========================================

// 主字体 - Inter
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

// 代码字体 - JetBrains Mono
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
});

// ===========================================
// 元数据
// ===========================================

export const metadata: Metadata = {
  // 基础元数据
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: process.env.NEXT_PUBLIC_SITE_NAME || '我的技术博客',
    template: `%s | ${process.env.NEXT_PUBLIC_SITE_NAME || '我的技术博客'}`,
  },
  description: process.env.NEXT_PUBLIC_SITE_DESCRIPTION || '分享技术与生活，记录成长历程',
  keywords: ['博客', '技术', 'Next.js', 'React', 'TypeScript', '前端', '全栈'],
  authors: [{ name: process.env.NEXT_PUBLIC_SITE_AUTHOR || '博主' }],
  creator: process.env.NEXT_PUBLIC_SITE_AUTHOR || '博主',

  // Open Graph
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    siteName: process.env.NEXT_PUBLIC_SITE_NAME || '我的技术博客',
    title: process.env.NEXT_PUBLIC_SITE_NAME || '我的技术博客',
    description: process.env.NEXT_PUBLIC_SITE_DESCRIPTION || '分享技术与生活，记录成长历程',
  },

  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: process.env.NEXT_PUBLIC_SITE_NAME || '我的技术博客',
    description: process.env.NEXT_PUBLIC_SITE_DESCRIPTION || '分享技术与生活，记录成长历程',
  },

  // 机器人配置
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // 图标
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

// ===========================================
// 根布局组件
// ===========================================

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        {/* 主题提供者 */}
        <ThemeProvider defaultTheme="system" storageKey="blog-theme">
          {/* 页面容器 */}
          <div className="flex min-h-screen flex-col">
            {/* 头部导航 */}
            <Header />

            {/* 主内容区域 */}
            <main className="flex-1">{children}</main>

            {/* 页脚 */}
            <Footer />
          </div>

          {/* Toast 通知 */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: 'var(--card)',
                color: 'var(--card-foreground)',
                border: '1px solid var(--border)',
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
