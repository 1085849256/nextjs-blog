/**
 * 后台网站设置页面
 */

import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function AdminSettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">网站设置</h1>

      <Card>
        <form className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <Input
              label="网站名称"
              name="siteName"
              placeholder="我的博客"
              defaultValue="我的博客"
            />
            <Input
              label="网站描述"
              name="siteDescription"
              placeholder="分享技术与生活"
              defaultValue="分享技术与生活，记录成长历程"
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <Input
              label="网站 URL"
              name="siteUrl"
              type="url"
              placeholder="https://example.com"
              defaultValue="http://localhost:3000"
            />
            <Input
              label="作者名称"
              name="siteAuthor"
              placeholder="博主"
              defaultValue="博主"
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <Input
              label="GitHub URL"
              name="githubUrl"
              type="url"
              placeholder="https://github.com/username"
            />
            <Input
              label="Twitter URL"
              name="twitterUrl"
              type="url"
              placeholder="https://twitter.com/username"
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <Input
              label="联系邮箱"
              name="email"
              type="email"
              placeholder="hello@example.com"
            />
            <Input
              label="ICP 备案号"
              name="icpNumber"
              placeholder="京ICP备XXXXXXXX号"
            />
          </div>

          <div className="pt-4 border-t">
            <Button type="submit">保存设置</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
