import 'dotenv/config';
import { config as loadEnv } from 'dotenv';
loadEnv({ path: '.env.local', override: true });

import type { Config } from 'drizzle-kit';

export default {
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
