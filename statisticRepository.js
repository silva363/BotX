"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatisticRepository = void 0;
const db_1 = __importDefault(require("../utils/db"));
class StatisticRepository {
    async find(tokenSymbol, userId) {
        try {
            const verifyOld = true;
            let startId = ' AND transactions.id > 1916';
            if (verifyOld) {
                startId = '';
            }
            let selectSql = `
      SELECT 
      'ALL' AS symbol,
      COUNT(transactions.id) AS transactions,
      COUNT(DISTINCT bots.id) AS bots,
      COUNT(DISTINCT CASE WHEN bots.active = 1 THEN bots.id END) AS bot_actives,
      COUNT(DISTINCT CASE WHEN bots.active = 0 THEN bots.id END) AS bot_inactives,
      SUM(CASE WHEN transactions.status = 1 THEN transactions.end_matic ELSE 0 END) AS matic_success,
      SUM(CASE WHEN transactions.status = 0 THEN transactions.end_matic ELSE 0 END) AS matic_fails,
      SUM(CASE WHEN transactions.status = 1 THEN transactions.end_selected_token ELSE 0 END) AS selected_token_success,
      SUM(CASE WHEN transactions.status = 0 THEN transactions.end_selected_token ELSE 0 END) AS selected_token_fails,
      SUM(CASE WHEN transactions.status = 0 AND airdrop_status = 0 THEN transactions.end_matic ELSE 0 END) AS matic_pending,
      SUM(CASE WHEN transactions.status = 0 AND airdrop_status = 0 THEN transactions.end_selected_token ELSE 0 END) AS selected_token_pending,
      COUNT(CASE WHEN transactions.type = 'airdrop' THEN transactions.id END) AS airdrops,
      COUNT(CASE WHEN transactions.type = 'airdrop' AND transactions.airdrop_status = 1 THEN transactions.id END) AS airdrop_success,
      COUNT(CASE WHEN transactions.type = 'airdrop' AND transactions.airdrop_status = 0 THEN transactions.id END) AS airdrop_fails,
      (SELECT COUNT(id) FROM accepted_tokens) AS accepted_tokens
      FROM bots
      LEFT JOIN bot_addresses ON bots.uuid = bot_addresses.bot_uuid
      LEFT JOIN transactions ON bot_addresses.id = transactions.bot_address
      WHERE bots.user_id = ? ${startId}
      `;
            let values = [userId];
            if (tokenSymbol) {
                tokenSymbol = tokenSymbol.toUpperCase();
                selectSql = `
        SELECT
        ? AS symbol,
        COUNT(transactions.id) AS transactions,
        COUNT(DISTINCT bots.id) AS bots,
        COUNT(DISTINCT CASE WHEN bots.active = 1 THEN bots.id END) AS bot_actives,
        COUNT(DISTINCT CASE WHEN bots.active = 0 THEN bots.id END) AS bot_inactives,
        SUM(CASE WHEN transactions.status = 1 THEN transactions.end_matic ELSE 0 END) AS matic_success,
        SUM(CASE WHEN transactions.status = 0 THEN transactions.end_matic ELSE 0 END) AS matic_fails,
        SUM(CASE WHEN transactions.status = 1 THEN transactions.end_selected_token ELSE 0 END) AS selected_token_success,
        SUM(CASE WHEN transactions.status = 0 THEN transactions.end_selected_token ELSE 0 END) AS selected_token_fails,
        SUM(CASE WHEN transactions.status = 0 AND airdrop_status = 0 THEN transactions.end_matic ELSE 0 END) AS matic_pending,
        SUM(CASE WHEN transactions.status = 0 AND airdrop_status = 0 THEN transactions.end_selected_token ELSE 0 END) AS selected_token_pending,
        COUNT(CASE WHEN transactions.type = 'airdrop' THEN transactions.id END) AS airdrops,
        COUNT(CASE WHEN transactions.type = 'airdrop' AND transactions.airdrop_status = 1 THEN transactions.id END) AS airdrop_success,
        COUNT(CASE WHEN transactions.type = 'airdrop' AND transactions.airdrop_status = 0 THEN transactions.id END) AS airdrop_fails,
        (SELECT COUNT(id) FROM accepted_tokens WHERE symbol = ?) AS accepted_tokens
        FROM bots
        LEFT JOIN bot_addresses ON bots.uuid = bot_addresses.bot_uuid
        LEFT JOIN transactions ON bot_addresses.id = transactions.bot_address
        WHERE bots.user_id = ?
        AND transactions.symbol_selected_token = ? ${startId}
        `;
                values = [tokenSymbol, tokenSymbol, userId, tokenSymbol];
            }
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
}
exports.StatisticRepository = StatisticRepository;
//# sourceMappingURL=statisticRepository.js.map