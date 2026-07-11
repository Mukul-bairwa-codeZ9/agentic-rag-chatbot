import * as dotenv from 'dotenv';

dotenv.config();

export const env = {
  openAIApiKey: process.env.OPENAI_API_KEY ?? '',
  documentsPath:
    process.env.DOCUMENTS_PATH ?? 'src/data/documents',
  sqlitePath:
    process.env.SQLITE_DB_PATH ?? 'src/data/sqlite/orders.db',
  vectorStorePath:
    process.env.VECTOR_STORE_PATH ?? 'src/data/vector-store',
};