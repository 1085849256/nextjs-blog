/**
 * 数据库种子数据
 * 运行命令: npm run db:seed
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 开始初始化种子数据...\n');

  // ===========================================
  // 1. 创建管理员账户
  // ===========================================
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123456';
  const adminName = process.env.ADMIN_NAME || '管理员';

  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: adminName,
      password: hashedPassword,
      role: 'ADMIN',
      bio: '博客管理员，负责内容审核和网站管理。',
    },
  });

  console.log(`✅ 管理员账户已创建: ${admin.email}`);

  // ===========================================
  // 2. 创建分类
  // ===========================================
  const categories = [
    { name: '前端开发', slug: 'frontend', description: 'React, Vue, CSS, JavaScript 等前端技术' },
    { name: '后端开发', slug: 'backend', description: 'Node.js, Python, Go, 数据库等技术' },
    { name: 'DevOps', slug: 'devops', description: 'Docker, Kubernetes, CI/CD 等运维技术' },
    { name: '工具效率', slug: 'tools', description: '开发工具、效率软件推荐' },
    { name: '随笔杂谈', slug: 'essay', description: '生活感悟、学习心得' },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  console.log(`✅ ${categories.length} 个分类已创建`);

  // ===========================================
  // 3. 创建标签
  // ===========================================
  const tags = [
    { name: 'React', slug: 'react' },
    { name: 'Next.js', slug: 'nextjs' },
    { name: 'TypeScript', slug: 'typescript' },
    { name: 'Node.js', slug: 'nodejs' },
    { name: 'Python', slug: 'python' },
    { name: 'Docker', slug: 'docker' },
    { name: 'Tailwind CSS', slug: 'tailwind' },
    { name: 'Git', slug: 'git' },
  ];

  for (const tag of tags) {
    await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: {},
      create: tag,
    });
  }

  console.log(`✅ ${tags.length} 个标签已创建`);

  // ===========================================
  // 4. 创建示例文章
  // ===========================================
  const samplePosts = [
    {
      title: 'Next.js 14 App Router 完全指南',
      slug: 'nextjs-14-app-router-guide',
      content: `
# Next.js 14 App Router 完全指南

Next.js 14 带来了全新的 App Router 架构，本文将详细介绍其核心概念和使用方法。

## 服务端组件

App Router 的核心是服务端组件（Server Components）。默认情况下，所有组件都是服务端组件，这带来了显著的性能提升。

## 布局和页面

\`\`\`tsx
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
\`\`\`

## 数据获取

使用 \`async/await\` 在服务端组件中直接获取数据：

\`\`\`tsx
async function getData() {
  const res = await fetch('https://api.example.com/data');
  return res.json();
}
\`\`\`

## 总结

App Router 是 Next.js 的未来，值得深入学习和使用。
      `,
      excerpt: '全面介绍 Next.js 14 App Router 的核心概念和使用方法',
      status: 'PUBLISHED',
      isPinned: true,
      categorySlug: 'frontend',
      tagSlugs: ['nextjs', 'react', 'typescript'],
    },
    {
      title: 'TypeScript 高级类型技巧',
      slug: 'typescript-advanced-types',
      content: `
# TypeScript 高级类型技巧

TypeScript 的类型系统非常强大，掌握这些高级技巧可以写出更健壮的代码。

## 条件类型

\`\`\`typescript
type IsArray<T> = T extends any[] ? true : false;

type A = IsArray<string[]>; // true
type B = IsArray<string>;   // false
\`\`\`

## 映射类型

\`\`\`typescript
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};
\`\`\`

## 模板字面量类型

\`\`\`typescript
type EventName<T extends string> = \`on\${Capitalize<T>}\`;

type ClickEvent = EventName<'click'>; // 'onClick'
\`\`\`

这些技巧能让你的代码更加类型安全！
      `,
      excerpt: '分享 TypeScript 类型系统的各种高级用法',
      status: 'PUBLISHED',
      isPinned: false,
      categorySlug: 'frontend',
      tagSlugs: ['typescript'],
    },
    {
      title: 'Docker 从入门到精通',
      slug: 'docker-getting-started',
      content: `
# Docker 从入门到精通

Docker 是现代应用部署的事实标准，本教程带你从零掌握 Docker。

## 什么是 Docker

Docker 是一个容器化平台，可以将应用及其依赖打包成可移植的容器。

## 核心概念

- **镜像 (Image)**: 应用的只读模板
- **容器 (Container)**: 镜像的运行实例
- **仓库 (Registry)**: 存储和分发镜像的服务

## 常用命令

\`\`\`bash
# 构建镜像
docker build -t myapp .

# 运行容器
docker run -p 3000:3000 myapp

# 查看运行中的容器
docker ps
\`\`\`

快开始你的容器化之旅吧！
      `,
      excerpt: '系统学习 Docker 容器化技术',
      status: 'PUBLISHED',
      isPinned: false,
      categorySlug: 'devops',
      tagSlugs: ['docker'],
    },
  ];

  // 获取已创建的分类和标签
  const allCategories = await prisma.category.findMany();
  const allTags = await prisma.tag.findMany();

  for (const post of samplePosts) {
    const category = allCategories.find((c) => c.slug === post.categorySlug);
    const tagRecords = allTags.filter((t) => post.tagSlugs.includes(t.slug));

    await prisma.post.upsert({
      where: { slug: post.slug },
      update: {},
      create: {
        title: post.title,
        slug: post.slug,
        content: post.content.trim(),
        excerpt: post.excerpt,
        status: post.status as any,
        isPinned: post.isPinned,
        authorId: admin.id,
        categoryId: category?.id,
        publishedAt: new Date(),
        tags: {
          connect: tagRecords.map((t) => ({ id: t.id })),
        },
      },
    });
  }

  console.log(`✅ ${samplePosts.length} 篇示例文章已创建`);

  // ===========================================
  // 5. 创建友链
  // ===========================================
  const links = [
    {
      name: 'Vercel',
      url: 'https://vercel.com',
      description: '前端云部署平台，本博客托管于此',
      isVisible: true,
    },
    {
      name: 'Next.js',
      url: 'https://nextjs.org',
      description: 'React 服务端渲染框架',
      isVisible: true,
    },
    {
      name: 'Tailwind CSS',
      url: 'https://tailwindcss.com',
      description: '原子化 CSS 框架',
      isVisible: true,
    },
  ];

  for (const link of links) {
    await prisma.link.create({ data: link });
  }

  console.log(`✅ ${links.length} 个友链已创建`);

  // ===========================================
  // 6. 创建站点配置
  // ===========================================
  const siteConfigs = [
    { key: 'siteName', value: '我的技术博客', group: 'general', isPublic: true },
    { key: 'siteDescription', value: '分享技术与生活，记录成长历程', group: 'general', isPublic: true },
    { key: 'siteUrl', value: 'http://localhost:3000', group: 'general', isPublic: true },
    { key: 'postsPerPage', value: '10', group: 'general', isPublic: false },
    { key: 'commentReview', value: 'true', group: 'general', isPublic: false },
  ];

  for (const config of siteConfigs) {
    await prisma.siteConfig.upsert({
      where: { key: config.key },
      update: {},
      create: config,
    });
  }

  console.log(`✅ ${siteConfigs.length} 项站点配置已创建`);

  console.log('\n🎉 种子数据初始化完成！\n');
  console.log('========================================');
  console.log('📋 管理员登录信息:');
  console.log(`   邮箱: ${adminEmail}`);
  console.log(`   密码: ${adminPassword}`);
  console.log('========================================\n');
  console.log('🚀 运行 npm run dev 启动开发服务器\n');
}

main()
  .catch((e) => {
    console.error('❌ 种子数据初始化失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
