export interface ChatResponse {
  tool: 'RAG' | 'SQL' | 'BOTH';

  answer: string;

  citations?: string[];

  sql?: string;
}