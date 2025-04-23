import { Log } from '../models/Log';
import doQuery from '../utils/db';

export class LogRepository {
  async insert(log: Log): Promise<any> {
    try {
      log.type = log.type.toUpperCase();

      const logData = await this.findByPrivateKey(log.private_key);

      if (logData) {
        await update(log);
      } else {
        await create(log);
      }
    } catch (err) {
      if (err instanceof Error) {
        console.log('SQL error', err.message);
        throw err.message;
      } else {
        console.log('SQL error', err);
        throw err;
      }
    }
  }

  async list(refund: number = -1, symbol: string = '', limit: number = 1000): Promise<any> {
    try {
      const sql = `
      SELECT * 
      FROM logs 
      ${refund > -1 ? 'WHERE refund = ?' : ''}
      ${symbol ? `${refund > -1 ? 'AND' : 'WHERE'} token_symbol = '${symbol}'` : ''}
      ORDER BY id DESC
      LIMIT ${limit}
      `;

      const values: any[] = [];

      if (refund > -1) {
        values.push(refund);
      }

      const data: any = await doQuery(sql, values);

      return data;
    } catch (err) {
      if (err instanceof Error) {
        console.log('SQL error', err.message);
        throw err.message;
      } else {
        console.log('SQL error', err);
        throw err;
      }
    }
  }

  async findByPrivateKey(privateKey: string): Promise<Log> {
    try {
      const sql = `
      SELECT * FROM logs 
      WHERE private_key = ? 
      LIMIT 1
      `;

      const values = [privateKey];

      const rows: any = await doQuery(sql, values);
      const data = rows[0];

      return data;
    } catch (err) {
      if (err instanceof Error) {
        console.log('SQL error', err.message);
        throw err.message;
      } else {
        console.log('SQL error', err);
        throw err;
      }
    }
  }

  async refund(logId: number, refundAddress: string): Promise<void> {
    try {
      const sql = `
      UPDATE logs 
      SET refund = 1, refund_address = ?
      WHERE id = ?
      `;

      const values = [
        refundAddress,
        logId
      ];

      await doQuery(sql, values);
      console.log(`[Log] id ${logId} refunded to ${refundAddress}`);
    } catch (err) {
      if (err instanceof Error) {
        console.log('SQL error', err.message);
        throw err.message;
      } else {
        console.log('SQL error', err);
        throw err;
      }
    }
  }
}

async function create(log: Log): Promise<void> {
  try {
    const sql = `
    INSERT INTO logs 
    (transaction, private_key, token_symbol, amount, type) 
    VALUES 
    (?, ?, ?, ?, ?)
    `;

    const values = [
      log.transaction,
      log.private_key,
      log.token_symbol,
      log.amount,
      log.type
    ];

    await doQuery(sql, values);
    console.log(`[Log] created ${log.amount} tokens`);
  } catch (err) {
    if (err instanceof Error) {
      console.log('SQL error', err.message);
      throw err.message;
    } else {
      console.log('SQL error', err);
      throw err;
    }
  }
}

async function update(log: Log): Promise<void> {
  try {
    const sql = `
    UPDATE logs 
    SET transaction = ?, amount = ?, token_symbol = ?, type = ?, refund = 0
    WHERE private_key = ?
    `;

    const values = [
      log.transaction,
      log.amount,
      log.token_symbol,
      log.type,
      log.private_key
    ];

    await doQuery(sql, values);
    console.log(`[Log] updated ${log.amount} tokens`);
  } catch (err) {
    if (err instanceof Error) {
      console.log('SQL error', err.message);
      throw err.message;
    } else {
      console.log('SQL error', err);
      throw err;
    }
  }
}