import * as dotenv from 'dotenv';
import path from 'path';


const envPath = path.resolve(__dirname, '../../../../.env');
dotenv.config({ path: envPath });

function getEnv(key: string, required = true): string {
  const value = process.env[key];

  if (!value && required) {
    throw new Error(`Missing environment variable: ${key}`);
  }

  return value ?? '';
}

export const env = {
  groq: {
    apiKey: process.env.OPENAI_API_KEY,
    baseUrl: process.env.OPENAI_BASE_URL,
    model: 'llama-3.3-70b-versatile',
  },
  google: {
    apiKey: process.env.GOOGLE_API_KEY,
  },
  documentsPath: process.env.DOCUMENTS_PATH || 'data/documents',
  sqliteDbPath: process.env.SQLITE_DB_PATH || 'data/sqlite/orders.db',
};