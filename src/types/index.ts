/**
 * TypeScript 类型定义
 * 定义项目中使用的核心类型
 */

// ===========================================
// 用户相关类型
// ===========================================

/** 用户角色 */
export type UserRole = 'ADMIN' | 'EDITOR' | 'USER';

/** 用户信息 */
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string | null;
  bio?: string | null;
  createdAt: string;
  updatedAt: string;
}

/** 用户登录信息 */
export interface UserLogin {
  email: string;
  password: string;
}

/** 用户注册信息 */
export interface UserRegister {
  email: string;
  password: string;
  name: string;
}

// ===========================================
// 文章相关类型
// ===========================================

/** 文章状态 */
export type PostStatus = 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';

/** 文章基础信息 */
export interface PostBase {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  coverImage?: string | null;
  status: PostStatus;
  isPinned: boolean;
  viewCount: number;
  likeCount: number;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

/** 文章列表项（包含关联数据） */
export interface PostListItem extends PostBase {
  author: Pick<User, 'id' | 'name' | 'avatar'>;
  category?: Pick<Category, 'id' | 'name' | 'slug'> | null;
  tags: Pick<Tag, 'id' | 'name' | 'slug'>[];
}

/** 文章详情 */
export interface PostDetail extends PostBase {
  content: string;
  author: User;
  category?: Category | null;
  tags: Tag[];
  readingTime?: number;
  relatedPosts?: PostListItem[];
}

/** 创建文章 */
export interface CreatePost {
  title: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  status?: PostStatus;
  isPinned?: boolean;
  categoryId?: string;
  tagIds?: string[];
}

/** 更新文章 */
export interface UpdatePost extends Partial<CreatePost> {
  id: string;
}

// ===========================================
// 分类相关类型
// ===========================================

/** 分类信息 */
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
  postCount?: number;
}

/** 创建分类 */
export interface CreateCategory {
  name: string;
  slug?: string;
  description?: string;
  order?: number;
}

// ===========================================
// 标签相关类型
// ===========================================

/** 标签信息 */
export interface Tag {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  postCount?: number;
}

/** 创建标签 */
export interface CreateTag {
  name: string;
  slug?: string;
}

// ===========================================
// 评论相关类型
// ===========================================

/** 评论信息 */
export interface Comment {
  id: string;
  content: string;
  authorName: string;
  authorEmail?: string | null;
  authorWebsite?: string | null;
  authorAvatar?: string | null;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
  postId: string;
  userId?: string | null;
  parentId?: string | null;
  replies?: Comment[];
}

/** 创建评论 */
export interface CreateComment {
  content: string;
  authorName: string;
  authorEmail?: string;
  authorWebsite?: string;
  postId: string;
  parentId?: string;
}

// ===========================================
// 友链相关类型
// ===========================================

/** 友链信息 */
export interface Link {
  id: string;
  name: string;
  url: string;
  description?: string | null;
  avatar?: string | null;
  isVisible: boolean;
  order: number;
  isVerified: boolean;
  lastChecked?: string | null;
  createdAt: string;
  updatedAt: string;
}

/** 创建友链 */
export interface CreateLink {
  name: string;
  url: string;
  description?: string;
  avatar?: string;
  order?: number;
}

// ===========================================
// 站点配置相关类型
// ===========================================

/** 站点配置 */
export interface SiteConfig {
  id: string;
  key: string;
  value: string;
  type: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON';
  group: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

/** 站点设置 */
export interface SiteSettings {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  siteAuthor: string;
  githubUrl?: string;
  twitterUrl?: string;
  email?: string;
  icpNumber?: string;
  gonganNumber?: string;
}

// ===========================================
// API 响应类型
// ===========================================

/** 分页参数 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

/** 分页响应 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
}

/** API 通用响应 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

/** API 错误响应 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

// ===========================================
// 主题相关类型
// ===========================================

/** 主题模式 */
export type ThemeMode = 'light' | 'dark' | 'system';

/** 主题配置 */
export interface ThemeConfig {
  mode: ThemeMode;
  primaryColor?: string;
}

// ===========================================
// 搜索相关类型
// ===========================================

/** 搜索参数 */
export interface SearchParams {
  q: string;
  type?: 'posts' | 'all';
  page?: number;
  pageSize?: number;
}

/** 搜索结果 */
export interface SearchResult {
  posts: PostListItem[];
  total: number;
}

// ===========================================
// 统计相关类型
// ===========================================

/** 访问统计 */
export interface VisitStats {
  totalViews: number;
  totalPosts: number;
  totalComments: number;
  totalLikes: number;
  topPosts: PostListItem[];
  recentComments: Comment[];
}

// ===========================================
// 表单相关类型
// ===========================================

/** 表单错误 */
export interface FormErrors {
  [key: string]: string[];
}

/** 操作结果 */
export interface OperationResult<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: FormErrors;
}

// ===========================================
// 组件 Props 类型
// ===========================================

/** 加载状态 */
export interface LoadingState {
  isLoading: boolean;
  error?: string;
}

/** 空状态 */
export interface EmptyState {
  title: string;
  description?: string;
  icon?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

/** 列表项 Props */
export interface ListItemProps<T> {
  item: T;
  index: number;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
}

// ===========================================
// Next.js 相关类型
// ===========================================

/** Next.js Page Props */
export interface PageProps {
  params?: Record<string, string | string[]>;
  searchParams?: Record<string, string | string[]>;
}

/** 路由参数 */
export type RouteParams<T extends string> = {
  [K in T]: string;
};

// ===========================================
// 会话相关类型
// ===========================================

import type { DefaultSession, DefaultUser } from 'next-auth';

/** 扩展的会话用户 */
export interface ExtendedUser extends DefaultUser {
  role: UserRole;
  avatar?: string;
}

/** 扩展的会话 */
declare module 'next-auth' {
  interface Session {
    user: ExtendedUser;
  }

  interface User {
    role: UserRole;
    avatar?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: UserRole;
    avatar?: string;
  }
}
