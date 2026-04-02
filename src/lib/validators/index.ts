/**
 * Zod 验证器定义
 * 用于 API 请求参数验证
 */

import { z } from 'zod';

// ===========================================
// 用户相关验证
// ===========================================

/** 用户登录验证 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, '请输入邮箱')
    .email('邮箱格式不正确'),
  password: z
    .string()
    .min(1, '请输入密码')
    .min(6, '密码至少 6 个字符'),
});

/** 用户注册验证 */
export const registerSchema = z.object({
  name: z
    .string()
    .min(1, '请输入昵称')
    .min(2, '昵称至少 2 个字符')
    .max(20, '昵称最多 20 个字符'),
  email: z
    .string()
    .min(1, '请输入邮箱')
    .email('邮箱格式不正确'),
  password: z
    .string()
    .min(1, '请输入密码')
    .min(6, '密码至少 6 个字符')
    .max(100, '密码最多 100 个字符'),
  confirmPassword: z.string().min(1, '请确认密码'),
}).refine((data) => data.password === data.confirmPassword, {
  message: '两次密码输入不一致',
  path: ['confirmPassword'],
});

/** 修改密码验证 */
export const changePasswordSchema = z.object({
  oldPassword: z
    .string()
    .min(1, '请输入原密码'),
  newPassword: z
    .string()
    .min(1, '请输入新密码')
    .min(6, '新密码至少 6 个字符')
    .max(100, '新密码最多 100 个字符'),
  confirmPassword: z.string().min(1, '请确认新密码'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: '两次密码输入不一致',
  path: ['confirmPassword'],
});

// ===========================================
// 文章相关验证
// ===========================================

/** 创建文章验证 */
export const createPostSchema = z.object({
  title: z
    .string()
    .min(1, '请输入文章标题')
    .min(5, '文章标题至少 5 个字符')
    .max(200, '文章标题最多 200 个字符'),
  content: z
    .string()
    .min(1, '请输入文章内容')
    .min(10, '文章内容至少 10 个字符'),
  excerpt: z
    .string()
    .max(500, '摘要最多 500 个字符')
    .optional(),
  coverImage: z
    .string()
    .url('封面图片 URL 格式不正确')
    .optional()
    .or(z.literal('')),
  status: z
    .enum(['PUBLISHED', 'DRAFT', 'ARCHIVED'])
    .default('DRAFT'),
  isPinned: z.boolean().default(false),
  categoryId: z
    .string()
    .optional(),
  tagIds: z
    .array(z.string())
    .optional(),
});

/** 更新文章验证 */
export const updatePostSchema = createPostSchema.extend({
  id: z.string().min(1, '文章 ID 不能为空'),
});

/** 文章列表查询验证 */
export const postListQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(10),
  category: z.string().optional(),
  tag: z.string().optional(),
  status: z.enum(['PUBLISHED', 'DRAFT', 'ARCHIVED']).optional(),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'publishedAt', 'viewCount', 'likeCount']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// ===========================================
// 分类相关验证
// ===========================================

/** 创建分类验证 */
export const createCategorySchema = z.object({
  name: z
    .string()
    .min(1, '请输入分类名称')
    .min(2, '分类名称至少 2 个字符')
    .max(50, '分类名称最多 50 个字符'),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, 'slug 只能包含小写字母、数字和连字符')
    .optional(),
  description: z
    .string()
    .max(200, '描述最多 200 个字符')
    .optional(),
  order: z.number().int().default(0),
});

/** 更新分类验证 */
export const updateCategorySchema = createCategorySchema.extend({
  id: z.string().min(1, '分类 ID 不能为空'),
});

// ===========================================
// 标签相关验证
// ===========================================

/** 创建标签验证 */
export const createTagSchema = z.object({
  name: z
    .string()
    .min(1, '请输入标签名称')
    .min(2, '标签名称至少 2 个字符')
    .max(30, '标签名称最多 30 个字符'),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, 'slug 只能包含小写字母、数字和连字符')
    .optional(),
});

/** 更新标签验证 */
export const updateTagSchema = createTagSchema.extend({
  id: z.string().min(1, '标签 ID 不能为空'),
});

// ===========================================
// 评论相关验证
// ===========================================

/** 创建评论验证 */
export const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, '请输入评论内容')
    .min(2, '评论内容至少 2 个字符')
    .max(2000, '评论内容最多 2000 个字符'),
  authorName: z
    .string()
    .min(1, '请输入昵称')
    .min(2, '昵称至少 2 个字符')
    .max(50, '昵称最多 50 个字符'),
  authorEmail: z
    .string()
    .email('邮箱格式不正确')
    .optional()
    .or(z.literal('')),
  authorWebsite: z
    .string()
    .url('网站 URL 格式不正确')
    .optional()
    .or(z.literal('')),
  postId: z
    .string()
    .min(1, '文章 ID 不能为空'),
  parentId: z
    .string()
    .optional(),
});

/** 评论列表查询验证 */
export const commentListQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
  postId: z.string().optional(),
  isApproved: z.enum(['true', 'false']).optional(),
  isPending: z.enum(['true', 'false']).optional(),
});

// ===========================================
// 友链相关验证
// ===========================================

/** 创建友链验证 */
export const createLinkSchema = z.object({
  name: z
    .string()
    .min(1, '请输入网站名称')
    .min(2, '网站名称至少 2 个字符')
    .max(50, '网站名称最多 50 个字符'),
  url: z
    .string()
    .min(1, '请输入网站链接')
    .url('网站链接格式不正确'),
  description: z
    .string()
    .max(200, '描述最多 200 个字符')
    .optional(),
  avatar: z
    .string()
    .url('头像 URL 格式不正确')
    .optional()
    .or(z.literal('')),
  order: z.number().int().default(0),
});

/** 更新友链验证 */
export const updateLinkSchema = createLinkSchema.extend({
  id: z.string().min(1, '友链 ID 不能为空'),
});

// ===========================================
// 站点配置验证
// ===========================================

/** 更新站点配置验证 */
export const updateSiteConfigSchema = z.object({
  siteName: z.string().min(1, '请输入网站名称').max(100),
  siteDescription: z.string().max(500).optional(),
  siteUrl: z.string().url('网站 URL 格式不正确'),
  siteAuthor: z.string().max(100).optional(),
  githubUrl: z.string().url('GitHub URL 格式不正确').optional().or(z.literal('')),
  twitterUrl: z.string().url('Twitter URL 格式不正确').optional().or(z.literal('')),
  email: z.string().email('邮箱格式不正确').optional().or(z.literal('')),
  icpNumber: z.string().max(50).optional(),
  gonganNumber: z.string().max(50).optional(),
});

// ===========================================
// 搜索相关验证
// ===========================================

/** 搜索验证 */
export const searchSchema = z.object({
  q: z.string().min(1, '请输入搜索关键词').max(100),
  type: z.enum(['posts', 'all']).default('posts'),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(10),
});

// ===========================================
// 通用类型导出
// ===========================================

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type CreateTagInput = z.infer<typeof createTagSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type CreateLinkInput = z.infer<typeof createLinkSchema>;
export type UpdateSiteConfigInput = z.infer<typeof updateSiteConfigSchema>;
export type SearchInput = z.infer<typeof searchSchema>;
