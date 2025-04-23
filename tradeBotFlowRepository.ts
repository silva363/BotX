
import { setPage } from '../helpers/functionsHelper';
import { TradeBotFlow } from '../models/TradeBotFlow';
import doQuery from '../utils/db';

export class TradeBotFlowRepository {
  async create(tradeBotFlow: TradeBotFlow): Promise<void> {
    try {

      const sql = `
        INSERT INTO trade_bot_flows (
        trade_bot, 
        bot_execution,
        flow
        ) VALUES (?, ?, ?)
      `;

      const values = [
        tradeBotFlow.trade_bot,
        tradeBotFlow.bot_execution,
        tradeBotFlow.flow
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

  async updateFlowCycle(tradeBotFlow: TradeBotFlow): Promise<void> {
    try {
      const sql = `
        UPDATE trade_bot_flows SET 
        actual_cycle = ?,
        updated_at = now() 
        WHERE flow = ?
        AND trade_bot = ?
        AND bot_execution = ?
      `;

      const values = [
        tradeBotFlow.actual_cycle,
        tradeBotFlow.flow,
        tradeBotFlow.trade_bot,
        tradeBotFlow.bot_execution
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

  async find(id: number, tradeBotId: number, botExecutionId: number): Promise<TradeBotFlow | null> {
    try {
      const sql = `
      SELECT * FROM trade_bot_flows WHERE id = ? AND trade_bot = ? AND bot_execution = ? ORDER BY id DESC LIMIT 1`;
      const values = [id, tradeBotId, botExecutionId];

      const tradeBotRow: any = await doQuery(sql, values);
      const tradeBotFlowData: TradeBotFlow = tradeBotRow[0];

      if (!tradeBotFlowData) {
        throw "Trade bot blow not find";
      }

      return tradeBotFlowData;
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

  async list(id: number, userId: number): Promise<TradeBotFlow[]> {
    try {
      let values: any[] = [];

      let sql = `
      SELECT *
      FROM trade_bot_flows
      WHERE id = ?
      ${userId > 0 ? 'AND user_id = ?' : ''}
      ORDER BY id DESC `;

      values.push(id);

      if (userId > 0) {
        values.push(userId);
      }

      const listTradeBotFlows: any = await doQuery(sql, values);

      return listTradeBotFlows;
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