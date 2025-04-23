"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogRepository = void 0;
const db_1 = __importDefault(require("../utils/db"));
class LogRepository {
    async insert(log) {
        try {
            log.type = log.type.toUpperCase();
            const logData = await this.findByPrivateKey(log.private_key);
            if (logData) {
                await update(log);
            }
            else {
                await create(log);
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
    async list(refund = -1, symbol = '', limit = 1000) {
        try {
            const sql = `
      SELECT * 
      FROM logs 
      ${refund > -1 ? 'WHERE refund = ?' : ''}
      ${symbol ? `${refund > -1 ? 'AND' : 'WHERE'} token_symbol = '${symbol}'` : ''}
      ORDER BY id DESC
      LIMIT ${limit}
      `;
            const values = [];
            if (refund > -1) {
                values.push(refund);
            }
            const data = await (0, db_1.default)(sql, values);
            return data;
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
    async findByPrivateKey(privateKey) {
        try {
            const sql = `
      SELECT * FROM logs 
      WHERE private_key = ? 
      LIMIT 1
      `;
            const values = [privateKey];
            const rows = await (0, db_1.default)(sql, values);
            const data = rows[0];
            return data;
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
    async refund(logId, refundAddress) {
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
            await (0, db_1.default)(sql, values);
            console.log(`[Log] id ${logId} refunded to ${refundAddress}`);
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
exports.LogRepository = LogRepository;
async function create(log) {
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
        await (0, db_1.default)(sql, values);
        console.log(`[Log] created ${log.amount} tokens`);
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
async function update(log) {
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
        await (0, db_1.default)(sql, values);
        console.log(`[Log] updated ${log.amount} tokens`);
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
//# sourceMappingURL=logRepository.js.map