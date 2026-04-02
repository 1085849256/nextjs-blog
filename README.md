# 📝 Next.js 全栈博客系统

一个功能完整的个人独立博客系统，支持文章管理、评论系统、友链管理、SEO 优化等，开箱即用。

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-5.x-2D3748?style=flat-square&logo=prisma)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.x-38B2AC?style=flat-square&logo=tailwind-css)

## ✨ 特性

### 前台功能
- 📄 文章系统（MDX/Markdown 支持、代码高亮、目录导航）
- 💬 评论系统（支持嵌套回复）
- 🔍 全站搜索
- 🏷️ 分类 & 标签系统
- 🔗 友链页面
- 🌙 暗黑模式 / 浅色模式 / 跟随系统
- 📱 完全响应式设计

### 后台管理
- 📊 数据统计面板
- ✏️ 文章编辑器
- 🗂️ 分类标签管理
- 💬 评论审核
- 🔗 友链管理
- ⚙️ 网站配置

### SEO & 性能
- 🚀 SSR/SSG 双渲染模式
- 🔎 sitemap.xml 自动生成
- 📡 RSS 2.0 订阅
- 🖼️ 图片自动优化
- ⚡ Lighthouse 90+ 评分

### 安全
- 🔒 XSS/CSRF/SQL 注入防护
- 🔑 NextAuth.js 鉴权
- 🛡️ RBAC 权限控制
- 🔐 密码 bcrypt 加密

## 🛠️ 技术栈

| 分类 | 技术 |
|------|------|
| 框架 | Next.js 14 (App Router) |
| 语言 | TypeScript |
| 数据库 | SQLite / PostgreSQL |
| ORM | Prisma |
| 认证 | NextAuth.js |
| 样式 | Tailwind CSS |
| 图标 | Lucide React |

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/yourusername/nextjs-blog.git
cd nextjs-blog
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

```bash
cp .env.example .env.local
```

编辑 `.env.local`:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-min-32-chars"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="admin123456"
```

### 4. 初始化数据库

```bash
# 推送数据库结构
npm run db:push

# 初始化种子数据
npm run db:seed
```

### 5. 启动开发服务器

```bash
npm run dev
```

打开 http://localhost:3000

### 6. 访问后台

- 登录页: http://localhost:3000/login
- 默认账号: `admin@example.com` / `admin123456`

## 📁 项目结构

```
/
├── prisma/               # Prisma ORM
│   ├── schema.prisma    # 数据库模型
│   └── seed.ts          # 种子数据
├── src/
│   ├── app/             # Next.js App Router
│   │   ├── (public)/    # 前台页面
│   │   ├── (admin)/     # 后台页面
│   │   ├── api/         # API 路由
│   │   └── ...
│   ├── components/       # React 组件
│   │   ├── ui/          # 基础 UI
│   │   ├── layout/      # 布局组件
│   │   ├── posts/       # 文章组件
│   │   └── comments/    # 评论组件
│   ├── lib/             # 工具函数
│   │   ├── prisma.ts    # Prisma 客户端
│   │   ├── auth.ts      # NextAuth 配置
│   │   ├── utils.ts     # 通用工具
│   │   └── validators/  # Zod 验证器
│   ├── hooks/           # 自定义 Hooks
│   └── types/           # TypeScript 类型
├── public/              # 静态资源
└── ...
```

## 🎨 自定义配置

### 修改站点信息

编辑 `src/app/layout.tsx` 中的 metadata:

```tsx
export const metadata: Metadata = {
  title: '你的博客名',
  description: '你的博客描述',
  // ...
};
```

### 修改主题颜色

编辑 `tailwind.config.ts`:

```ts
colors: {
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    // ...
  },
}
```

### 添加新页面

在 `src/app/` 下创建新路由:

```
src/app/about/page.tsx    → /about
src/app/tags/page.tsx    → /tags
```

## 🚢 部署到 Vercel

### 一键部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/nextjs-blog)

### 手动部署

1. Fork 此仓库
2. 在 Vercel 导入
3. 配置环境变量
4. 点击 Deploy

详细教程: [DEPLOY.md](./DEPLOY.md)

## 📝 常用命令

```bash
# 开发
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
npm run start        # 启动生产服务器

# 代码质量
npm run lint         # ESLint 检查
npm run format       # Prettier 格式化

# 数据库
npm run db:push      # 推送数据库结构
npm run db:seed      # 初始化种子数据
npm run db:studio    # 打开 Prisma Studio
npm run db:reset     # 重置数据库
```

## 🤝 贡献

欢迎提交 Pull Request 或 Issue！

## 📄 许可证

MIT License - 详见 [LICENSE](./LICENSE)

---

如果你觉得这个项目有帮助，请 ⭐ Star 支持一下！
