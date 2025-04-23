import { ethers } from 'ethers';
import { decrypt, encrypt, setPage } from '../helpers/functionsHelper';
import { BotAddress } from '../models/BotAddress';
import { Transaction } from '../models/Transaction';
import doQuery from '../utils/db';
import { settings } from '../utils/settings';
import { getSigner } from '../helpers/ethersHelper';

export class BotAddressRepository {
  async create(botAddress: BotAddress, type: string): Promise<BotAddress> {
    try {
      await getSigner(botAddress.account_private_key);

      const encryptPrivateKey = encrypt(botAddress.account_private_key);

      if (await verifyPrivateKeyExists(encryptPrivateKey)) {
        throw "This account private key already exists";
      }

      const sql = 'INSERT INTO bot_addresses (bot_uuid, account_private_key, token_name, token_symbol, token_address, destiny_address, airdrop_time, friendly_name, destiny_friendly_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
      const values = [
        botAddress.bot_uuid,
        encryptPrivateKey,
        botAddress.token_name,
        botAddress.token_symbol,
        botAddress.token_address,
        botAddress.destiny_address,
        botAddress.airdrop_time,
        botAddress.friendly_name,
        botAddress.destiny_friendly_name
      ];

      const botRow: BotAddress | any = await doQuery(sql, values);
      const botCreated: BotAddress = botRow[0];

      if (botCreated) {
        throw "Create bot fail";
      }

      const botData = await getLastInsert(botAddress.bot_uuid);

      return botData;
    } catch (err) {
      if (err instanceof Error) {
        console.log('SQL error', err.message);
        throw err.message;
      } else {
        console.log('SQL error', err);
        throw err;
      }
    }
  }

  async update(botAddress: BotAddress): Promise<BotAddress | null> {
    try {
      const sql = 'UPDATE bot_addresses SET destiny_address = ?, airdrop_time = ?, friendly_name = ?, destiny_friendly_name = ?, token_name = ?, token_symbol = ?, token_address = ?, updated_at = now() WHERE id = ?';
      const values = [
        botAddress.destiny_address,
        botAddress.airdrop_time,
        botAddress.friendly_name,
        botAddress.destiny_friendly_name,
        botAddress.token_name,
        botAddress.token_symbol,
        botAddress.token_address,
        botAddress.id
      ];

      const botRow: any = await doQuery(sql, values);

      if (botRow.affectedRows == 0) {
        throw "Update bot fail";
      }

      return await this.find(botAddress.id);
    } catch (err) {
      if (err instanceof Error) {
        console.log('SQL error', err.message);
        throw err.message;
      } else {
        console.log('SQL error', err);
        throw err;
      }
    }
  }

  async updateSpentBalance(botAddressId: number, spentBalance: bigint): Promise<void> {
    try {
      const sql = 'UPDATE bot_addresses SET spent_balance = spent_balance + ?, updated_at = now() WHERE id = ?';
      const values = [
        ethers.formatEther(spentBalance),
        botAddressId
      ];

      await doQuery(sql, values);
    } catch (err) {
      if (err instanceof Error) {
        console.log('SQL error', err.message);
        throw err.message;
      } else {
        console.log('SQL error', err);
        throw err;
      }
    }
  }

  async setInactive(botAddressId: number): Promise<void> {
    try {
      const sql = 'UPDATE bot_addresses SET active = 0, updated_at = now() WHERE id = ?';
      const values = [botAddressId];

      await doQuery(sql, values);
    } catch (err) {
      if (err instanceof Error) {
        console.log('SQL error', err.message);
        throw err.message;
      } else {
        console.log('SQL error', err);
        throw err;
      }
    }
  }

  async find(id: number): Promise<BotAddress | null> {
    try {
      const selectSql = 'SELECT * FROM bot_addresses WHERE id = ?';
      const values = [id];

      const botRow: BotAddress | any = await doQuery(selectSql, values);
      const botData: BotAddress = botRow[0];

      if (!botData) {
        throw "Bot address not find";
      }

      if (botData && botData.account_private_key) {
        botData.account_private_key = decrypt(botData.account_private_key);
      }

      return botData;
    } catch (err) {
      if (err instanceof Error) {
        console.log('SQL error', err.message);
        throw err.message;
      } else {
        console.log('SQL error', err);
        throw err;
      }
    }
  }

  async findActive(id: number): Promise<BotAddress> {
    try {
      const selectSql = `SELECT * FROM bot_addresses WHERE id = ? AND active = 1`;
      const values = [id];

      const botRow: BotAddress | any = await doQuery(selectSql, values);
      const botData: BotAddress = botRow[0];

      if (botData.account_private_key) {
        botData.account_private_key = decrypt(botData.account_private_key);
      }

      return botData;
    } catch (err) {
      if (err instanceof Error) {
        console.log('SQL error', err.message);
        throw err.message;
      } else {
        console.log('SQL error', err);
        throw err;
      }
    }
  }

  async list(uuid: string): Promise<BotAddress[]> {
    try {
      const sql = `SELECT * FROM bot_addresses WHERE bot_uuid = ? ORDER BY id DESC`;
      const values = [uuid];

      const listBotAddresses: BotAddress[] | any = await doQuery(sql, values);

      listBotAddresses.forEach((element: BotAddress) => {
        if (element.account_private_key) {
          element.account_private_key = decrypt(element.account_private_key);
        }
      });

      return listBotAddresses;
    } catch (err) {
      if (err instanceof Error) {
        console.log('SQL error', err.message);
        throw err.message;
      } else {
        console.log('SQL error', err);
        throw err;
      }
    }
  }

  async executionsDetails(id: number, symbol: string, startDate: string, endDate: string): Promise<Transaction> {
    try {
      let sql = `SELECT 
      COUNT(transactions.id) AS quantity, 
      SUM(transactions.end_matic) AS total_matic, 
      SUM(transactions.end_selected_token) AS total_selected_token, 
      SUM(transactions.status) AS transaction_success, 
      (COUNT(transactions.id) - SUM(transactions.status)) AS transaction_fails, 
      SUM(transactions.airdrop_status) AS airdrop_success, 
      (COUNT(transactions.id) - SUM(transactions.airdrop_status)) AS airdrop_fails,
      bots.active_airdrop,
      (
        SELECT ROUND((SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2)
        FROM transactions t
        WHERE type != 'airdrop'
        AND bot_address = ${id}
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
        AND bot_address = ${id}
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
        AND bot_address = ${id}
        ${symbol ? `AND t.symbol_selected_token = "${symbol}"` : ''}
        ${startDate ? `AND t.created_at >= "${startDate}"` : ''}
        ${endDate ? `AND t.created_at <= "${endDate}"` : ''}
      ) AS selected_token_output,
      (
        SELECT SUM(start_selected_token) - SUM(end_selected_token)
        FROM transactions t
        WHERE (type = 'transfer_destiny_sell' OR type = 'transfer_destiny_buy' OR type = 'airdrop')
        AND (symbol_selected_token = 'MATIC' OR symbol_selected_token = 'WMATIC')
        AND status = 1
        AND bot_address = ${id}
        ${startDate ? `AND t.created_at >= "${startDate}"` : ''}
        ${endDate ? `AND t.created_at <= "${endDate}"` : ''}
      ) AS matic_input,
      (
        SELECT SUM(start_selected_token) - SUM(end_selected_token)
        FROM transactions t
        WHERE (type = 'transfer_destiny_sell' OR type = 'transfer_destiny_buy')
        AND symbol_selected_token != 'MATIC'
        AND symbol_selected_token != 'WMATIC'
        AND status = 1
        AND bot_address = ${id}
        ${symbol ? `AND t.symbol_selected_token = "${symbol}"` : ''}
        ${startDate ? `AND t.created_at >= "${startDate}"` : ''}
        ${endDate ? `AND t.created_at <= "${endDate}"` : ''}
      ) AS selected_token_input,
      (
        SELECT COUNT(id)
        FROM transactions t
        WHERE (type = 'swap_sell' OR type = 'swap_buy')
        AND bot_address = ${id}
        ${symbol ? `AND t.symbol_selected_token = "${symbol}"` : ''}
        ${startDate ? `AND t.created_at >= "${startDate}"` : ''}
        ${endDate ? `AND t.created_at <= "${endDate}"` : ''}
      ) AS ghost_wallets,
      (
        SELECT SUM(end_matic) FROM transactions t
        WHERE type != 'airdrop' 
        AND new_wallet_private_key IS NOT NULL 
        AND bot_address = ${id}
        AND status = 1
        ${startDate ? `AND t.created_at >= "${startDate}"` : ''}
        ${endDate ? `AND t.created_at <= "${endDate}"` : ''}
      ) AS matic_success,
      (
        SELECT SUM(end_matic) FROM transactions t
        WHERE type != 'airdrop' 
        AND new_wallet_private_key IS NOT NULL 
        AND bot_address = ${id}
        AND status = 0
        ${startDate ? `AND t.created_at >= "${startDate}"` : ''}
        ${endDate ? `AND t.created_at <= "${endDate}"` : ''}
      ) AS matic_fails,
      (
        SELECT SUM(end_selected_token) FROM transactions t
        WHERE type != 'airdrop' 
        AND new_wallet_private_key IS NOT NULL 
        AND bot_address = ${id}
        AND status = 1
        ${symbol ? `AND t.symbol_selected_token = "${symbol}"` : ''}
        ${startDate ? `AND t.created_at >= "${startDate}"` : ''}
        ${endDate ? `AND t.created_at <= "${endDate}"` : ''}
      ) AS selected_token_success,
      (
        SELECT SUM(end_selected_token) FROM transactions t
        WHERE type != 'airdrop' 
        AND new_wallet_private_key IS NOT NULL 
        AND bot_address = ${id}
        AND status = 0
        ${symbol ? `AND t.symbol_selected_token = "${symbol}"` : ''}
        ${startDate ? `AND t.created_at >= "${startDate}"` : ''}
        ${endDate ? `AND t.created_at <= "${endDate}"` : ''}
      ) AS selected_token_fails,
      (
        SELECT SUM(end_matic) FROM transactions t
        WHERE type != 'airdrop' 
        AND new_wallet_private_key IS NOT NULL 
        AND bot_address = ${id}
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
        AND bot_address = ${id}
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
      LEFT JOIN bots ON transactions.bot_address = bots.bot_address
      WHERE transactions.type != 'airdrop' 
      AND transactions.new_wallet_private_key IS NOT NULL 
      AND transactions.bot_address = ${id}
      ${symbol ? `AND transactions.symbol_selected_token = "${symbol}"` : ''}
      ${startDate ? `AND transactions.created_at >= "${startDate}"` : ''}
      ${endDate ? `AND transactions.created_at <= "${endDate}"` : ''}
      `;

      const values: any[] = [];

      const details: Transaction | any = await doQuery(sql, values);

      return details[0];
    } catch (err) {
      if (err instanceof Error) {
        console.log('SQL error', err.message);
        throw err.message;
      } else {
        console.log('SQL error', err);
        throw err;
      }
    }
  }

  async transactions(id: number, page: number, symbol: string, startDate: string, endDate: string): Promise<Transaction[]> {
    try {
      let sql = `SELECT *
      FROM transactions 
      WHERE bot_address = ? 
      AND type != 'airdrop'`;

      const values: any[] = [id];

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
      values.push(settings.PAGE_SIZE, setPage(page));

      const listDistributionBotWallets: Transaction[] | any = await doQuery(sql, values);

      return listDistributionBotWallets;
    } catch (err) {
      if (err instanceof Error) {
        console.log('SQL error', err.message);
        throw err.message;
      } else {
        console.log('SQL error', err);
        throw err;
      }
    }
  }

  async transactionsDetails(id: number, symbol: string, startDate: string, endDate: string): Promise<Transaction> {
    try {
      let sql = `SELECT 
      COUNT(transactions.id) AS quantity, 
      SUM(transactions.end_matic) AS total_matic, 
      SUM(transactions.end_selected_token) AS total_selected_token, 
      SUM(transactions.status) AS transaction_success, 
      (COUNT(transactions.id) - SUM(transactions.status)) AS transaction_fails, 
      SUM(transactions.airdrop_status) AS airdrop_success, 
      (COUNT(transactions.id) - SUM(transactions.airdrop_status)) AS airdrop_fails,
      bots.active_airdrop,
      (
        SELECT ROUND((SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2)
        FROM transactions t
        WHERE type != 'airdrop'
        AND bot_address = ${id}
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
        AND bot_address = ${id}
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
        AND bot_address = ${id}
        ${symbol ? `AND t.symbol_selected_token = "${symbol}"` : ''}
        ${startDate ? `AND t.created_at >= "${startDate}"` : ''}
        ${endDate ? `AND t.created_at <= "${endDate}"` : ''}
      ) AS selected_token_output,
      (
        SELECT SUM(start_selected_token) - SUM(end_selected_token)
        FROM transactions t
        WHERE (type = 'transfer_destiny_sell' OR type = 'transfer_destiny_buy' OR type = 'airdrop')
        AND (symbol_selected_token = 'MATIC' OR symbol_selected_token = 'WMATIC')
        AND status = 1
        AND bot_address = ${id}
        ${startDate ? `AND t.created_at >= "${startDate}"` : ''}
        ${endDate ? `AND t.created_at <= "${endDate}"` : ''}
      ) AS matic_input,
      (
        SELECT SUM(start_selected_token) - SUM(end_selected_token)
        FROM transactions t
        WHERE (type = 'transfer_destiny_sell' OR type = 'transfer_destiny_buy')
        AND symbol_selected_token != 'MATIC'
        AND symbol_selected_token != 'WMATIC'
        AND status = 1
        AND bot_address = ${id}
        ${symbol ? `AND t.symbol_selected_token = "${symbol}"` : ''}
        ${startDate ? `AND t.created_at >= "${startDate}"` : ''}
        ${endDate ? `AND t.created_at <= "${endDate}"` : ''}
      ) AS selected_token_input,
      (
        SELECT COUNT(id)
        FROM transactions t
        WHERE (type = 'swap_sell' OR type = 'swap_buy')
        AND bot_address = ${id}
        ${symbol ? `AND t.symbol_selected_token = "${symbol}"` : ''}
        ${startDate ? `AND t.created_at >= "${startDate}"` : ''}
        ${endDate ? `AND t.created_at <= "${endDate}"` : ''}
      ) AS ghost_wallets,
      (
        SELECT SUM(end_matic) FROM transactions t
        WHERE type != 'airdrop' 
        AND new_wallet_private_key IS NOT NULL 
        AND bot_address = ${id}
        AND status = 1
        ${startDate ? `AND t.created_at >= "${startDate}"` : ''}
        ${endDate ? `AND t.created_at <= "${endDate}"` : ''}
      ) AS matic_success,
      (
        SELECT SUM(end_matic) FROM transactions t
        WHERE type != 'airdrop' 
        AND new_wallet_private_key IS NOT NULL 
        AND bot_address = ${id}
        AND status = 0
        ${startDate ? `AND t.created_at >= "${startDate}"` : ''}
        ${endDate ? `AND t.created_at <= "${endDate}"` : ''}
      ) AS matic_fails,
      (
        SELECT SUM(end_selected_token) FROM transactions t
        WHERE type != 'airdrop' 
        AND new_wallet_private_key IS NOT NULL 
        AND bot_address = ${id}
        AND status = 1
        ${symbol ? `AND t.symbol_selected_token = "${symbol}"` : ''}
        ${startDate ? `AND t.created_at >= "${startDate}"` : ''}
        ${endDate ? `AND t.created_at <= "${endDate}"` : ''}
      ) AS selected_token_success,
      (
        SELECT SUM(end_selected_token) FROM transactions t
        WHERE type != 'airdrop' 
        AND new_wallet_private_key IS NOT NULL 
        AND bot_address = ${id}
        AND status = 0
        ${symbol ? `AND t.symbol_selected_token = "${symbol}"` : ''}
        ${startDate ? `AND t.created_at >= "${startDate}"` : ''}
        ${endDate ? `AND t.created_at <= "${endDate}"` : ''}
      ) AS selected_token_fails,
      (
        SELECT SUM(end_matic) FROM transactions t
        WHERE type != 'airdrop' 
        AND new_wallet_private_key IS NOT NULL 
        AND bot_address = ${id}
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
        AND bot_address = ${id}
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
      LEFT JOIN bots ON transactions.bot_address = bots.bot_address
      WHERE transactions.type != 'airdrop' 
      AND transactions.new_wallet_private_key IS NOT NULL 
      AND transactions.bot_address = ${id}
      ${symbol ? `AND transactions.symbol_selected_token = "${symbol}"` : ''}
      ${startDate ? `AND transactions.created_at >= "${startDate}"` : ''}
      ${endDate ? `AND transactions.created_at <= "${endDate}"` : ''}
      `;

      const values: any[] = [];

      const details: Transaction | any = await doQuery(sql, values);

      return details[0];
    } catch (err) {
      if (err instanceof Error) {
        console.log('SQL error', err.message);
        throw err.message;
      } else {
        console.log('SQL error', err);
        throw err;
      }
    }
  }
}

async function getLastInsert(botUuid: string): Promise<BotAddress> {
  try {
    const selectSql = 'SELECT * FROM bot_addresses WHERE bot_uuid = ? ORDER BY id DESC LIMIT 1';
    const values = [botUuid];

    const botRow: BotAddress | any = await doQuery(selectSql, values);
    const botData = botRow[0];

    if (botData.account_private_key) {
      botData.account_private_key = decrypt(botData.account_private_key);
    }

    return botData;
  } catch (err) {
    if (err instanceof Error) {
      console.log('SQL error', err.message);
      throw err.message;
    } else {
      console.log('SQL error', err);
      throw err;
    }
  }
}

async function verifyPrivateKeyExists(accountPrivateKey: string): Promise<BotAddress | null> {
  try {
    const sql = `
    SELECT bot_addresses.id
    FROM bot_addresses
    LEFT JOIN bots ON bots.bot_address = bot_addresses.id
    WHERE bot_addresses.account_private_key = ?
    `;

    const values = [accountPrivateKey];

    const botRow: BotAddress | any = await doQuery(sql, values);
    const botData: BotAddress = botRow[0];

    return botData;
  } catch (err) {
    if (err instanceof Error) {
      throw err.message;
    } else {
      throw err;
    }
  }
}
