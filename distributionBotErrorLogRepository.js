"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DistributionBotErrorLogRepository = void 0;
const db_1 = __importDefault(require("../utils/db"));
class DistributionBotErrorLogRepository {
    async create(distributionBot) {
        try {
            const sql = 'INSERT INTO distribution_bot_error_logs (distribution_bot, transaction) VALUES (?, ?)';
            const values = [
                distributionBot.distribution_bot,
                distributionBot.transaction
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
    async find(distributionBotId, transactionId) {
        try {
            const selectSql = 'SELECT * FROM distribution_bot_error_logs WHERE distribution_bot = ? AND transaction = ? ORDER BY id DESC LIMIT 1';
            const values = [distributionBotId, transactionId];
            const botRow = await (0, db_1.default)(selectSql, values);
            const botData = botRow[0];
            return botData;
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
    async list(distributionBotId, transactionId) {
        try {
            const selectSql = 'SELECT * FROM distribution_bot_error_logs WHERE distribution_bot = ? AND transaction = ?';
            const values = [distributionBotId, transactionId];
            const listDistributionBots = await (0, db_1.default)(selectSql, values);
            return listDistributionBots;
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
    async updateStatus(id, status) {
        try {
            const sql = 'UPDATE transactions SET status = status, retries = retries + 1, updated_at = now() WHERE id = ?';
            const values = [status, id];
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
}
exports.DistributionBotErrorLogRepository = DistributionBotErrorLogRepository;
//# sourceMappingURL=distributionBotErrorLogRepository.js.map