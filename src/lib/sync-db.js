import { createClient } from '@libsql/client';
import { execSync } from 'child_process';
import dotenv from 'dotenv';

dotenv.config();

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function run() {
  console.log('Generating database SQL statements...');
  const sql = execSync(
    'npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script',
    { encoding: 'utf-8' }
  );

  console.log('Pushing schema directly to Turso cloud database...');
  await client.executeMultiple(sql);
  console.log('✅ Success! Your Turso database is fully synced and ready.');
  process.exit(0);
}

run().catch((err) => {
  console.error('❌ Failed to push schema:', err);
  process.exit(1);
});