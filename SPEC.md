# 个人独立博客项目规范 (SPEC.md)

## 1. 项目概述

**项目名称**: Next.js 全栈博客系统 (nextjs-blog-starter)
**项目类型**: 全栈独立博客 + 后台管理系统
**核心定位**: 为独立开发者/技术博主提供零配置一键部署的个人博客解决方案
**目标用户**: 开发者、技术博主、内容创作者

---

## 2. 技术栈规范

### 核心框架
| 技术 | 版本 | 用途 |
|------|------|------|
| Next.js | 14+ (App Router) | 全栈框架 |
| React | 18+ | UI 库 |
| TypeScript | 5.x | 类型安全 |
| Node.js | 18+ | 运行时 |

### 数据层
| 技术 | 版本 | 用途 |
|------|------|------|
| Prisma ORM | 5.x | 数据库 ORM |
| SQLite | - | 开发环境数据库 |
| PostgreSQL | - | 生产环境数据库 |

### 认证与安全
| 技术 | 用途 |
|------|------|
| NextAuth.js v4 | 鉴权体系 |
| bcrypt | 密码加密 |
| zod | 请求验证 |

### 样式与UI
| 技术 | 用途 |
|------|------|
| Tailwind CSS | 原子化 CSS |
| Tailwind CSS v4 | 样式框架 |
| Lucide React | 图标库 |

### 内容处理
| 技术 | 用途 |
|------|------|
| next-mdx-remote | MDX 渲染 |
| rehype-highlight | 代码高亮 |
| rehype-slug | 锚点导航 |
| gray-matter | Frontmatter 解析 |

### 部署
| 平台 | 用途 |
|------|------|
| Vercel | 一键部署 |
| GitHub Actions | CI/CD |

---

## 3. 功能模块规范

### 3.1 前台功能

#### 内容展示
- [x] 首页文章列表（支持分页）
- [x] 文章详情页（MDX渲染）
- [x] 分类页面（按分类筛选）
- [x] 标签页面（按标签筛选）
- [x] 关于页面
- [x] 友链页面

#### 文章系统
- [x] Markdown/MDX 富文本支持
- [x] 代码高亮 + 一键复制
- [x] 目录锚点导航
- [x] 阅读进度条
- [x] 相关文章推荐
- [x] 文章点赞统计
- [x] 阅读量统计

#### 交互功能
- [x] 评论系统（支持嵌套回复）
- [x] 站内搜索
- [x] 全站黑暗/浅色/跟随系统主题切换

#### 用户体验
- [x] 响应式布局（移动/平板/桌面）
- [x] 页面平滑过渡动画
- [x] 图片懒加载

### 3.2 后台管理

#### 权限管理
- [x] 超级管理员（全部权限）
- [x] 编辑（内容管理）
- [x] 普通用户（评论管理）

#### 内容管理
- [x] 文章 CRUD（发布/草稿/置顶/软删除）
- [x] 分类管理
- [x] 标签管理
- [x] 评论审核

#### 系统管理
- [x] 网站全局配置
- [x] 友链管理
- [x] 访问数据统计

### 3.3 SEO 优化
- [x] 语义化 HTML5 标签
- [x] 自定义 meta 标签
- [x] Open Graph / Twitter Card
- [x] sitemap.xml 自动生成
- [x] robots.txt 配置
- [x] RSS 2.0 订阅源

### 3.4 安全措施
- [x] XSS 防护
- [x] SQL 注入防护（Prisma）
- [x] CSRF 防护
- [x] 密码 bcrypt 加密
- [x] JWT 鉴权
- [x] 接口限流

---

## 4. 数据库模型

### User（用户）
```
id: string (cuid)
email: string (unique)
name: string
password: string (hashed)
role: enum (ADMIN, EDITOR, USER)
avatar: string?
bio: string?
createdAt: datetime
updatedAt: datetime
```

### Post（文章）
```
id: string (cuid)
title: string
slug: string (unique)
content: text
excerpt: string?
coverImage: string?
status: enum (PUBLISHED, DRAFT, ARCHIVED)
isPinned: boolean (default: false)
isDeleted: boolean (default: false)
viewCount: int (default: 0)
likeCount: int (default: 0)
authorId: string (relation: User)
categoryId: string? (relation: Category)
tags: Tag[] (relation)
publishedAt: datetime?
createdAt: datetime
updatedAt: datetime
```

### Category（分类）
```
id: string (cuid)
name: string
slug: string (unique)
description: string?
posts: Post[]
createdAt: datetime
updatedAt: datetime
```

### Tag（标签）
```
id: string (cuid)
name: string
slug: string (unique)
posts: Post[]
createdAt: datetime
```

### Comment（评论）
```
id: string (cuid)
content: string
authorName: string
authorEmail: string?
authorWebsite: string?
isApproved: boolean (default: false)
parentId: string? (self-relation)
postId: string (relation: Post)
userId: string? (relation: User)
createdAt: datetime
updatedAt: datetime
```

### Link（友链）
```
id: string (cuid)
name: string
url: string
description: string?
avatar: string?
isVisible: boolean (default: true)
order: int (default: 0)
createdAt: datetime
```

### SiteConfig（站点配置）
```
id: string (cuid)
key: string (unique)
value: string
```

### Like（点赞）
```
id: string (cuid)
postId: string (relation: Post)
visitorId: string
ipAddress: string?
createdAt: datetime
```

---

## 5. 项目结构

```
/
├── prisma/
│   ├── schema.prisma          # 数据库模型
│   └── seed.ts                # 种子数据
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (public)/          # 前台页面组
│   │   │   ├── page.tsx      # 首页
│   │   │   ├── posts/
│   │   │   │   ├── [slug]/
│   │   │   │   └── page.tsx  # 文章列表
│   │   │   ├── about/
│   │   │   ├── links/
│   │   │   └── search/
│   │   ├── (admin)/           # 后台页面组
│   │   │   ├── layout.tsx     # 后台布局
│   │   │   ├── dashboard/
│   │   │   ├── posts/
│   │   │   ├── categories/
│   │   │   ├── tags/
│   │   │   ├── comments/
│   │   │   ├── links/
│   │   │   └── settings/
│   │   ├── api/               # API 路由
│   │   │   ├── auth/
│   │   │   ├── posts/
│   │   │   ├── comments/
│   │   │   ├── likes/
│   │   │   ├── search/
│   │   │   └── rss/
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                # 基础 UI 组件
│   │   ├── layout/            # 布局组件
│   │   ├── posts/             # 文章相关组件
│   │   ├── comments/          # 评论组件
│   │   └── theme/             # 主题切换
│   ├── lib/
│   │   ├── prisma.ts         # Prisma 客户端
│   │   ├── auth.ts           # NextAuth 配置
│   │   ├── utils.ts          # 工具函数
│   │   └── validators/       # Zod 验证
│   ├── hooks/                # 自定义 Hooks
│   ├── types/                # TypeScript 类型
│   └── content/              # MDX 内容目录
├── public/
│   └── images/
├── .env.example              # 环境变量示例
├── .eslintrc.json
├── tailwind.config.ts
├── tsconfig.json
├── next.config.js
└── package.json
```

---

## 6. 环境变量规范

```env
# 数据库
DATABASE_URL="file:./dev.db"                    # SQLite
# DATABASE_URL="postgresql://..."               # PostgreSQL

# 认证
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-min-32-chars"

# 管理员账户（首次运行自动创建）
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="your-admin-password"
ADMIN_NAME="管理员"

# 站点配置
NEXT_PUBLIC_SITE_URL="https://yoursite.com"
NEXT_PUBLIC_SITE_NAME="我的博客"
NEXT_PUBLIC_SITE_DESCRIPTION="分享技术与生活"
```

---

## 7. 性能目标

| 指标 | 目标值 |
|------|--------|
| Lighthouse 性能 | ≥ 90 |
| Lighthouse 可访问性 | ≥ 90 |
| Lighthouse 最佳实践 | ≥ 90 |
| Lighthouse SEO | ≥ 90 |
| 首屏加载时间 (FCP) | < 1.5s |
| Time to Interactive | < 3s |

### 优化策略
- [x] 代码分割（Next.js 自动）
- [x] 图片优化（next/image）
- [x] 字体优化（next/font）
- [x] ISR/SSG 渲染
- [x] 资源预加载

---

## 8. 部署流程

### Vercel 一键部署
1. Fork 项目到 GitHub
2. 在 Vercel 导入项目
3. 配置环境变量
4. 点击 Deploy

### GitHub Actions CI/CD
- 代码提交自动触发 lint
- PR 自动部署预览
- main 分支合并自动部署生产

---

## 9. 扩展功能（待实现）

以下功能已在架构中预留接口，需要时可快速集成：

- [ ] Algolia/MeiliSearch 全文搜索
- [ ] Waline/Twikoo 评论系统
- [ ] 邮件订阅通知
- [ ] 数据备份与恢复
- [ ] ICP/公安备案号展示
- [ ] 隐私政策/Cookie 声明页面
- [ ] 作品集/在线简历模块

---

## 10. 代码规范

### ESLint + Prettier
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

### 命名规范
- 组件：PascalCase (e.g., `PostCard.tsx`)
- 工具函数：camelCase (e.g., `formatDate.ts`)
- API 路由：kebab-case (e.g., `/api/posts`)
- CSS 类：Tailwind utility classes

### 提交规范 (Conventional Commits)
```
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式
refactor: 重构
test: 测试
chore: 构建/工具
```

---

**文档版本**: 1.0.0
**最后更新**: 2026-04-02
