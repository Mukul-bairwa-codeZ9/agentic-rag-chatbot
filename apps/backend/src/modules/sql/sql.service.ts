import { Injectable, Logger } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { DatabaseService } from './database.service';
import { env } from '../../config/env.config';

@Injectable()
export class SqlService {
  private readonly logger = new Logger(SqlService.name);
  private readonly llm: ChatOpenAI;

  constructor(private readonly databaseService: DatabaseService) {
    this.llm = new ChatOpenAI({
      apiKey: env.groq.apiKey,
      configuration: { baseURL: env.groq.baseUrl },
      model: env.groq.model,
      temperature: 0,
    });
  }

  async query(question: string) {
    this.logger.log(`Generating SQL for: "${question}"`);
    
    const prompt = `
      You are an expert SQLite engineer.
      Database Table: orders
      Columns: order_id TEXT, customer TEXT, product TEXT, amount REAL, status TEXT, order_date TEXT
      
      Generate ONLY valid SQLite to answer this question. No markdown, no backticks, just the query.
      Question: "${question}"
    `;

    const sqlResponse = await this.llm.invoke(prompt);
    let sqlQuery = sqlResponse.content.toString().trim().replace(/```sql/g, '').replace(/```/g, '').trim();
    
    this.logger.log(`Generated SQL: ${sqlQuery}`);

    let dbResult: any[] = [];
    try {
      // Execute using Node 24 Native SQLite
      const statement = this.databaseService.db.prepare(sqlQuery);
      dbResult = statement.all() as any[];
    } catch (error: any) {
      this.logger.error(error);
      return { tool: 'SQL', success: false, sql: sqlQuery, answer: `SQL error: ${error.message}` };
    }

    const answerPrompt = `
      You are a helpful customer support assistant.
      User Question: ${question}
      Executed SQL: ${sqlQuery}
      Database Result: ${JSON.stringify(dbResult)}
      
      Answer the user's question naturally based on the data. Do not mention SQL.
    `;

    const finalAnswer = await this.llm.invoke(answerPrompt);

    return {
      tool: 'SQL',
      sql: sqlQuery,
      rows: dbResult,
      answer: finalAnswer.content,
    };
  }
}