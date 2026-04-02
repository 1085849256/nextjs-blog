/**
 * 后台管理布局 - 服务端组件（带鉴权）
 */

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import AdminSidebar from './admin-sidebar';

export const metadata = {
  title: '管理后台',
};

/**
 * 服务端鉴权：未登录直接 302 重定向
 * 即使 middleware 被绕过，这里也能拦截
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // 未登录 → 跳转登录页
  if (!session?.user) {
    redirect('/login?callbackUrl=/admin&error=SessionRequired');
  }

  // 非管理员/编辑 → 跳转首页（无权限）
  const role = (session.user as any).role;
  if (role !== 'ADMIN' && role !== 'EDITOR') {
    redirect('/?error=Unauthorized');
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminSidebar user={session.user as any} />
      <main className="lg:pl-64">
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
