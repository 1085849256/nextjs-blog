# 🎯 零配置一键部署指南

本教程将帮助你从零开始搭建并部署博客到 Vercel。

---

## 📋 目录

1. [本地开发环境搭建](#1-本地开发环境搭建)
2. [项目初始化](#2-项目初始化)
3. [本地运行测试](#3-本地运行测试)
4. [Vercel 部署](#4-vercel-部署)
5. [域名绑定](#5-域名绑定)
6. [CI/CD 配置](#6-cicd-配置)
7. [运维与监控](#7-运维与监控)

---

## 1. 本地开发环境搭建

### 系统要求

- **Node.js**: >= 18.17.0
- **npm**: >= 9.0.0 (或 yarn/pnpm)
- **Git**: 最新版本

### 安装 Node.js

**Windows:**
1. 下载 [Node.js LTS](https://nodejs.org/)
2. 运行安装程序，一路 Next 即可
3. 打开 PowerShell 验证:

```powershell
node --version  # 应该显示 v18.x.x 或更高
npm --version   # 应该显示 9.x.x 或更高
```

**macOS:**
```bash
# 使用 Homebrew 安装
brew install node

# 验证
node --version
npm --version
```

**Linux (Ubuntu/Debian):**
```bash
# 添加 NodeSource 仓库
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 验证
node --version
npm --version
```

### 安装 Git

**Windows:** 下载 [Git for Windows](https://gitforwindows.org/)

**macOS:** `brew install git`

**Linux:** `sudo apt install git`

---

## 2. 项目初始化

### 方式一：克隆现有项目（推荐）

```bash
# 克隆项目
git clone https://github.com/yourusername/nextjs-blog.git

# 进入目录
cd nextjs-blog

# 安装依赖
npm install

# 复制环境变量文件
cp .env.example .env.local
```

### 方式二：从零创建新项目

```bash
# 创建 Next.js 项目
npx create-next-app@latest my-blog --typescript --tailwind --eslint

# 进入目录
cd my-blog

# 安装额外依赖
npm install @prisma/client next-auth bcryptjs zod lucide-react

# 开发依赖
npm install -D prisma @types/bcryptjs

# 初始化 Prisma
npx prisma init
```

### 配置环境变量

编辑 `.env.local` 文件:

```env
# 数据库 - SQLite（开发用）
DATABASE_URL="file:./dev.db"

# NextAuth 配置
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-change-this-min-32-chars"

# 管理员账户
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="your-admin-password"
ADMIN_NAME="管理员"

# 站点信息
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
NEXT_PUBLIC_SITE_NAME="我的技术博客"
NEXT_PUBLIC_SITE_DESCRIPTION="分享技术与生活"
```

> ⚠️ **重要**: `NEXTAUTH_SECRET` 请使用至少 32 位随机字符生成:
> ```bash
> openssl rand -base64 32
> ```

---

## 3. 本地运行测试

### 初始化数据库

```bash
# 推送数据库结构
npm run db:push

# 初始化种子数据（可选）
npm run db:seed
```

### 启动开发服务器

```bash
npm run dev
```

打开浏览器访问: http://localhost:3000

### 访问管理后台

1. 访问: http://localhost:3000/login
2. 使用种子数据创建的管理员账号登录
3. 默认账号: `admin@example.com` / `admin123456`

---

## 4. Vercel 部署

### 步骤 1: 创建 GitHub 仓库

```bash
# 初始化 Git（如果还没有）
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit"

# 创建 GitHub 仓库并推送
git remote add origin https://github.com/yourusername/nextjs-blog.git
git branch -M main
git push -u origin main
```

### 步骤 2: Vercel 部署

1. **注册 Vercel 账号**
   - 访问 [vercel.com](https://vercel.com)
   - 使用 GitHub 账号登录

2. **导入项目**
   - 点击 "New Project"
   - 选择你的 GitHub 仓库
   - 点击 "Import"

3. **配置环境变量**
   - 在 Environment Variables 部分添加:
   ```
   DATABASE_URL          = file:./prod.db
   NEXTAUTH_URL          = https://your-domain.com
   NEXTAUTH_SECRET       = [使用 openssl rand -base64 32 生成]
   ADMIN_EMAIL           = your-admin@email.com
   ADMIN_PASSWORD        = [你的管理员密码]
   ADMIN_NAME            = 管理员
   NEXT_PUBLIC_SITE_URL  = https://your-domain.com
   NEXT_PUBLIC_SITE_NAME = 你的博客名
   ```

4. **部署**
   - 点击 "Deploy"
   - 等待构建完成（约 2-3 分钟）

5. **获取部署 URL**
   - 部署成功后，你会获得一个 `.vercel.app` 域名
   - 例如: `https://nextjs-blog.vercel.app`

---

## 5. 域名绑定

### 方式一：通过 Vercel（推荐）

1. 进入你的项目 → Settings → Domains
2. 输入你的域名（如 `blog.example.com`）
3. 点击 "Add"
4. 按照提示在你的域名 DNS 中添加记录

### 方式二：通过 Cloudflare

1. **登录 Cloudflare**
   - 访问 [dash.cloudflare.com](https://dash.cloudflare.com)

2. **添加域名**
   - 选择 "Add a site"
   - 输入你的域名
   - 选择免费计划

3. **配置 DNS 记录**

   在 DNS 设置页面添加:

   | Type  | Name    | Content           | Proxy    |
   |-------|---------|-------------------|----------|
   | CNAME | blog    | cname.vercel-dns.com | Proxied |
   | CNAME | www     | cname.vercel-dns.com | Proxied |

4. **等待生效**
   - DNS 更改可能需要 5-30 分钟生效

### 验证 HTTPS

Vercel 会自动为你配置免费的 SSL 证书。如果有问题:

1. 进入项目 → Settings → Domains
2. 点击你的域名
3. 选择 "Certificate" 选项卡
4. 点击 "Refresh Certificate"

---

## 6. CI/CD 配置

项目已包含 GitHub Actions 配置，自动化流程如下:

### 触发条件

- **Pull Request**: 运行测试和 lint
- **Push 到 main**: 自动部署到 Vercel

### 查看 Actions

1. 在 GitHub 仓库页面点击 "Actions" 标签
2. 可以看到所有 CI/CD 运行记录

### 手动部署

如需手动触发部署:

```bash
# 使用 Vercel CLI
npm i -g vercel
vercel --prod
```

---

## 7. 运维与监控

### 数据库管理

**开发环境:**
```bash
# 打开 Prisma Studio
npm run db:studio
```

**生产环境备份:**
```bash
# 导出数据（SQLite）
cp prisma/prod.db prisma/prod.backup.db
```

### 日志查看

**Vercel:**
1. 项目 Dashboard → Logs
2. 可以查看函数日志和错误

**本地:**
```bash
npm run dev
# 日志会直接输出到终端
```

### 性能监控

推荐使用以下服务:

- **Vercel Analytics**: 内置于 Vercel，免费
- **Sentry**: 应用错误监控
- **Umami**: 开源网站统计

### 安全建议

1. **定期更新依赖**
   ```bash
   npm outdated   # 查看过期依赖
   npm update     # 更新依赖
   ```

2. **定期备份数据库**
   ```bash
   # 复制数据库文件
   cp prisma/prod.db "prisma/backup-$(date +%Y%m%d).db"
   ```

3. **环境变量安全**
   - 永远不要提交 `.env` 文件到 Git
   - 定期更换 `NEXTAUTH_SECRET`

---

## ❓ 常见问题

### Q: 部署后页面空白?

检查是否正确设置了 `NEXT_PUBLIC_SITE_URL` 环境变量。

### Q: 数据库连接失败?

SQLite 在 Vercel 无服务器文件系统上可能有问题，建议:
1. 改用 Vercel Postgres
2. 或使用 PlanetScale (MySQL)

### Q: 图片不显示?

检查 `next.config.js` 中的 `images.remotePatterns` 配置是否包含你的图床域名。

### Q: 如何更新博客?

```bash
# 拉取最新代码
git pull origin main

# 更新依赖
npm install

# 推送数据库更改（如有）
npm run db:push

# 提交并推送
git add .
git commit -m "Update"
git push
```

---

## 📞 获取帮助

- 📖 查看 [SPEC.md](./SPEC.md) 了解项目规范
- 🐛 提交 [Issue](https://github.com/yourusername/nextjs-blog/issues)
- 📝 查看 [CHANGELOG](./CHANGELOG.md) 了解更新日志

---

**祝你部署顺利！🎉**
