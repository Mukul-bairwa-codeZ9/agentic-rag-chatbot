import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config();

function getEnv(key: string, required = true): string {
  const value = process.env[key];

  if (!value && required) {
    throw new Error(`Missing environment variable: ${key}`);
  }

  return value ?? '';
}

export const env = {
  groq: {
    apiKey: getEnv('OPENAI_API_KEY'),
    baseUrl: getEnv('OPENAI_BASE_URL'),
    model: process.env.GROQ_MODEL ?? 'llama-3.3-70b-versatile',
  },

  google: {
    apiKey: getEnv('GOOGLE_API_KEY'),
    embeddingModel:
      process.env.GEMINI_EMBEDDING_MODEL 
  },

 documentsPath: process.env.DOCUMENTS_PATH || path.join(process.cwd(), 'data', 'documents'),
  sqlitePath: process.env.SQLITE_DB_PATH || path.join(process.cwd(), 'data', 'sqlite', 'orders.db'),
};