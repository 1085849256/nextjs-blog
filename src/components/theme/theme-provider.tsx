/**
 * 主题提供者组件
 * 支持亮色/暗色/跟随系统三种主题模式
 */

'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { storage } from '@/lib/utils';

type Theme = 'light' | 'dark' | 'system';

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

interface ThemeProviderState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
}

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
  resolvedTheme: 'light',
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

/**
 * 主题提供者 Hook
 * 使用方式：
 * ```tsx
 * import { ThemeProvider } from '@/components/theme/theme-provider'
 *
 * <ThemeProvider defaultTheme="system" storageKey="blog-theme">
 *   {children}
 * </ThemeProvider>
 * ```
 */
export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'blog-theme',
}: ThemeProviderProps) {
  // 从本地存储读取主题设置
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return storage.get<Theme>(storageKey, defaultTheme);
    }
    return defaultTheme;
  });

  // 解析后的主题（light 或 dark）
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  // 监听系统主题变化
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = () => {
      if (theme === 'system') {
        setResolvedTheme(mediaQuery.matches ? 'dark' : 'light');
      }
    };

    // 初始化解析后的主题
    handleChange();

    // 监听系统主题变化
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  // 应用主题到文档
  useEffect(() => {
    const root = window.document.documentElement;

    // 移除旧的主题类
    root.classList.remove('light', 'dark');

    // 计算实际应用的主题
    let effectiveTheme: 'light' | 'dark';

    if (theme === 'system') {
      effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else {
      effectiveTheme = theme;
    }

    // 添加新的主题类
    root.classList.add(effectiveTheme);
    setResolvedTheme(effectiveTheme);

    // 同时设置 data-theme 属性（用于某些 CSS 选择器）
    root.setAttribute('data-theme', effectiveTheme);
  }, [theme]);

  // 设置主题
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    storage.set(storageKey, newTheme);
  };

  return (
    <ThemeProviderContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

/**
 * 使用主题的 Hook
 * ```tsx
 * const { theme, setTheme, resolvedTheme } = useTheme()
 * ```
 */
export function useTheme() {
  const context = useContext(ThemeProviderContext);

  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
}
