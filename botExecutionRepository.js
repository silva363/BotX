"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BotExecutionRepository = void 0;
const functionsHelper_1 = require("../helpers/functionsHelper");
const db_1 = __importDefault(require("../utils/db"));
const settings_1 = require("../utils/settings");
class BotExecutionRepository {
    async create(botExecution, type) {
        try {
            const sql = `
      INSERT INTO bot_executions 
      (${type}, execution_time) 
      VALUES 
      (?, ?)
      `;
            const values = [
                botExecution[type],
                botExecution.execution_time
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
    async changeActive(botExecutionId, active) {
        try {
            const sql = 'UPDATE bot_executions SET active = ?, updated_at = now() WHERE id = ?';
            const values = [active, botExecutionId];
            await (0, db_1.default)(sql, values);
            if (active == 0) {
                await this.clearAirdrops(botExecutionId);
            }
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
    async clearAirdrops(botExecutionId) {
        try {
            const sql = 'UPDATE transactions SET need_airdrop = 0, updated_at = now() WHERE bot_execution = ?';
            const values = [botExecutionId];
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
    async startExecution(botId, type, isNew) {
        try {
            const sql = `
      SELECT *
      FROM bot_executions
      WHERE ${type} = ?
      ORDER BY id DESC
      LIMIT 1
      `;
            const values = [botId];
            const botRow = await (0, db_1.default)(sql, values);
            let botData = botRow[0];
            if (isNew) {
                if (!botData) {
                    botData = {
                        [type]: botId,
                        execution_time: 1,
                        active: 1
                    };
                }
                else {
                    botData.execution_time = botData.execution_time + 1;
                }
                await this.create(botData, type);
            }
            return await this.getLastInsert(botData.id, botId, type);
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
    async havePendingExecution(botId, type) {
        try {
            const sql = `
      SELECT *
      FROM bot_executions
      WHERE ${type} = ?
      AND active IN (1,2)
      ORDER BY id DESC
      LIMIT 1
      `;
            const values = [botId];
            const botRow = await (0, db_1.default)(sql, values);
            const botData = botRow[0];
            if (!botData || !botData.id) {
                return 0;
            }
            return botData.id;
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
    async isRunning(botId, executionId, type) {
        try {
            const sql = `
      SELECT id
      FROM bot_executions
      WHERE ${type} = ?
      AND id > ?
      ORDER BY id DESC
      LIMIT 1
      `;
            const values = [botId, executionId];
            const botRow = await (0, db_1.default)(sql, values);
            const botData = botRow[0];
            if (!botData || !botData.id) {
                return true;
            }
            return false;
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
    async verifyReRun(botExecutionId, botId, type) {
        try {
            const sql = `
      SELECT 
      be.active, 
      FORMAT(COUNT(t.id) / 2 + 1, 0) AS quantity,
      last_matic_transaction.hash AS maticHash,
      last_matic_transaction.new_wallet_private_key AS maticPrivateKey,
      last_selected_token_transaction.hash AS tokenHash,
      last_selected_token_transaction.new_wallet_private_key AS tokenPrivateKey
      FROM bot_executions be
      LEFT JOIN transactions t ON be.id = t.bot_execution 
      AND t.status = 1
      LEFT JOIN
      (
        SELECT *
        FROM transactions
        WHERE bot_execution = ${botExecutionId} 
        AND ${type} = ${botId} 
        AND status = 1 
        AND symbol_selected_token = 'MATIC' 
        AND need_airdrop = 1
        AND airdrop_status = 0
        ORDER BY id DESC
        LIMIT 1
      ) AS last_matic_transaction ON be.id = last_matic_transaction.bot_execution
      LEFT JOIN
      (
        SELECT *
        FROM transactions
        WHERE bot_execution = ${botExecutionId} 
        AND ${type} = ${botId} 
        AND symbol_selected_token != 'MATIC' 
        AND need_airdrop = 1
        AND airdrop_status = 0
        ORDER BY id DESC
        LIMIT 1
      ) AS last_selected_token_transaction ON be.id = last_selected_token_transaction.bot_execution
      WHERE 
      be.id = ${botExecutionId}
      AND be.${type} = ${botId}
      GROUP BY last_selected_token_transaction.id, be.active, maticHash, tokenHash, maticPrivateKey, tokenPrivateKey;
      `;
            const values = [];
            const dataRow = await (0, db_1.default)(sql, values);
            const data = dataRow[0];
            if (data.active != 2) {
                return { canReRun: false, loop: data.quantity, maticPrivateKey: data.maticPrivateKey, tokenPrivateKey: data.tokenPrivateKey, maticHash: data.maticHash, tokenHash: data.tokenHash };
            }
            return { canReRun: true, loop: data.quantity, maticPrivateKey: data.maticPrivateKey, tokenPrivateKey: data.tokenPrivateKey, maticHash: data.maticHash, tokenHash: data.tokenHash };
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
    async reRunGetLastTransactions(botExecutionId, botId, txLimit, type) {
        try {
            const sql = `
      SELECT *
      FROM transactions
      WHERE bot_execution = ${botExecutionId} 
      AND ${type} = ${botId} 
      ORDER BY id DESC
      LIMIT ${txLimit}
    `;
            const values = [];
            const dataRow = await (0, db_1.default)(sql, values);
            const transactions = dataRow;
            return transactions;
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
    async verifyRestart(botExecutionId, botId, type) {
        try {
            const sql = `
    SELECT 
    be.active, 
    FORMAT(COUNT(t.id) / 2 + 1, 0) AS quantity,
    last_matic_transaction.hash AS maticHash,
    last_matic_transaction.new_wallet_private_key AS maticPrivateKey,
    last_selected_token_transaction.hash AS tokenHash,
    last_selected_token_transaction.new_wallet_private_key AS tokenPrivateKey
    FROM bot_executions be
    LEFT JOIN transactions t ON be.id = t.bot_execution 
    AND t.status = 1
    LEFT JOIN
    (
      SELECT *
      FROM transactions
      WHERE bot_execution = ${botExecutionId} 
      AND ${type} = ${botId} 
      AND status = 1 
      AND symbol_selected_token = 'MATIC' 
      ORDER BY id DESC
      LIMIT 1
    ) AS last_matic_transaction ON be.id = last_matic_transaction.bot_execution
    LEFT JOIN
    (
      SELECT *
      FROM transactions
      WHERE bot_execution = ${botExecutionId} 
      AND ${type} = ${botId} 
      AND symbol_selected_token != 'MATIC' 
      ORDER BY id DESC
      LIMIT 1
    ) AS last_selected_token_transaction ON be.id = last_selected_token_transaction.bot_execution
    WHERE 
    be.id = ${botExecutionId}
    AND be.${type} = ${botId}
    AND be.active = 1
    GROUP BY last_selected_token_transaction.id, be.active, maticHash, tokenHash, maticPrivateKey, tokenPrivateKey;
    `;
            const values = [];
            const dataRow = await (0, db_1.default)(sql, values);
            const data = dataRow[0];
            return { canRestart: true, loop: data.quantity, maticPrivateKey: data.maticPrivateKey, tokenPrivateKey: data.tokenPrivateKey, maticHash: data.maticHash, tokenHash: data.tokenHash };
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
    async list(id, page, startDate, endDate, type) {
        try {
            let sql = `SELECT bot_executions.*, sb.active AS seed_active
      FROM bot_executions 
      LEFT JOIN ${type}s sb ON sb.id = bot_executions.${type}
      WHERE ${type} = ?`;
            const values = [id];
            if (startDate) {
                sql += ` AND bot_executions.created_at >= ?`;
                values.push(startDate);
            }
            if (endDate) {
                sql += ` AND bot_executions.created_at <= ?`;
                values.push(endDate);
            }
            sql += ` ORDER BY bot_executions.id DESC LIMIT ? OFFSET ?`;
            values.push(settings_1.settings.PAGE_SIZE, (0, functionsHelper_1.setPage)(page));
            const list = await (0, db_1.default)(sql, values);
            return list;
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
    async getLastInsert(executionId, botId, type) {
        try {
            const selectSql = `SELECT * FROM bot_executions WHERE ${type} = ? AND active = 1 ORDER BY id DESC LIMIT 1`;
            const values = [botId];
            const botRow = await (0, db_1.default)(selectSql, values);
            const botData = botRow[0];
            let id = 0;
            if (!botData) {
                await this.changeActive(executionId, 1);
                id = await this.getLastInsert(executionId, botId, type);
            }
            else {
                id = botData.id;
            }
            return id;
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
    async listBotsInactivesWithExecutionActive(table) {
        try {
            let values = [];
            let sql = `
      SELECT bot.id, bot.name, bot_executions.id AS execution_id
      FROM ${table}s bot
      LEFT JOIN bot_executions ON bot_executions.bot = bot.id
      WHERE bot.is_hidden = 0
      AND bot.active = 0
      AND bot_executions.active = 1
      GROUP BY bot.id, bot.name, execution_id`;
            const listBots = await (0, db_1.default)(sql, values);
            return listBots;
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
exports.BotExecutionRepository = BotExecutionRepository;
//# sourceMappingURL=botExecutionRepository.js.map