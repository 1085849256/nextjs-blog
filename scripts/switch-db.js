/**
 * 数据库 provider 切换 + Prisma Client 生成脚本
 * 
 * 本脚本有两个使用场景：
 * 1. postinstall 阶段（npm install 后自动执行）
 * 2. build 阶段（npm run build 的第一步）
 * 
 * 在生产环境（DATABASE_URL 以 postgres 开头）：
 *   - 切换 schema provider 为 postgresql
 *   - 重新生成 Prisma Client
 * 
 * 在本地开发：
 *   - 保持 sqlite
 *   - 生成 Prisma Client
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf-8');

const isPostgres = process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgres');

if (isPostgres) {
  // 生产环境：确保 provider 为 postgresql
  if (schema.includes('provider = "sqlite"')) {
    schema = schema.replace('provider = "sqlite"', 'provider = "postgresql"');
    fs.writeFileSync(schemaPath, schema, 'utf-8');
    console.log('[switch-db] Switched Prisma provider: sqlite -> postgresql');
  } else {
    console.log('[switch-db] Prisma provider already set to postgresql');
  }
} else {
  // 本地开发：确保 provider 为 sqlite
  if (schema.includes('provider = "postgresql"')) {
    schema = schema.replace('provider = "postgresql"', 'provider = "sqlite"');
    fs.writeFileSync(schemaPath, schema, 'utf-8');
    console.log('[switch-db] Switched Prisma provider: postgresql -> sqlite');
  } else {
    console.log('[switch-db] Prisma provider already set to sqlite (local dev)');
  }
}

// 始终重新生成 Prisma Client 以确保一致性
console.log('[switch-db] Regenerating Prisma Client...');
try {
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('[switch-db] Prisma Client regenerated successfully');
} catch (err) {
  console.error('[switch-db] Failed to regenerate Prisma Client:', err.message);
  // postinstall 阶段失败不应该阻塞安装，build 阶段会再试
  if (process.env.npm_lifecycle_event !== 'postinstall') {
    process.exit(1);
  }
}
