"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionRepository = void 0;
const db_1 = __importDefault(require("../utils/db"));
const functionsHelper_1 = require("../helpers/functionsHelper");
class TransactionRepository {
    async create(transaction) {
        try {
            const sql = `INSERT INTO transactions 
      (
        bot_address, distribution_bot_wallet, trade_bot, seed_bot, volume_bot, hash, result, 
        start_matic, end_matic, symbol_selected_token, start_selected_token, end_selected_token, 
        new_wallet_address, new_wallet_private_key, message, from_address, to_address, 
        type, airdrop_status, status, bot_execution
      ) 
      VALUES 
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
            const values = [
                transaction.bot_address,
                transaction.distribution_bot_wallet,
                transaction.trade_bot,
                transaction.seed_bot,
                transaction.volume_bot,
                transaction.hash,
                (0, functionsHelper_1.returnValidJson)(transaction.result),
                transaction.start_matic,
                transaction.end_matic,
                transaction.symbol_selected_token,
                transaction.start_selected_token,
                transaction.end_selected_token,
                transaction.new_wallet_address,
                transaction.new_wallet_private_key,
                (0, functionsHelper_1.returnValidJson)(transaction.message),
                transaction.from_address,
                transaction.to_address,
                transaction.type,
                transaction.airdrop_status,
                transaction.status,
                transaction.bot_execution
            ];
            const result = await (0, db_1.default)(sql, values);
            if (result.affectedRows <= 0) {
                throw 'Fail to create transaction';
            }
            let botId = 0;
            let type;
            if (transaction.bot_address) {
                botId = transaction.bot_address;
                type = 'bot_address';
            }
            else if (transaction.seed_bot) {
                botId = transaction.seed_bot;
                type = 'seed_bot';
            }
            else if (transaction.trade_bot) {
                botId = transaction.trade_bot;
                type = 'trade_bot';
            }
            else if (transaction.distribution_bot_wallet) {
                botId = transaction.distribution_bot_wallet;
                type = 'distribution_bot_wallet';
            }
            else {
                throw 'Failed to get last transaction';
            }
            return await this.getLastTransaction(transaction.bot_execution, botId, type, transaction.symbol_selected_token, transaction.from_address);
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
    async update(transaction) {
        try {
            let sql = `
      UPDATE transactions 
      SET hash = ?, end_matic = ?, end_selected_token = ?, message = ?, 
      result = ?, status = ?, need_airdrop = ?,
      updated_at = now()
      WHERE id = ?`;
            const values = [
                transaction.hash,
                transaction.end_matic,
                transaction.end_selected_token,
                (0, functionsHelper_1.returnValidJson)(transaction.message),
                (0, functionsHelper_1.returnValidJson)(transaction.result),
                transaction.status,
                transaction.need_airdrop,
                transaction.id
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
    async find(id) {
        try {
            const selectSql = 'SELECT * FROM transactions WHERE id = ?';
            const values = [id];
            const botRow = await (0, db_1.default)(selectSql, values);
            const botData = botRow[0];
            if (!botData) {
                throw "Transaction not find";
            }
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
    async listByAddressId(id, type = '') {
        try {
            let sql = `SELECT * FROM transactions WHERE bot_address = ? ORDER BY id DESC`;
            let values = [id];
            if (type) {
                sql = `SELECT * FROM transactions WHERE bot_address = ? AND type LIKE "%${type}%" ORDER BY id DESC`;
                values = [id];
            }
            const listBotAddresses = await (0, db_1.default)(sql, values);
            return listBotAddresses;
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
    async listByType(type) {
        try {
            let sql = `SELECT * FROM transactions WHERE type LIKE "%${type}%" ORDER BY id DESC`;
            let values = [];
            const listBotAddresses = await (0, db_1.default)(sql, values);
            return listBotAddresses;
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
    async findByPrivateKey(addressId, newWalletPrivateKey) {
        try {
            const selectSql = 'SELECT * FROM transactions WHERE bot_address = ? AND new_wallet_private_key = ?';
            const values = [addressId, newWalletPrivateKey];
            const transactionRow = await (0, db_1.default)(selectSql, values);
            const trasactionData = transactionRow[0];
            if (!trasactionData) {
                return null;
            }
            return trasactionData;
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
    async findByHash(hash) {
        try {
            const selectSql = 'SELECT * FROM transactions WHERE hash = ?';
            const values = [hash];
            const transactionRow = await (0, db_1.default)(selectSql, values);
            const trasactionData = transactionRow[0];
            if (!trasactionData) {
                return null;
            }
            return trasactionData;
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
    async listAirdrop(executionId) {
        try {
            let sql = `SELECT * FROM transactions 
      WHERE bot_execution = ? 
      AND airdrop_status = 0 
      AND need_airdrop = 1 
      AND status = 1 
      AND type != 'airdrop'
      AND new_wallet_private_key IS NOT NULL 
      AND bot_address IS NOT NULL
      AND symbol_selected_token != 'MATIC'
      ORDER BY id ASC`;
            let values = [executionId];
            const listBotAddresses = await (0, db_1.default)(sql, values);
            return listBotAddresses;
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
    async listAirdropMatic(executionId) {
        try {
            let sql = `SELECT * FROM transactions 
      WHERE bot_execution = ? 
      AND airdrop_status = 0 
      AND need_airdrop = 1 
      AND status = 1 
      AND type != 'airdrop'
      AND new_wallet_private_key IS NOT NULL 
      AND bot_address IS NOT NULL
      AND symbol_selected_token = 'MATIC'
      ORDER BY id ASC`;
            let values = [executionId];
            const listBotAddresses = await (0, db_1.default)(sql, values);
            return listBotAddresses;
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
    async changeAirdropStatus(id) {
        try {
            const sql = 'UPDATE transactions SET airdrop_status = 1, updated_at = now() WHERE id = ? AND need_airdrop = 1';
            const values = [id];
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
    async changeAirdropStatusByHash(hash) {
        try {
            const sql = 'UPDATE transactions SET airdrop_status = 1, updated_at = now() WHERE hash = ? AND need_airdrop = 1';
            const values = [hash];
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
    async changeNeedAirdrop(hash) {
        try {
            if (hash) {
                const sql = 'UPDATE transactions SET need_airdrop = 1, updated_at = now() WHERE hash = ?';
                const values = [hash];
                await (0, db_1.default)(sql, values);
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
    async changeNeedAirdropByNewWalletPrivateKeyAndTokenSymbol(newWalletPrivateKey, tokenSymbol) {
        try {
            const sql = 'UPDATE transactions SET need_airdrop = 1, updated_at = now() WHERE new_wallet_private_key = ? AND symbol_selected_token = ?';
            const values = [newWalletPrivateKey, tokenSymbol];
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
    async getLastTransaction(executionId, botId, type, tokenSymbol, fromWalletAddress) {
        try {
            const selectSql = `
      SELECT * FROM transactions 
      WHERE bot_execution = ? 
      AND ${type} = ? 
      AND symbol_selected_token = ? 
      AND from_address = ? 
      ORDER BY id DESC LIMIT 1`;
            const values = [executionId, botId, tokenSymbol, fromWalletAddress];
            const transactionRow = await (0, db_1.default)(selectSql, values);
            const trasactionData = transactionRow[0];
            if (!trasactionData) {
                throw 'Transaction not found';
            }
            return trasactionData;
        }
        catch (err) {
            if (err instanceof Error) {
                console.log('SQL error | getLastTransaction', err.message);
                throw err.message;
            }
            else {
                console.log('SQL error | getLastTransaction', err);
                throw err;
            }
        }
    }
    async lastTransactionByExecutionId(executionId, botId, type) {
        try {
            const selectSql = `SELECT * FROM transactions WHERE bot_execution = ? AND ${type} = ? ORDER BY id DESC LIMIT 1`;
            const values = [executionId, botId];
            const transactionRow = await (0, db_1.default)(selectSql, values);
            const trasactionData = transactionRow[0];
            if (!trasactionData) {
                return '';
            }
            return trasactionData.created_at;
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
    async updateSelectedTokenPending(id, endMatic, endSelectedToken) {
        try {
            const sql = 'UPDATE transactions SET end_matic = ?, end_selected_token = ?, updated_at = now() WHERE id = ?';
            const values = [endMatic, endSelectedToken, id];
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
exports.TransactionRepository = TransactionRepository;
//# sourceMappingURL=transactionRepository.js.map