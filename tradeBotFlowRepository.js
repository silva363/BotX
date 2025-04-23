"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TradeBotFlowRepository = void 0;
const db_1 = __importDefault(require("../utils/db"));
class TradeBotFlowRepository {
    async create(tradeBotFlow) {
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
            await (0, db_1.default)(sql, values);
        }
        catch (err) {
            if (err instanceof Error) {
                console.log('SQL error', err.message);
                throw err.message;
            }
            else {
                console.log('SQL error', err);
                throw err;
            }
        }
    }
    async updateFlowCycle(tradeBotFlow) {
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
            await (0, db_1.default)(sql, values);
        }
        catch (err) {
            if (err instanceof Error) {
                console.log('SQL error', err.message);
                throw err.message;
            }
            else {
                console.log('SQL error', err);
                throw err;
            }
        }
    }
    async find(id, tradeBotId, botExecutionId) {
        try {
            const sql = `
      SELECT * FROM trade_bot_flows WHERE id = ? AND trade_bot = ? AND bot_execution = ? ORDER BY id DESC LIMIT 1`;
            const values = [id, tradeBotId, botExecutionId];
            const tradeBotRow = await (0, db_1.default)(sql, values);
            const tradeBotFlowData = tradeBotRow[0];
            if (!tradeBotFlowData) {
                throw "Trade bot blow not find";
            }
            return tradeBotFlowData;
        }
        catch (err) {
            if (err instanceof Error) {
                console.log('SQL error', err.message);
                throw err.message;
            }
            else {
                console.log('SQL error', err);
                throw err;
            }
        }
    }
    async list(id, userId) {
        try {
            let values = [];
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
            const listTradeBotFlows = await (0, db_1.default)(sql, values);
            return listTradeBotFlows;
        }
        catch (err) {
            if (err instanceof Error) {
                console.log('SQL error', err.message);
                throw err.message;
            }
            else {
                console.log('SQL error', err);
                throw err;
            }
        }
    }
}
exports.TradeBotFlowRepository = TradeBotFlowRepository;
//# sourceMappingURL=tradeBotFlowRepository.js.map