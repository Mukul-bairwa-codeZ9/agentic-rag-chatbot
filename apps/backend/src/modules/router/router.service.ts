import { Injectable, Logger } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { RagService } from '../rag/rag.service';
import { SqlService } from '../sql/sql.service';

@Injectable()
export class RouterService {
  private readonly logger = new Logger(RouterService.name);
  private readonly llm: ChatOpenAI;

  constructor(
    private readonly ragService: RagService,
    private readonly sqlService: SqlService,
  ) {
    this.llm = new ChatOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      configuration: {
        baseURL: process.env.OPENAI_BASE_URL,
      },
      model: 'llama-3.3-70b-versatile',
      temperature: 0,
    });
  }

  async routeAndExecute(question: string) {
    this.logger.log(`Routing question: "${question}"`);

    const prompt = `
      You are a routing agent for a company.
      Analyze the following user question and decide whether it should be answered using:
      - "RAG": If it asks about company policies, leave, faq, returns, or pricing.
      - "SQL": If it asks about customer orders, statuses, revenue, or amounts.
      - "BOTH": If it asks about both policies and orders.

      Respond with ONLY ONE WORD: RAG, SQL, or BOTH.
      Question: "${question}"
    `;

    const response = await this.llm.invoke(prompt);
    const decision = response.content.toString().trim().toUpperCase();

    this.logger.log(`Decision made: ${decision}`);

    if (decision === 'SQL') {
      return this.sqlService.query(question);
    } 
    
    if (decision === 'BOTH') {
      const [ragResponse, sqlResponse] = await Promise.all([
        this.ragService.ask(question),
        this.sqlService.query(question),
      ]);
      
      return {
        tool: 'BOTH',
        answer: `**Policy Info:**\n${ragResponse.answer}\n\n**Order Info:**\n${sqlResponse.answer}`,
        citations: ragResponse.citations,
        sql: sqlResponse.sql,
      };
    } 

    // Default fallback to RAG
    return this.ragService.ask(question);
  }
}