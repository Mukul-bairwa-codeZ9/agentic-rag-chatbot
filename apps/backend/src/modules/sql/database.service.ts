import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DatabaseSync } from 'node:sqlite';
import * as path from 'path';
import * as fs from 'fs';
import { env } from '../../config/env.config';

@Injectable()
export class DatabaseService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseService.name);
  public db!: DatabaseSync;

  onModuleInit() {
    this.logger.log('Initializing built-in Node 24 SQLite database...');
    
    // Ensure the sqlite directory exists
    const dir = path.dirname(env.sqliteDbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Use Node 24's native, built-in SQLite (Zero C++ bindings needed!)
    this.db = new DatabaseSync(env.sqliteDbPath);
    
    this.createTable();
    this.seedCsv();
  }

  get database() {
    return this.db;
  }

  private createTable() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS orders (
        order_id TEXT,
        customer TEXT,
        product TEXT,
        amount REAL,
        status TEXT,
        order_date TEXT
      );
    `);
  }

  private seedCsv() {
    const csvPath = path.join(process.cwd(), 'data', 'orders.csv');
    if (!fs.existsSync(csvPath)) {
      this.logger.warn('orders.csv not found. Make sure it is in the data/ folder.');
      return;
    }

    const countStmt = this.db.prepare('SELECT COUNT(*) as count FROM orders');
    const count: any = countStmt.get();
    
    if (count.count > 0) {
      this.logger.log('Orders already imported into SQLite.');
      return;
    }

    const insertStmt = this.db.prepare(`
      INSERT INTO orders (order_id, customer, product, amount, status, order_date)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const csvParser = require('csv-parser');
    
    fs.createReadStream(csvPath)
      .pipe(csvParser())
      .on('data', (row: any) => {
        insertStmt.run(
          row.order_id,
          row.customer,
          row.product,
          Number(row.amount),
          row.status,
          row.order_date
        );
      })
      .on('end', () => {
        this.logger.log('CSV orders successfully imported into native Node SQLite!');
      });
  }
}