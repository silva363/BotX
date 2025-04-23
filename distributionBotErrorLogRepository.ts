import { setPage } from '../helpers/functionsHelper';
import { DistributionBotErrorLog } from '../models/DistributionBotErrorLog';
import doQuery from '../utils/db';

export class DistributionBotErrorLogRepository {
  async create(distributionBot: DistributionBotErrorLog): Promise<void> {
    try {
      const sql = 'INSERT INTO distribution_bot_error_logs (distribution_bot, transaction) VALUES (?, ?)';
      const values = [
        distributionBot.distribution_bot,
        distributionBot.transaction
      ];

      await doQuery(sql, values);
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

  async find(distributionBotId: number, transactionId: number): Promise<DistributionBotErrorLog> {
    try {
      const selectSql = 'SELECT * FROM distribution_bot_error_logs WHERE distribution_bot = ? AND transaction = ? ORDER BY id DESC LIMIT 1';
      const values = [distributionBotId, transactionId];

      const botRow: DistributionBotErrorLog | any = await doQuery(selectSql, values);
      const botData = botRow[0];

      return botData;
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

  async list(distributionBotId: number, transactionId: number): Promise<DistributionBotErrorLog[]> {
    try {
      const selectSql = 'SELECT * FROM distribution_bot_error_logs WHERE distribution_bot = ? AND transaction = ?';
      const values = [distributionBotId, transactionId];

      const listDistributionBots: DistributionBotErrorLog[] | any = await doQuery(selectSql, values);

      return listDistributionBots;
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

  async updateStatus(id: number, status: number): Promise<void> {
    try {
      const sql = 'UPDATE transactions SET status = status, retries = retries + 1, updated_at = now() WHERE id = ?';
      const values: any = [status, id];

      await doQuery(sql, values);
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