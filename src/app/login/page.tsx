/**
 * 登录页面
 */

'use client';

import { Suspense } from 'react';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/admin';

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      setError('登录失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">欢迎回来</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">登录到管理后台</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-error-50 text-error-600 rounded-lg text-sm">
                {error}
              </div>
            )}

            <Input
              label="邮箱"
              name="email"
              type="email"
              placeholder="your@email.com"
              required
              autoComplete="email"
            />

            <Input
              label="密码"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />

            <Button type="submit" className="w-full" isLoading={isLoading}>
              登录
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <Link href="/" className="text-primary-600 hover:text-primary-700">
              ← 返回首页
            </Link>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-gray-500">
          还没有账号？请联系管理员创建。
        </p>
      </div>
    </div>
  );
}

function LoginFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="text-center">
        <div className="inline-block w-8 h-8 border-4 border-gray-300 border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-gray-500">加载登录页...</p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  );
}
