"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DistributionBotRepository = void 0;
const functionsHelper_1 = require("../helpers/functionsHelper");
const distributionBotWalletRepository_1 = require("./distributionBotWalletRepository");
const settings_1 = require("../utils/settings");
const db_1 = __importDefault(require("../utils/db"));
const ethersHelper_1 = require("../helpers/ethersHelper");
class DistributionBotRepository {
    async create(distributionBot, wallets) {
        try {
            await (0, ethersHelper_1.getSigner)(distributionBot.account_private_key);
            const encryptPrivateKey = (0, functionsHelper_1.encrypt)(distributionBot.account_private_key);
            if (await verifyPrivateKeyExists(encryptPrivateKey)) {
                throw "This account private key already exists";
            }
            const sql = 'INSERT INTO distribution_bots (uuid, user_id, name, password, token_symbol, delay, account_private_key, account_friendly_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
            const values = [
                distributionBot.uuid,
                distributionBot.user_id,
                distributionBot.name,
                distributionBot.password,
                distributionBot.token_symbol,
                distributionBot.delay,
                encryptPrivateKey,
                distributionBot.account_friendly_name
            ];
            const sqlRow = await (0, db_1.default)(sql, values);
            if (sqlRow.affectedRows > 0) {
                const distributionBotData = await getLastInsert(distributionBot.user_id);
                if (distributionBotData) {
                    const distributionBotWalletRepository = new distributionBotWalletRepository_1.DistributionBotWalletRepository();
                    wallets.forEach(async (element) => {
                        await distributionBotWalletRepository.create(element);
                    });
                }
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
    async update(distributionBot, wallets) {
        try {
            let sql = 'UPDATE distribution_bots SET name = ?, token_symbol = ?, delay = ?, account_friendly_name = ?, updated_at = now() WHERE uuid = ? AND user_id = ?';
            let values = [
                distributionBot.name,
                distributionBot.token_symbol,
                distributionBot.delay,
                distributionBot.account_friendly_name,
                distributionBot.uuid,
                distributionBot.user_id
            ];
            if (distributionBot.password) {
                sql = 'UPDATE distribution_bots SET name = ?, password = ?, token_symbol = ?, delay = ?, account_friendly_name = ?, updated_at = now() WHERE uuid = ? AND user_id = ?';
                values = [
                    distributionBot.name,
                    distributionBot.password,
                    distributionBot.token_symbol,
                    distributionBot.delay,
                    distributionBot.account_friendly_name,
                    distributionBot.uuid,
                    distributionBot.user_id
                ];
            }
            await (0, db_1.default)(sql, values);
            const distributionBotWalletRepository = new distributionBotWalletRepository_1.DistributionBotWalletRepository();
            await distributionBotWalletRepository.verifyUpdateWallets(distributionBot.uuid, wallets);
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
            const sql = 'UPDATE distribution_bots SET active = ?, updated_at = now() WHERE uuid = ?';
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
    async find(userId, uuid) {
        try {
            const sql = `SELECT * FROM distribution_bots WHERE uuid = ? AND user_id = ?`;
            const values = [uuid, userId];
            const distributionBotRow = await (0, db_1.default)(sql, values);
            const distributionBotData = distributionBotRow[0];
            if (distributionBotData) {
                const distributionBotWalletRepository = new distributionBotWalletRepository_1.DistributionBotWalletRepository();
                distributionBotData.wallets = await distributionBotWalletRepository.listSystem(uuid);
            }
            if (distributionBotData?.account_private_key) {
                distributionBotData.account_private_key = (0, functionsHelper_1.decrypt)(distributionBotData.account_private_key);
            }
            return distributionBotData;
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
      SELECT distribution_bots.*,
      (SELECT COUNT(*) FROM bot_executions WHERE bot_executions.distribution_bot = distribution_bots.id) AS executions,
      COUNT(DISTINCT transactions.id) AS transactions
      FROM distribution_bots
      LEFT JOIN distribution_bot_wallets dbw ON distribution_bots.uuid = dbw.distribution_bot_uuid
      LEFT JOIN transactions ON dbw.id = transactions.distribution_bot_wallet
      WHERE distribution_bots.is_hidden = 0
      ${userId > 0 ? 'AND distribution_bots.user_id = ?' : ''}
      GROUP BY 
      distribution_bots.id,
      distribution_bots.uuid,
      distribution_bots.user_id,
      distribution_bots.name,
      distribution_bots.password,
      distribution_bots.token_symbol,
      distribution_bots.account_private_key,
      distribution_bots.account_friendly_name,
      distribution_bots.delay,
      distribution_bots.active,
      distribution_bots.is_hidden,
      distribution_bots.created_at,
      distribution_bots.updated_at
      ORDER BY distribution_bots.id DESC`;
            const values = [];
            if (userId > 0) {
                values.push(userId);
            }
            const listDistributionBots = await (0, db_1.default)(sql, values);
            const distributionBotWalletRepository = new distributionBotWalletRepository_1.DistributionBotWalletRepository();
            const promises = listDistributionBots.map(async (element) => {
                if (element.account_private_key) {
                    element.account_private_key = (0, functionsHelper_1.decrypt)(element.account_private_key);
                }
                element.wallets = await distributionBotWalletRepository.list(element.uuid);
                return element;
            });
            const list = await Promise.all(promises);
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
    async listHidden(userId) {
        try {
            let sql = `SELECT * FROM distribution_bots WHERE is_hidden = 1 ORDER BY id DESC`;
            const values = [];
            if (userId > 0) {
                sql = `SELECT * FROM distribution_bots WHERE user_id = ? AND is_hidden = 1 ORDER BY id DESC`;
                values.push(userId);
            }
            const listDistributionBots = await (0, db_1.default)(sql, values);
            const distributionBotWalletRepository = new distributionBotWalletRepository_1.DistributionBotWalletRepository();
            const promises = listDistributionBots.map(async (element) => {
                if (element.account_private_key) {
                    element.account_private_key = (0, functionsHelper_1.decrypt)(element.account_private_key);
                }
                element.wallets = await distributionBotWalletRepository.list(element.uuid);
                return element;
            });
            const list = await Promise.all(promises);
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
      FROM distribution_bots 
      WHERE is_hidden = 0 
      AND active = 1`;
            const listDistributionBots = await (0, db_1.default)(sql);
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
    async isRunning(uuid) {
        try {
            const sql = 'SELECT * FROM distribution_bots WHERE uuid = ?';
            const values = [uuid];
            const botRow = await (0, db_1.default)(sql, values);
            const botData = botRow[0];
            return botData.active;
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
            const sql = 'UPDATE distribution_bots SET is_hidden = ?, updated_at = now() WHERE uuid = ?';
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
    async executionsDetails(distributionBotUuid, symbol, startDate, endDate) {
        try {
            let sql = `SELECT 
      (
        SELECT ROUND((SUM(CASE WHEN t.status = 1 THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2)
        FROM transactions t
        LEFT JOIN distribution_bot_wallets dbw ON t.distribution_bot_wallet = dbw.id
        WHERE t.type = 'distribution'
        AND dbw.distribution_bot_uuid = "${distributionBotUuid}"
        ${symbol ? `AND t.symbol_selected_token = "${symbol}"` : ''}
        ${startDate ? `AND t.created_at >= "${startDate}"` : ''}
        ${endDate ? `AND t.created_at <= "${endDate}"` : ''}
      ) AS success_rate,
      (
        SELECT SUM(end_matic)
        FROM transactions t
        LEFT JOIN distribution_bot_wallets dbw ON t.distribution_bot_wallet = dbw.id
        WHERE t.type = 'distribution'
        AND t.symbol_selected_token = 'MATIC'
        AND t.status = 1
        AND dbw.distribution_bot_uuid = "${distributionBotUuid}"
        ${startDate ? `AND t.created_at >= "${startDate}"` : ''}
        ${endDate ? `AND t.created_at <= "${endDate}"` : ''}
      ) AS matic_output,
      (
        SELECT SUM(end_selected_token) 
        FROM transactions t
        LEFT JOIN distribution_bot_wallets dbw ON t.distribution_bot_wallet = dbw.id
        WHERE t.type = 'distribution'
        AND t.symbol_selected_token != 'MATIC'
        AND t.symbol_selected_token != 'WMATIC'
        AND t.status = 1
        AND dbw.distribution_bot_uuid = "${distributionBotUuid}"
        ${symbol ? `AND t.symbol_selected_token = "${symbol}"` : ''}
        ${startDate ? `AND t.created_at >= "${startDate}"` : ''}
        ${endDate ? `AND t.created_at <= "${endDate}"` : ''}
      ) AS selected_token_output,
      (
        SELECT SUM(end_matic) 
        FROM transactions t
        LEFT JOIN distribution_bot_wallets dbw ON t.distribution_bot_wallet = dbw.id
        WHERE t.type = 'distribution'
        AND new_wallet_private_key IS NOT NULL 
        AND dbw.distribution_bot_uuid = "${distributionBotUuid}"
        AND t.status = 0
        ${startDate ? `AND t.created_at >= "${startDate}"` : ''}
        ${endDate ? `AND t.created_at <= "${endDate}"` : ''}
      ) AS matic_fails,
      (
        SELECT SUM(end_selected_token) 
        FROM transactions t
        LEFT JOIN distribution_bot_wallets dbw ON t.distribution_bot_wallet = dbw.id
        WHERE t.type = 'distribution'
        AND dbw.distribution_bot_uuid = "${distributionBotUuid}"
        AND t.status = 0
        ${symbol ? `AND t.symbol_selected_token = "${symbol}"` : ''}
        ${startDate ? `AND t.created_at >= "${startDate}"` : ''}
        ${endDate ? `AND t.created_at <= "${endDate}"` : ''}
      ) AS selected_token_fails
      FROM transactions t
      LEFT JOIN distribution_bot_wallets dbw ON t.distribution_bot_wallet = dbw.id
      WHERE t.type = 'distribution'
      AND dbw.distribution_bot_uuid = "${distributionBotUuid}"
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
    async transactions(distributionBotUuid, executionId, page, symbol, startDate, endDate) {
        try {
            let sql = `SELECT t.*
      FROM transactions t
      LEFT JOIN distribution_bot_wallets dbw ON t.distribution_bot_wallet = dbw.id
      WHERE dbw.distribution_bot_uuid = ?
      AND t.bot_execution = ?`;
            const values = [distributionBotUuid, executionId];
            if (symbol) {
                sql += ` AND t.symbol_selected_token = ?`;
                values.push(symbol);
            }
            if (startDate) {
                sql += ` AND t.created_at >= ?`;
                values.push(startDate);
            }
            if (endDate) {
                sql += ` AND created_at <= ?`;
                values.push(endDate);
            }
            sql += ` ORDER BY t.id DESC LIMIT ? OFFSET ?`;
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
    async transactionsDetails(distributionBotUuid, executionId, symbol, startDate, endDate) {
        try {
            let sql = `SELECT 
      (
        SELECT ROUND((SUM(CASE WHEN t.status = 1 THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2)
        FROM transactions t
        LEFT JOIN distribution_bot_wallets dbw ON t.distribution_bot_wallet = dbw.id
        WHERE t.type = 'distribution'
        AND dbw.distribution_bot_uuid = "${distributionBotUuid}"
        AND t.bot_execution =${executionId}
        ${symbol ? `AND t.symbol_selected_token = "${symbol}"` : ''}
        ${startDate ? `AND t.created_at >= "${startDate}"` : ''}
        ${endDate ? `AND t.created_at <= "${endDate}"` : ''}
      ) AS success_rate,
      (
        SELECT SUM(end_matic)
        FROM transactions t
        LEFT JOIN distribution_bot_wallets dbw ON t.distribution_bot_wallet = dbw.id
        WHERE t.type = 'distribution'
        AND t.symbol_selected_token = 'MATIC'
        AND t.status = 1
        AND dbw.distribution_bot_uuid = "${distributionBotUuid}"
        AND t.bot_execution =${executionId}
        ${startDate ? `AND t.created_at >= "${startDate}"` : ''}
        ${endDate ? `AND t.created_at <= "${endDate}"` : ''}
      ) AS matic_output,
      (
        SELECT SUM(end_selected_token) 
        FROM transactions t
        LEFT JOIN distribution_bot_wallets dbw ON t.distribution_bot_wallet = dbw.id
        WHERE t.type = 'distribution'
        AND t.symbol_selected_token != 'MATIC'
        AND t.symbol_selected_token != 'WMATIC'
        AND t.status = 1
        AND dbw.distribution_bot_uuid = "${distributionBotUuid}"
        AND t.bot_execution =${executionId}
        ${symbol ? `AND t.symbol_selected_token = "${symbol}"` : ''}
        ${startDate ? `AND t.created_at >= "${startDate}"` : ''}
        ${endDate ? `AND t.created_at <= "${endDate}"` : ''}
      ) AS selected_token_output,
      (
        SELECT SUM(end_matic) 
        FROM transactions t
        LEFT JOIN distribution_bot_wallets dbw ON t.distribution_bot_wallet = dbw.id
        WHERE t.type = 'distribution'
        AND new_wallet_private_key IS NOT NULL 
        AND dbw.distribution_bot_uuid = "${distributionBotUuid}"
        AND t.status = 0
        AND t.bot_execution =${executionId}
        ${startDate ? `AND t.created_at >= "${startDate}"` : ''}
        ${endDate ? `AND t.created_at <= "${endDate}"` : ''}
      ) AS matic_fails,
      (
        SELECT SUM(end_selected_token) 
        FROM transactions t
        LEFT JOIN distribution_bot_wallets dbw ON t.distribution_bot_wallet = dbw.id
        WHERE t.type = 'distribution'
        AND dbw.distribution_bot_uuid = "${distributionBotUuid}"
        AND t.status = 0
        AND t.bot_execution =${executionId}
        ${symbol ? `AND t.symbol_selected_token = "${symbol}"` : ''}
        ${startDate ? `AND t.created_at >= "${startDate}"` : ''}
        ${endDate ? `AND t.created_at <= "${endDate}"` : ''}
      ) AS selected_token_fails
      FROM transactions t
      LEFT JOIN distribution_bot_wallets dbw ON t.distribution_bot_wallet = dbw.id
      WHERE t.type = 'distribution'
      AND dbw.distribution_bot_uuid = "${distributionBotUuid}"
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
exports.DistributionBotRepository = DistributionBotRepository;
async function getLastInsert(userId) {
    try {
        const selectSql = 'SELECT * FROM distribution_bots WHERE user_id = ? ORDER BY id DESC LIMIT 1';
        const values = [userId];
        const botRow = await (0, db_1.default)(selectSql, values);
        const botData = botRow[0];
        if (botData.account_private_key) {
            botData.account_private_key = (0, functionsHelper_1.decrypt)(botData.account_private_key);
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
async function verifyPrivateKeyExists(accountPrivateKey) {
    try {
        const sql = `
    SELECT distribution_bots.id
    FROM distribution_bots
    WHERE account_private_key = ?
  `;
        const values = [accountPrivateKey];
        const distributionBotRow = await (0, db_1.default)(sql, values);
        const distributionBotData = distributionBotRow[0];
        if (distributionBotData?.account_private_key) {
            distributionBotData.account_private_key = (0, functionsHelper_1.decrypt)(distributionBotData.account_private_key);
        }
        return distributionBotData;
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
//# sourceMappingURL=distributionBotRepository.js.map