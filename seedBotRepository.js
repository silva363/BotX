"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeedBotRepository = void 0;
const functionsHelper_1 = require("../helpers/functionsHelper");
const db_1 = __importDefault(require("../utils/db"));
const settings_1 = require("../utils/settings");
const ethersHelper_1 = require("../helpers/ethersHelper");
class SeedBotRepository {
    async create(seedBot) {
        try {
            await (0, ethersHelper_1.getSigner)(seedBot.account_private_key);
            const encryptPrivateKey = (0, functionsHelper_1.encrypt)(seedBot.account_private_key);
            if (await verifyPrivateKeyExists(encryptPrivateKey)) {
                throw "This account private key already exists";
            }
            const encryptHelperPrivateKey = (0, functionsHelper_1.encrypt)(seedBot.helper_private_key);
            const sql = `
      INSERT INTO seed_bots 
      (uuid, user_id, name, helper_private_key, account_private_key, account_friendly_name, destiny_address, destiny_friendly_name, token_symbol, token_name, token_address, amount, cycles, cycle_ghosts, cycle_delay, airdrop_time) 
      VALUES 
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
            const values = [
                seedBot.uuid,
                seedBot.user_id,
                seedBot.name,
                encryptHelperPrivateKey,
                encryptPrivateKey,
                seedBot.account_friendly_name,
                seedBot.destiny_address,
                seedBot.destiny_friendly_name,
                seedBot.token_symbol,
                seedBot.token_name,
                seedBot.token_address,
                seedBot.amount,
                seedBot.cycles,
                seedBot.cycle_ghosts,
                seedBot.cycle_delay,
                seedBot.airdrop_time
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
    async update(seedBot) {
        try {
            let addEncryptPrivateKey = '';
            if (seedBot.account_private_key) {
                const encryptPrivateKey = (0, functionsHelper_1.encrypt)(seedBot.account_private_key);
                if (await verifyPrivateKeyExists(encryptPrivateKey)) {
                    throw "This account private key already exists";
                }
                addEncryptPrivateKey = `, account_private_key = "${encryptPrivateKey}"`;
            }
            ;
            let sql = `
      UPDATE seed_bots 
      SET name = ?, account_friendly_name = ?, destiny_address = ?, destiny_friendly_name = ?, 
      token_symbol = ?, token_name = ?, token_address = ?, amount = ?, 
      cycles = ?, cycle_ghosts = ?, cycle_delay = ?, airdrop_time = ?, 
      updated_at = now() ${addEncryptPrivateKey}
      WHERE uuid = ?`;
            const values = [
                seedBot.name,
                seedBot.account_friendly_name,
                seedBot.destiny_address,
                seedBot.destiny_friendly_name,
                seedBot.token_symbol,
                seedBot.token_name,
                seedBot.token_address,
                seedBot.amount,
                seedBot.cycles,
                seedBot.cycle_ghosts,
                seedBot.cycle_delay,
                seedBot.airdrop_time,
                seedBot.uuid
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
    async updateActualCycle(id, cycle) {
        try {
            let sql = `
      UPDATE seed_bots 
      SET actual_cycle = ?,
      updated_at = now()
      WHERE id = ?`;
            const values = [
                cycle,
                id
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
    async changeActive(uuid, active) {
        try {
            const sql = 'UPDATE seed_bots SET active = ?, updated_at = now() WHERE uuid = ?';
            const values = [active, uuid];
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
    async find(uuid, userId) {
        try {
            const sql = `
      SELECT *
      FROM seed_bots
      WHERE uuid = ?
      AND user_id = ?
      `;
            const values = [uuid, userId];
            const botRow = await (0, db_1.default)(sql, values);
            const botData = botRow[0];
            if (!botData) {
                throw "Seed bot not find";
            }
            if (botData?.account_private_key) {
                botData.account_private_key = (0, functionsHelper_1.decrypt)(botData.account_private_key);
            }
            if (botData?.helper_private_key) {
                botData.helper_private_key = (0, functionsHelper_1.decrypt)(botData.helper_private_key);
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
    async list(userId) {
        try {
            let sql = `
      SELECT *, 
      0 AS transactions, 
      0 AS executions
      FROM seed_bots 
      WHERE is_hidden = 0 
      ${userId > 0 ? 'AND user_id = ?' : ''}
      ORDER BY id DESC`;
            const values = [];
            if (userId > 0) {
                values.push(userId);
            }
            const listBots = await (0, db_1.default)(sql, values);
            listBots.forEach((element) => {
                if (element.account_private_key) {
                    element.account_private_key = (0, functionsHelper_1.decrypt)(element.account_private_key);
                }
                if (element?.helper_private_key) {
                    element.helper_private_key = (0, functionsHelper_1.decrypt)(element.helper_private_key);
                }
            });
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
    async listInactives(userId) {
        try {
            const sql = `
      SELECT *
      FROM seed_bots
      WHERE is_hidden = 1
      AND user_id = ?
      ORDER BY id DESC `;
            const values = [userId];
            const listBots = await (0, db_1.default)(sql, values);
            listBots.forEach((element) => {
                if (element.account_private_key) {
                    element.account_private_key = (0, functionsHelper_1.decrypt)(element.account_private_key);
                }
            });
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
    async listToStart() {
        try {
            let sql = `
      SELECT seed_bots.*, bot_executions.id AS execution_id
      FROM seed_bots 
      LEFT JOIN bot_executions ON bot_executions.seed_bot = seed_bots.id
      WHERE seed_bots.is_hidden = 0 
      AND seed_bots.active = 1
      AND bot_executions.active IN (1,2)
      GROUP BY    
      seed_bots.id, 
      seed_bots.uuid, 
      seed_bots.user_id, 
      seed_bots.name, 
      seed_bots.account_private_key, 
      seed_bots.account_friendly_name, 
      seed_bots.destiny_address, 
      seed_bots.destiny_friendly_name, 
      seed_bots.token_name, 
      seed_bots.token_symbol, 
      seed_bots.token_address, 
      seed_bots.amount, 
      seed_bots.cycles, 
      seed_bots.cycle_ghosts, 
      seed_bots.cycle_delay, 
      seed_bots.airdrop_time, 
      seed_bots.active, 
      seed_bots.is_hidden, 
      seed_bots.created_at, 
      seed_bots.updated_at,
      execution_id`;
            const listBots = await (0, db_1.default)(sql);
            listBots.forEach((element) => {
                if (element.account_private_key) {
                    element.account_private_key = (0, functionsHelper_1.decrypt)(element.account_private_key);
                }
            });
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
    async changeHidden(uuid, active) {
        try {
            const sql = 'UPDATE seed_bots SET is_hidden = ?, updated_at = now() WHERE uuid = ?';
            const values = [active, uuid];
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
    async executionsDetails(id, symbol, startDate, endDate) {
        try {
            let sql = `SELECT 
      (
        SELECT ROUND((SUM(CASE WHEN t.status = 1 THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2)
        FROM transactions t
        WHERE type != 'airdrop'
        AND seed_bot = ${id}
        ${symbol ? `AND t.symbol_selected_token = "${symbol}"` : ''}
        ${startDate ? `AND t.created_at >= "${startDate}"` : ''}
        ${endDate ? `AND t.created_at <= "${endDate}"` : ''}
      ) AS success_rate,
      (
        SELECT SUM(end_matic)
        FROM transactions t
        WHERE type = 'transfer_seed_start'
        AND symbol_selected_token = 'MATIC'
        AND status = 1
        AND seed_bot = ${id}
        ${startDate ? `AND t.created_at >= "${startDate}"` : ''}
        ${endDate ? `AND t.created_at <= "${endDate}"` : ''}
      ) AS matic_output,
      (
        SELECT SUM(end_selected_token) 
        FROM transactions t
        WHERE type = 'transfer_seed_start'
        AND symbol_selected_token != 'MATIC'
        AND symbol_selected_token != 'WMATIC'
        AND status = 1
        AND seed_bot = ${id}
        ${symbol ? `AND t.symbol_selected_token = "${symbol}"` : ''}
        ${startDate ? `AND t.created_at >= "${startDate}"` : ''}
        ${endDate ? `AND t.created_at <= "${endDate}"` : ''}
      ) AS selected_token_output,
      (
        SELECT SUM(start_selected_token) - SUM(end_selected_token)
        FROM transactions t
        WHERE type = 'transfer_destiny_seed'
        AND (symbol_selected_token = 'MATIC' OR symbol_selected_token = 'WMATIC')
        AND status = 1
        AND seed_bot = ${id}
        ${startDate ? `AND t.created_at >= "${startDate}"` : ''}
        ${endDate ? `AND t.created_at <= "${endDate}"` : ''}
      ) AS matic_input,
      (
        SELECT SUM(start_selected_token) - SUM(end_selected_token)
        FROM transactions t
        WHERE type = 'transfer_destiny_seed'
        AND symbol_selected_token != 'MATIC'
        AND symbol_selected_token != 'WMATIC'
        AND status = 1
        AND seed_bot = ${id}
        ${symbol ? `AND t.symbol_selected_token = "${symbol}"` : ''}
        ${startDate ? `AND t.created_at >= "${startDate}"` : ''}
        ${endDate ? `AND t.created_at <= "${endDate}"` : ''}
      ) AS selected_token_input,
      (
        ${!symbol ? `SELECT FORMAT(COUNT(id) / 2, 0)` : 'SELECT FORMAT(COUNT(id), 0)'}
        FROM transactions t
        WHERE (type = 'transfer_seed' OR type = 'transfer_seed_start')
        AND seed_bot = ${id}
        AND status = 1
        ${symbol ? `AND t.symbol_selected_token = "${symbol}"` : ''}
        ${startDate ? `AND t.created_at >= "${startDate}"` : ''}
        ${endDate ? `AND t.created_at <= "${endDate}"` : ''}
      ) AS ghost_wallets,
      (
        SELECT SUM(end_matic) FROM transactions t
        WHERE type != 'airdrop' 
        AND new_wallet_private_key IS NOT NULL 
        AND seed_bot = ${id}
        AND status = 1
        ${startDate ? `AND t.created_at >= "${startDate}"` : ''}
        ${endDate ? `AND t.created_at <= "${endDate}"` : ''}
      ) AS matic_success,
      (
        SELECT SUM(end_matic) FROM transactions t
        WHERE type != 'airdrop' 
        AND new_wallet_private_key IS NOT NULL 
        AND seed_bot = ${id}
        AND status = 0
        ${startDate ? `AND t.created_at >= "${startDate}"` : ''}
        ${endDate ? `AND t.created_at <= "${endDate}"` : ''}
      ) AS matic_fails,
      (
        SELECT SUM(end_selected_token) FROM transactions t
        WHERE type != 'airdrop' 
        AND new_wallet_private_key IS NOT NULL 
        AND seed_bot = ${id}
        AND status = 1
        ${symbol ? `AND t.symbol_selected_token = "${symbol}"` : ''}
        ${startDate ? `AND t.created_at >= "${startDate}"` : ''}
        ${endDate ? `AND t.created_at <= "${endDate}"` : ''}
      ) AS selected_token_success,
      (
        SELECT SUM(end_selected_token) FROM transactions t
        WHERE type != 'airdrop' 
        AND new_wallet_private_key IS NOT NULL 
        AND seed_bot = ${id}
        AND status = 0
        ${symbol ? `AND t.symbol_selected_token = "${symbol}"` : ''}
        ${startDate ? `AND t.created_at >= "${startDate}"` : ''}
        ${endDate ? `AND t.created_at <= "${endDate}"` : ''}
      ) AS selected_token_fails,
      (
        SELECT SUM(end_matic) FROM transactions t
        WHERE type != 'airdrop' 
        AND new_wallet_private_key IS NOT NULL 
        AND seed_bot = ${id}
        AND need_airdrop = 1
        AND airdrop_status = 0
        AND status = 1
        AND (symbol_selected_token = 'MATIC' OR symbol_selected_token = 'WMATIC')
        ${startDate ? `AND t.created_at >= "${startDate}"` : ''}
        ${endDate ? `AND t.created_at <= "${endDate}"` : ''}
      ) AS matic_pending,
      (
        SELECT SUM(end_selected_token) FROM transactions t
        WHERE type != 'airdrop' 
        AND new_wallet_private_key IS NOT NULL 
        AND seed_bot = ${id}
        AND need_airdrop = 1
        AND airdrop_status = 0
        AND status = 1
        AND symbol_selected_token != 'MATIC'
        AND symbol_selected_token != 'WMATIC'
        ${symbol ? `AND t.symbol_selected_token = "${symbol}"` : ''}
        ${startDate ? `AND t.created_at >= "${startDate}"` : ''}
        ${endDate ? `AND t.created_at <= "${endDate}"` : ''}
      ) AS selected_token_pending
      FROM transactions
      LEFT JOIN seed_bots ON transactions.seed_bot = seed_bots.id
      WHERE transactions.type != 'airdrop' 
      AND transactions.new_wallet_private_key IS NOT NULL 
      AND transactions.seed_bot = ${id}
      ${symbol ? `AND transactions.symbol_selected_token = "${symbol}"` : ''}
      ${startDate ? `AND transactions.created_at >= "${startDate}"` : ''}
      ${endDate ? `AND transactions.created_at <= "${endDate}"` : ''}
      `;
            const values = [];
            const details = await (0, db_1.default)(sql, values);
            return details[0];
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
    async transactions(id, executionId, page, symbol, startDate, endDate) {
        try {
            let sql = `SELECT *
      FROM transactions 
      WHERE seed_bot = ?
      AND bot_execution = ?`;
            const values = [id, executionId];
            if (symbol) {
                sql += ` AND symbol_selected_token = ?`;
                values.push(symbol);
            }
            if (startDate) {
                sql += ` AND created_at >= ?`;
                values.push(startDate);
            }
            if (endDate) {
                sql += ` AND created_at <= ?`;
                values.push(endDate);
            }
            sql += ` ORDER BY id DESC LIMIT ? OFFSET ?`;
            values.push(settings_1.settings.PAGE_SIZE, (0, functionsHelper_1.setPage)(page));
            const listDistributionBotWallets = await (0, db_1.default)(sql, values);
            return listDistributionBotWallets;
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
    async transactionsDetails(id, executionId, symbol, startDate, endDate) {
        try {
            let sql = `SELECT 
      (
        SELECT ROUND((SUM(CASE WHEN t.status = 1 THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2)
        FROM transactions t
        WHERE type != 'airdrop'
        AND seed_bot = ${id}
        AND bot_execution =${executionId}
        ${symbol ? `AND t.symbol_selected_token = "${symbol}"` : ''}
        ${startDate ? `AND t.created_at >= "${startDate}"` : ''}
        ${endDate ? `AND t.created_at <= "${endDate}"` : ''}
      ) AS success_rate,
      (
        SELECT SUM(end_matic)
        FROM transactions t
        WHERE type = 'transfer_seed_start'
        AND symbol_selected_token = 'MATIC'
        AND status = 1
        AND seed_bot = ${id}
        AND bot_execution =${executionId}
        ${startDate ? `AND t.created_at >= "${startDate}"` : ''}
        ${endDate ? `AND t.created_at <= "${endDate}"` : ''}
      ) AS matic_output,
      (
        SELECT SUM(end_selected_token) 
        FROM transactions t
        WHERE type = 'transfer_seed_start'
        AND symbol_selected_token != 'MATIC'
        AND symbol_selected_token != 'WMATIC'
        AND status = 1
        AND seed_bot = ${id}
        AND bot_execution =${executionId}
        ${symbol ? `AND t.symbol_selected_token = "${symbol}"` : ''}
        ${startDate ? `AND t.created_at >= "${startDate}"` : ''}
        ${endDate ? `AND t.created_at <= "${endDate}"` : ''}
      ) AS selected_token_output,
      (
        SELECT SUM(start_selected_token) - SUM(end_selected_token)
        FROM transactions t
        WHERE type = 'transfer_destiny_seed'
        AND (symbol_selected_token = 'MATIC' OR symbol_selected_token = 'WMATIC')
        AND status = 1
        AND seed_bot = ${id}
        AND bot_execution =${executionId}
        ${startDate ? `AND t.created_at >= "${startDate}"` : ''}
        ${endDate ? `AND t.created_at <= "${endDate}"` : ''}
      ) AS matic_input,
      (
        SELECT SUM(start_selected_token) - SUM(end_selected_token)
        FROM transactions t
        WHERE type = 'transfer_destiny_seed'
        AND symbol_selected_token != 'MATIC'
        AND symbol_selected_token != 'WMATIC'
        AND status = 1
        AND seed_bot = ${id}
        AND bot_execution =${executionId}
        ${symbol ? `AND t.symbol_selected_token = "${symbol}"` : ''}
        ${startDate ? `AND t.created_at >= "${startDate}"` : ''}
        ${endDate ? `AND t.created_at <= "${endDate}"` : ''}
      ) AS selected_token_input,
      (
        
        ${!symbol ? `SELECT FORMAT(COUNT(id) / 2, 0)` : 'SELECT FORMAT(COUNT(id), 0)'}
        FROM transactions t
        WHERE (type = 'transfer_seed' OR type = 'transfer_seed_start')
        AND seed_bot = ${id}
        AND bot_execution =${executionId}
        AND status = 1
        ${symbol ? `AND t.symbol_selected_token = "${symbol}"` : ''}
        ${startDate ? `AND t.created_at >= "${startDate}"` : ''}
        ${endDate ? `AND t.created_at <= "${endDate}"` : ''}
      ) AS ghost_wallets,
      (
        SELECT SUM(end_matic) FROM transactions t
        WHERE type != 'airdrop' 
        AND new_wallet_private_key IS NOT NULL 
        AND seed_bot = ${id}
        AND bot_execution =${executionId}
        AND status = 1
        ${startDate ? `AND t.created_at >= "${startDate}"` : ''}
        ${endDate ? `AND t.created_at <= "${endDate}"` : ''}
      ) AS matic_success,
      (
        SELECT SUM(end_matic) FROM transactions t
        WHERE type != 'airdrop' 
        AND new_wallet_private_key IS NOT NULL 
        AND seed_bot = ${id}
        AND bot_execution =${executionId}
        AND status = 0
        ${startDate ? `AND t.created_at >= "${startDate}"` : ''}
        ${endDate ? `AND t.created_at <= "${endDate}"` : ''}
      ) AS matic_fails,
      (
        SELECT SUM(end_selected_token) FROM transactions t
        WHERE type != 'airdrop' 
        AND new_wallet_private_key IS NOT NULL 
        AND seed_bot = ${id}
        AND bot_execution =${executionId}
        AND status = 1
        ${symbol ? `AND t.symbol_selected_token = "${symbol}"` : ''}
        ${startDate ? `AND t.created_at >= "${startDate}"` : ''}
        ${endDate ? `AND t.created_at <= "${endDate}"` : ''}
      ) AS selected_token_success,
      (
        SELECT SUM(end_selected_token) FROM transactions t
        WHERE type != 'airdrop' 
        AND new_wallet_private_key IS NOT NULL 
        AND seed_bot = ${id}
        AND bot_execution =${executionId}
        AND status = 0
        ${symbol ? `AND t.symbol_selected_token = "${symbol}"` : ''}
        ${startDate ? `AND t.created_at >= "${startDate}"` : ''}
        ${endDate ? `AND t.created_at <= "${endDate}"` : ''}
      ) AS selected_token_fails,
      (
        SELECT SUM(end_matic) FROM transactions t
        WHERE type != 'airdrop' 
        AND new_wallet_private_key IS NOT NULL 
        AND seed_bot = ${id}
        AND bot_execution =${executionId}
        AND need_airdrop = 1
        AND airdrop_status = 0
        AND status = 1
        AND (symbol_selected_token = 'MATIC' OR symbol_selected_token = 'WMATIC')
        ${startDate ? `AND t.created_at >= "${startDate}"` : ''}
        ${endDate ? `AND t.created_at <= "${endDate}"` : ''}
      ) AS matic_pending,
      (
        SELECT SUM(end_selected_token) FROM transactions t
        WHERE type != 'airdrop' 
        AND new_wallet_private_key IS NOT NULL 
        AND seed_bot = ${id}
        AND bot_execution =${executionId}
        AND need_airdrop = 1
        AND airdrop_status = 0
        AND status = 1
        AND symbol_selected_token != 'MATIC'
        AND symbol_selected_token != 'WMATIC'
        ${symbol ? `AND t.symbol_selected_token = "${symbol}"` : ''}
        ${startDate ? `AND t.created_at >= "${startDate}"` : ''}
        ${endDate ? `AND t.created_at <= "${endDate}"` : ''}
      ) AS selected_token_pending
      FROM transactions t
      LEFT JOIN seed_bots ON t.seed_bot = seed_bots.id
      WHERE t.type != 'airdrop' 
      AND t.new_wallet_private_key IS NOT NULL 
      AND t.seed_bot = ${id}
      AND t.bot_execution =${executionId}
      ${symbol ? `AND t.symbol_selected_token = "${symbol}"` : ''}
      ${startDate ? `AND t.created_at >= "${startDate}"` : ''}
      ${endDate ? `AND t.created_at <= "${endDate}"` : ''}
      `;
            const values = [];
            const details = await (0, db_1.default)(sql, values);
            return details[0];
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
exports.SeedBotRepository = SeedBotRepository;
async function verifyPrivateKeyExists(accountPrivateKey) {
    try {
        const sql = `
    SELECT id
    FROM seed_bots
    WHERE account_private_key = ?
    `;
        const values = [accountPrivateKey];
        const botRow = await (0, db_1.default)(sql, values);
        const botData = botRow[0];
        if (botData?.account_private_key) {
            botData.account_private_key = (0, functionsHelper_1.decrypt)(botData.account_private_key);
        }
        return botData;
    }
    catch (err) {
        if (err instanceof Error) {
            throw err.message;
        }
        else {
            throw err;
        }
    }
}
//# sourceMappingURL=seedBotRepository.js.map