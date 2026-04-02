/**
 * 数据库 provider 切换脚本
 * Vercel 构建时自动运行：将 prisma/schema.prisma 的 provider 从 sqlite 切换为 postgresql
 * 本地开发不受影响
 */
const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf-8');

if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgres')) {
  // 生产环境：切换为 PostgreSQL
  schema = schema.replace('provider = "sqlite"', 'provider = "postgresql"');
  console.log('✅ Switched Prisma provider to postgresql');
} else {
  console.log('ℹ️  Keeping Prisma provider as sqlite (local dev)');
}

fs.writeFileSync(schemaPath, schema, 'utf-8');
