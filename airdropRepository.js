"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AirdropRepository = void 0;
const db_1 = __importDefault(require("../utils/db"));
class AirdropRepository {
    async create(airdrop) {
        try {
            const sql = `
        INSERT INTO airdrops (
        user_id, 
        bot_execution, 
        private_key,
        amount,
        token_symbol,
        token_address,
        destiny_address,
        delay_to_start
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
            const values = [
                airdrop.user_id,
                airdrop.bot_execution,
                airdrop.private_key,
                airdrop.amount,
                airdrop.token_symbol,
                airdrop.token_address,
                airdrop.destiny_address,
                airdrop.delay_to_start
            ];
            await (0, db_1.default)(sql, values);
            return await getLastInsert(airdrop.user_id, airdrop.bot_execution, airdrop.private_key, airdrop.token_symbol);
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
    async changeStatus(id, status) {
        try {
            const sql = 'UPDATE airdrops SET status = ?, updated_at = now() WHERE id = ?';
            const values = [status, id];
            await (0, db_1.default)(sql, values);
            console.log(`[Airdrop] id ${id}, status changed to ${status}`);
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
    async find(id, userId) {
        try {
            const sql = `
      SELECT *
      FROM airdrops
      WHERE id = ?
      AND user_id = ?
      `;
            const values = [id, userId];
            const row = await (0, db_1.default)(sql, values);
            const data = row[0];
            if (!data) {
                throw "Airdrop not find";
            }
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
    async list(userId, status = -1) {
        try {
            let sql = `
      SELECT *
      FROM airdrops
      WHERE id > 0
      ${userId > 0 ? 'AND user_id = ?' : ''}
      ${status >= 0 ? 'AND status = ?' : ''}
      ORDER BY id DESC `;
            let values = [];
            if (userId > 0) {
                values.push(userId);
            }
            if (status >= 0) {
                values.push(status);
            }
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
    async listToStart(userId, status = 0) {
        try {
            let sql = `
      SELECT *
      FROM airdrops
      WHERE id > 0
      AND status = ?
      ${userId > 0 ? 'AND user_id = ?' : ''}
      ORDER BY id DESC `;
            let values = [
                status
            ];
            if (userId > 0) {
                values.push(userId);
            }
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
}
exports.AirdropRepository = AirdropRepository;
async function getLastInsert(userId, botExecution, privateKey, symbol) {
    try {
        const sql = `
    SELECT *
    FROM airdrops
    WHERE user_id = ?
    AND bot_execution = ?
    AND private_key = ?
    AND token_symbol = ?
    LIMIT 1
    `;
        const values = [userId, botExecution, privateKey, symbol];
        const row = await (0, db_1.default)(sql, values);
        const data = row[0];
        if (!data) {
            throw "Airdrop last insert not find";
        }
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
//# sourceMappingURL=airdropRepository.js.map