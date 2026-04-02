/**
 * 数据库 provider 切换脚本
 * Vercel 构建时自动运行：将 prisma/schema.prisma 的 provider 从 sqlite 切换为 postgresql
 * 本地开发不受影响
 *
 * 重要：切换后必须重新生成 Prisma Client！
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf-8');

if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgres')) {
  // 生产环境：切换为 PostgreSQL 并重新生成 Client
  schema = schema.replace('provider = "sqlite"', 'provider = "postgresql"');
  fs.writeFileSync(schemaPath, schema, 'utf-8');
  console.log('✅ Switched Prisma provider to postgresql');

  // 关键：重新生成 Prisma Client 以匹配新的 provider
  console.log('🔄 Regenerating Prisma Client for postgresql...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma Client regenerated');
} else {
  console.log('ℹ️  Keeping Prisma provider as sqlite (local dev)');
}
