"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SwapRepository = void 0;
const db_1 = __importDefault(require("../utils/db"));
class SwapRepository {
    async create(swap) {
        try {
            const sql = `
        INSERT INTO swaps (
        user_id, 
        bot_execution, 
        bot_uuid,
        private_key,
        amount,
        token_name,
        token_symbol,
        token_address,
        swap_type,
        bot_type,
        mode
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
            const values = [
                swap.user_id,
                swap.bot_execution,
                swap.bot_uuid,
                swap.private_key,
                swap.amount,
                swap.token_name,
                swap.token_symbol,
                swap.token_address,
                swap.swap_type.toLowerCase(),
                swap.bot_type,
                swap.mode
            ];
            await (0, db_1.default)(sql, values);
            return await getLastInsert(swap.user_id, swap.bot_execution, swap.private_key, swap.token_symbol, swap.swap_type, swap.bot_type);
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
            const sql = 'UPDATE swaps SET status = ?, updated_at = now() WHERE id = ?';
            const values = [status, id];
            await (0, db_1.default)(sql, values);
            console.log(`[Swap] id ${id}, status changed to ${status}`);
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
      FROM swaps
      WHERE id = ?
      AND user_id = ?
      `;
            const values = [id, userId];
            const row = await (0, db_1.default)(sql, values);
            const data = row[0];
            if (!data) {
                throw "Swap not find";
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
      FROM swaps
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
    async listToStart() {
        try {
            let sql = `
      SELECT *
      FROM swaps
      WHERE id > 0
      AND status = 0
      AND mode = 'linear'
      ORDER BY id DESC
      `;
            const list = await (0, db_1.default)(sql);
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
    async listToStartIdles(botUuid, status = 0, userId = 0) {
        try {
            let sql = `
      SELECT *
      FROM swaps
      WHERE id > 0
      AND mode = 'queue'
      AND status = ?
      AND bot_uuid = ?
      ${userId > 0 ? 'AND user_id = ?' : ''}
      ORDER BY id DESC `;
            let values = [
                status,
                botUuid,
                userId
            ];
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
    async queueCount(botUuid) {
        try {
            const sql = `
      SELECT COUNT(*) AS queue
      FROM swaps
      WHERE bot_uuid = ?
      AND status = 0
      AND mode = 'queue'
      `;
            const values = [botUuid];
            const row = await (0, db_1.default)(sql, values);
            const data = row[0];
            return data.queue;
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
exports.SwapRepository = SwapRepository;
async function getLastInsert(userId, botExecution, privateKey, symbol, swap_type, bot_type) {
    try {
        const sql = `
    SELECT *
    FROM swaps
    WHERE user_id = ?
    AND bot_execution = ?
    AND private_key = ?
    AND token_symbol = ?
    AND swap_type = ?
    AND bot_type = ?
    LIMIT 1
    `;
        const values = [userId, botExecution, privateKey, symbol, swap_type, bot_type];
        const row = await (0, db_1.default)(sql, values);
        const data = row[0];
        if (!data) {
            throw "Swap last insert not find";
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
//# sourceMappingURL=swapRepository.js.map