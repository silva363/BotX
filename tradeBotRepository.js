"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TradeBotRepository = void 0;
const functionsHelper_1 = require("../helpers/functionsHelper");
const settings_1 = require("../utils/settings");
const ethersHelper_1 = require("../helpers/ethersHelper");
const ethers_1 = require("ethers");
const db_1 = __importDefault(require("../utils/db"));
class TradeBotRepository {
    async create(tradeBot) {
        try {
            await (0, ethersHelper_1.getSigner)(tradeBot.account_private_key);
            const encryptPrivateKey = (0, functionsHelper_1.encrypt)(tradeBot.account_private_key);
            if (await verifyPrivateKeyExists(encryptPrivateKey)) {
                throw "This account private key already exists";
            }
            const encryptHelperPrivateKey = (0, functionsHelper_1.encrypt)(tradeBot.helper_private_key);
            const sql = `
        INSERT INTO trade_bots (
        uuid, 
        user_id, 
        name, 
        helper_private_key,
        account_private_key,
        account_friendly_name,
        destiny_address,
        destiny_friendly_name,
        token_name,
        token_symbol,
        token_address,
        target_price,
        min_amount,
        max_amount,
        min_delay, 
        max_delay, 
        target_balance,
        holder_percent,
        slippage_tolerance, 
        delay_to_start,
        strategy, 
        cycles,
        cycle_delay,
        cycle_ghosts,
        work_start,
        work_end,
        airdrop_time,
        mode,
        max_queue
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? , ?, ?, ?, ?, ?, ?, ?, ?)
      `;
            const values = [
                tradeBot.uuid,
                tradeBot.user_id,
                tradeBot.name,
                encryptHelperPrivateKey,
                encryptPrivateKey,
                tradeBot.account_friendly_name,
                tradeBot.destiny_address,
                tradeBot.destiny_friendly_name,
                tradeBot.token_name,
                tradeBot.token_symbol,
                tradeBot.token_address,
                tradeBot.target_price,
                tradeBot.min_amount,
                tradeBot.max_amount,
                tradeBot.min_delay,
                tradeBot.max_delay,
                tradeBot.target_balance,
                tradeBot.holder_percent,
                tradeBot.slippage_tolerance,
                tradeBot.delay_to_start,
                tradeBot.strategy.toLowerCase(),
                tradeBot.cycles,
                tradeBot.cycle_delay,
                tradeBot.cycle_ghosts,
                tradeBot.work_start,
                tradeBot.work_end,
                tradeBot.airdrop_time,
                tradeBot.mode,
                tradeBot.max_queue
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
    async update(tradeBot) {
        try {
            const sql = `
        UPDATE trade_bots SET 
        name = ?, 
        account_friendly_name = ?, 
        destiny_address = ?, 
        destiny_friendly_name = ?, 
        token_name = ?, 
        token_symbol = ?, 
        token_address = ?, 
        target_price = ?, 
        min_amount = ?, 
        max_amount = ?, 
        min_delay = ?, 
        max_delay = ?, 
        target_balance = ?, 
        holder_percent = ?, 
        slippage_tolerance = ?, 
        delay_to_start = ?, 
        cycles = ?, 
        cycle_delay = ?, 
        cycle_ghosts = ?, 
        work_start = ?, 
        work_end = ?, 
        airdrop_time = ?, 
        mode = ?,
        max_queue = ?,
        updated_at = now() 
        WHERE uuid = ?
      `;
            const values = [
                tradeBot.name,
                tradeBot.account_friendly_name,
                tradeBot.destiny_address,
                tradeBot.destiny_friendly_name,
                tradeBot.token_name,
                tradeBot.token_symbol,
                tradeBot.token_address,
                tradeBot.target_price,
                tradeBot.min_amount,
                tradeBot.max_amount,
                tradeBot.min_delay,
                tradeBot.max_delay,
                tradeBot.target_balance,
                tradeBot.holder_percent,
                tradeBot.slippage_tolerance,
                tradeBot.delay_to_start,
                tradeBot.cycles,
                tradeBot.cycle_delay,
                tradeBot.cycle_ghosts,
                tradeBot.work_start,
                tradeBot.work_end,
                tradeBot.airdrop_time,
                tradeBot.mode,
                tradeBot.max_queue,
                tradeBot.uuid
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
            const sql = 'UPDATE trade_bots SET active = ?, updated_at = now() WHERE uuid = ?';
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
    async updateSpentBalance(id, spentBalance) {
        try {
            const sql = 'UPDATE trade_bots SET spent_balance = spent_balance + ?, updated_at = now() WHERE id = ?';
            const values = [
                ethers_1.ethers.formatEther(spentBalance),
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
    async isRunning(uuid) {
        try {
            const sql = 'SELECT * FROM trade_bots WHERE uuid = ?';
            const values = [uuid];
            const tradeBotData = await (0, db_1.default)(sql, values);
            return tradeBotData[0].active;
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
      SELECT * FROM trade_bots WHERE uuid = ? AND user_id = ? ORDER BY id DESC LIMIT 1`;
            const values = [uuid, userId];
            const tradeBotRow = await (0, db_1.default)(sql, values);
            const tradeBotData = tradeBotRow[0];
            if (!tradeBotData) {
                throw "Bot not find";
            }
            if (tradeBotData?.account_private_key) {
                tradeBotData.account_private_key = (0, functionsHelper_1.decrypt)(tradeBotData.account_private_key);
            }
            if (tradeBotData?.helper_private_key) {
                tradeBotData.helper_private_key = (0, functionsHelper_1.decrypt)(tradeBotData.helper_private_key);
            }
            return tradeBotData;
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
    async findActives() {
        try {
            const sql = `
      SELECT * FROM trade_bots
      WHERE active = 1
      `;
            const listBots = await (0, db_1.default)(sql, []);
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
    async list(strategy = '', userId, isHidden = false) {
        try {
            let values = [];
            let sql = `
      SELECT trade_bots.*, 
      0 AS executions,
      0 AS transactions
      FROM trade_bots
      WHERE trade_bots.is_hidden = ${isHidden}
      ${userId > 0 ? 'AND trade_bots.user_id = ?' : ''}
      ${strategy ? 'AND trade_bots.strategy = ?' : ''}
      ORDER BY trade_bots.id DESC `;
            if (userId > 0) {
                values.push(userId);
            }
            if (strategy) {
                values.push(strategy.toLowerCase());
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
    async listToRestart() {
        try {
            let values = [];
            let sql = `
      SELECT *
      FROM trade_bots
      WHERE trade_bots.is_hidden = 0
      AND trade_bots.active = 1
      ORDER BY id DESC
      `;
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
    async listPendingToStart() {
        try {
            let values = [];
            let sql = `
      SELECT trade_bots.user_id, trade_bots.uuid, trade_bots.strategy, 
      bot_executions.id AS execution_id, trade_bot_flows.flow, trade_bot_flows.actual_cycle, trade_bot_flows.id AS flow_id
      FROM trade_bots
      LEFT JOIN bot_executions ON bot_executions.trade_bot = trade_bots.id
      LEFT JOIN trade_bot_flows ON trade_bot_flows.trade_bot = trade_bots.id AND trade_bot_flows.bot_execution = bot_executions.id 
      WHERE trade_bots.is_hidden = 0
      AND bot_executions.active IN (1,2)
      GROUP BY trade_bots.uuid, trade_bots.user_id, execution_id, flow_id, trade_bot_flows.flow, trade_bot_flows.actual_cycle`;
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
    async reRunGetLastTransactions(botExecutionId, flowId, botId, txLimit) {
        try {
            const sql = `
      SELECT *
      FROM transactions
      LEFT JOIN trade_bot_flows tbf ON tbf.trade_bot = transactions.trade_bot 
      AND tbf.bot_execution = transactions.bot_execution
      WHERE transactions.bot_execution = ${botExecutionId} 
      AND transactions.trade_bot = ${botId} 
      AND tbf.id = ${flowId}
      ORDER BY transactions.id DESC
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
    async changeHidden(uuid, active) {
        try {
            const sql = 'UPDATE trade_bots SET is_hidden = ?, updated_at = now() WHERE uuid = ?';
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
        AND trade_bot = ${id}
        ${symbol ? `AND t.symbol_selected_token = "${symbol}"` : ''}
        ${startDate ? `AND t.created_at >= "${startDate}"` : ''}
        ${endDate ? `AND t.created_at <= "${endDate}"` : ''}
      ) AS success_rate,
      (
        SELECT SUM(end_matic)
        FROM transactions t
        WHERE type = 'transfer'
        AND symbol_selected_token = 'MATIC'
        AND status = 1
        AND trade_bot = ${id}
        ${startDate ? `AND t.created_at >= "${startDate}"` : ''}
        ${endDate ? `AND t.created_at <= "${endDate}"` : ''}
      ) AS matic_output,
      (
        SELECT SUM(end_selected_token) 
        FROM transactions t
        WHERE type = 'transfer'
        AND symbol_selected_token != 'MATIC'
        AND symbol_selected_token != 'WMATIC'
        AND status = 1
        AND trade_bot = ${id}
        ${symbol ? `AND t.symbol_selected_token = "${symbol}"` : ''}
        ${startDate ? `AND t.created_at >= "${startDate}"` : ''}
        ${endDate ? `AND t.created_at <= "${endDate}"` : ''}
      ) AS selected_token_output,
      (
        SELECT SUM(start_selected_token) - SUM(end_selected_token)
        FROM transactions t
        WHERE type = 'destiny'
        AND (symbol_selected_token = 'MATIC' OR symbol_selected_token = 'WMATIC')
        AND status = 1
        AND trade_bot = ${id}
        ${startDate ? `AND t.created_at >= "${startDate}"` : ''}
        ${endDate ? `AND t.created_at <= "${endDate}"` : ''}
      ) AS matic_input,
      (
        SELECT SUM(start_selected_token) - SUM(end_selected_token)
        FROM transactions t
        WHERE type = 'destiny'
        AND symbol_selected_token != 'MATIC'
        AND symbol_selected_token != 'WMATIC'
        AND status = 1
        AND trade_bot = ${id}
        ${symbol ? `AND t.symbol_selected_token = "${symbol}"` : ''}
        ${startDate ? `AND t.created_at >= "${startDate}"` : ''}
        ${endDate ? `AND t.created_at <= "${endDate}"` : ''}
      ) AS selected_token_input,
      (
        ${!symbol ? `SELECT FORMAT(COUNT(id) / 2, 0)` : 'SELECT FORMAT(COUNT(id), 0)'}
        FROM transactions t
        WHERE type = 'transfer'
        AND trade_bot = ${id}
        AND status = 1
        ${symbol ? `AND t.symbol_selected_token = "${symbol}"` : ''}
        ${startDate ? `AND t.created_at >= "${startDate}"` : ''}
        ${endDate ? `AND t.created_at <= "${endDate}"` : ''}
      ) AS ghost_wallets,
      (
        SELECT SUM(end_matic) FROM transactions t
        WHERE type != 'airdrop' 
        AND new_wallet_private_key IS NOT NULL 
        AND trade_bot = ${id}
        AND status = 1
        ${startDate ? `AND t.created_at >= "${startDate}"` : ''}
        ${endDate ? `AND t.created_at <= "${endDate}"` : ''}
      ) AS matic_success,
      (
        SELECT SUM(end_matic) FROM transactions t
        WHERE type != 'airdrop' 
        AND new_wallet_private_key IS NOT NULL 
        AND trade_bot = ${id}
        AND status = 0
        ${startDate ? `AND t.created_at >= "${startDate}"` : ''}
        ${endDate ? `AND t.created_at <= "${endDate}"` : ''}
      ) AS matic_fails,
      (
        SELECT SUM(end_selected_token) FROM transactions t
        WHERE type != 'airdrop' 
        AND new_wallet_private_key IS NOT NULL 
        AND trade_bot = ${id}
        AND status = 1
        ${symbol ? `AND t.symbol_selected_token = "${symbol}"` : ''}
        ${startDate ? `AND t.created_at >= "${startDate}"` : ''}
        ${endDate ? `AND t.created_at <= "${endDate}"` : ''}
      ) AS selected_token_success,
      (
        SELECT SUM(end_selected_token) FROM transactions t
        WHERE type != 'airdrop' 
        AND new_wallet_private_key IS NOT NULL 
        AND trade_bot = ${id}
        AND status = 0
        ${symbol ? `AND t.symbol_selected_token = "${symbol}"` : ''}
        ${startDate ? `AND t.created_at >= "${startDate}"` : ''}
        ${endDate ? `AND t.created_at <= "${endDate}"` : ''}
      ) AS selected_token_fails,
      (
        SELECT SUM(end_matic) FROM transactions t
        WHERE type != 'airdrop' 
        AND new_wallet_private_key IS NOT NULL 
        AND trade_bot = ${id}
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
        AND trade_bot = ${id}
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
      LEFT JOIN trade_bots ON transactions.trade_bot = trade_bots.id
      WHERE transactions.type != 'airdrop' 
      AND transactions.new_wallet_private_key IS NOT NULL 
      AND transactions.trade_bot = ${id}
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
      WHERE trade_bot = ? 
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
        AND trade_bot = ${id}
        AND bot_execution =${executionId}
        ${symbol ? `AND t.symbol_selected_token = "${symbol}"` : ''}
        ${startDate ? `AND t.created_at >= "${startDate}"` : ''}
        ${endDate ? `AND t.created_at <= "${endDate}"` : ''}
      ) AS success_rate,
      (
        SELECT SUM(end_matic)
        FROM transactions t
        WHERE type = 'transfer'
        AND symbol_selected_token = 'MATIC'
        AND status = 1
        AND trade_bot = ${id}
        AND bot_execution =${executionId}
        ${startDate ? `AND t.created_at >= "${startDate}"` : ''}
        ${endDate ? `AND t.created_at <= "${endDate}"` : ''}
      ) AS matic_output,
      (
        SELECT SUM(end_selected_token) 
        FROM transactions t
        WHERE type = 'transfer'
        AND symbol_selected_token != 'MATIC'
        AND symbol_selected_token != 'WMATIC'
        AND status = 1
        AND trade_bot = ${id}
        AND bot_execution =${executionId}
        ${symbol ? `AND t.symbol_selected_token = "${symbol}"` : ''}
        ${startDate ? `AND t.created_at >= "${startDate}"` : ''}
        ${endDate ? `AND t.created_at <= "${endDate}"` : ''}
      ) AS selected_token_output,
      (
        SELECT SUM(start_selected_token) - SUM(end_selected_token)
        FROM transactions t
        WHERE type = 'destiny'
        AND (symbol_selected_token = 'MATIC' OR symbol_selected_token = 'WMATIC')
        AND status = 1
        AND trade_bot = ${id}
        AND bot_execution =${executionId}
        ${startDate ? `AND t.created_at >= "${startDate}"` : ''}
        ${endDate ? `AND t.created_at <= "${endDate}"` : ''}
      ) AS matic_input,
      (
        SELECT SUM(start_selected_token) - SUM(end_selected_token)
        FROM transactions t
        WHERE type = 'destiny'
        AND symbol_selected_token != 'MATIC'
        AND symbol_selected_token != 'WMATIC'
        AND status = 1
        AND trade_bot = ${id}
        AND bot_execution =${executionId}
        ${symbol ? `AND t.symbol_selected_token = "${symbol}"` : ''}
        ${startDate ? `AND t.created_at >= "${startDate}"` : ''}
        ${endDate ? `AND t.created_at <= "${endDate}"` : ''}
      ) AS selected_token_input,
      (
        
        ${!symbol ? `SELECT FORMAT(COUNT(id) / 2, 0)` : 'SELECT FORMAT(COUNT(id), 0)'}
        FROM transactions t
        WHERE type = 'transfer'
        AND trade_bot = ${id}
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
        AND trade_bot = ${id}
        AND bot_execution =${executionId}
        AND status = 1
        ${startDate ? `AND t.created_at >= "${startDate}"` : ''}
        ${endDate ? `AND t.created_at <= "${endDate}"` : ''}
      ) AS matic_success,
      (
        SELECT SUM(end_matic) FROM transactions t
        WHERE type != 'airdrop' 
        AND new_wallet_private_key IS NOT NULL 
        AND trade_bot = ${id}
        AND bot_execution =${executionId}
        AND status = 0
        ${startDate ? `AND t.created_at >= "${startDate}"` : ''}
        ${endDate ? `AND t.created_at <= "${endDate}"` : ''}
      ) AS matic_fails,
      (
        SELECT SUM(end_selected_token) FROM transactions t
        WHERE type != 'airdrop' 
        AND new_wallet_private_key IS NOT NULL 
        AND trade_bot = ${id}
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
        AND trade_bot = ${id}
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
        AND trade_bot = ${id}
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
        AND trade_bot = ${id}
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
      LEFT JOIN trade_bots ON t.trade_bot = trade_bots.id
      WHERE t.type != 'airdrop' 
      AND t.new_wallet_private_key IS NOT NULL 
      AND t.trade_bot = ${id}
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
exports.TradeBotRepository = TradeBotRepository;
async function verifyPrivateKeyExists(accountPrivateKey) {
    try {
        const sql = `
    SELECT id
    FROM trade_bots
    WHERE account_private_key = ?
    `;
        const values = [accountPrivateKey];
        const botRow = await (0, db_1.default)(sql, values);
        const botData = botRow[0];
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
//# sourceMappingURL=tradeBotRepository.js.map