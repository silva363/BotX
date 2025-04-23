import doQuery from '../utils/db';
import { returnValidJson } from '../helpers/functionsHelper';
import { Transaction } from '../models/Transaction';

export class TransactionRepository {
  async create(transaction: Transaction): Promise<Transaction> {
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

      const values: any = [
        transaction.bot_address,
        transaction.distribution_bot_wallet,
        transaction.trade_bot,
        transaction.seed_bot,
        transaction.volume_bot,
        transaction.hash,
        returnValidJson(transaction.result),
        transaction.start_matic,
        transaction.end_matic,
        transaction.symbol_selected_token,
        transaction.start_selected_token,
        transaction.end_selected_token,
        transaction.new_wallet_address,
        transaction.new_wallet_private_key,
        returnValidJson(transaction.message),
        transaction.from_address,
        transaction.to_address,
        transaction.type,
        transaction.airdrop_status,
        transaction.status,
        transaction.bot_execution
      ];

      const result: any = await doQuery(sql, values);

      if (result.affectedRows <= 0) {
        throw 'Fail to create transaction';
      }

      let botId = 0;
      let type: keyof Transaction;

      if (transaction.bot_address) {
        botId = transaction.bot_address;
        type = 'bot_address';
      } else if (transaction.seed_bot) {
        botId = transaction.seed_bot;
        type = 'seed_bot';
      } else if (transaction.trade_bot) {
        botId = transaction.trade_bot;
        type = 'trade_bot';
      } else if (transaction.distribution_bot_wallet) {
        botId = transaction.distribution_bot_wallet;
        type = 'distribution_bot_wallet';
      } else {
        throw 'Failed to get last transaction';
      }

      return await this.getLastTransaction(transaction.bot_execution!, botId, type, transaction.symbol_selected_token, transaction.from_address);
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

  async update(transaction: Transaction): Promise<void> {

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
        returnValidJson(transaction.message),
        returnValidJson(transaction.result),
        transaction.status,
        transaction.need_airdrop,
        transaction.id
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

  async find(id: number): Promise<Transaction> {
    try {
      const selectSql = 'SELECT * FROM transactions WHERE id = ?';
      const values: any = [id];

      const botRow: Transaction | any = await doQuery(selectSql, values);
      const botData: Transaction = botRow[0];

      if (!botData) {
        throw "Transaction not find";
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

  async listByAddressId(id: number, type: string = ''): Promise<Transaction[]> {
    try {
      let sql = `SELECT * FROM transactions WHERE bot_address = ? ORDER BY id DESC`;
      let values: any = [id];

      if (type) {
        sql = `SELECT * FROM transactions WHERE bot_address = ? AND type LIKE "%${type}%" ORDER BY id DESC`;
        values = [id];
      }

      const listBotAddresses: Transaction[] | any = await doQuery(sql, values);

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

  async listByType(type: string): Promise<Transaction[]> {
    try {
      let sql = `SELECT * FROM transactions WHERE type LIKE "%${type}%" ORDER BY id DESC`;
      let values: any = [];

      const listBotAddresses: Transaction[] | any = await doQuery(sql, values);

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

  async findByPrivateKey(addressId: number, newWalletPrivateKey: string): Promise<Transaction | null> {
    try {
      const selectSql = 'SELECT * FROM transactions WHERE bot_address = ? AND new_wallet_private_key = ?';
      const values: any = [addressId, newWalletPrivateKey];

      const transactionRow: Transaction | any = await doQuery(selectSql, values);
      const trasactionData: Transaction = transactionRow[0];

      if (!trasactionData) {
        return null;
      }

      return trasactionData;
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

  async findByHash(hash: string): Promise<Transaction | null> {
    try {
      const selectSql = 'SELECT * FROM transactions WHERE hash = ?';
      const values: any = [hash];

      const transactionRow: Transaction | any = await doQuery(selectSql, values);
      const trasactionData: Transaction = transactionRow[0];

      if (!trasactionData) {
        return null;
      }

      return trasactionData;
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

  async listAirdrop(executionId: number): Promise<Transaction[]> {
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
      let values: any = [executionId];

      const listBotAddresses: Transaction[] | any = await doQuery(sql, values);

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

  async listAirdropMatic(executionId: number): Promise<Transaction[]> {
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
      let values: any = [executionId];

      const listBotAddresses: Transaction[] | any = await doQuery(sql, values);

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

  async changeAirdropStatus(id: number): Promise<void> {
    try {
      const sql = 'UPDATE transactions SET airdrop_status = 1, updated_at = now() WHERE id = ? AND need_airdrop = 1';
      const values: any = [id];

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

  async changeAirdropStatusByHash(hash: string): Promise<void> {
    try {
      const sql = 'UPDATE transactions SET airdrop_status = 1, updated_at = now() WHERE hash = ? AND need_airdrop = 1';
      const values: any = [hash];

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

  async changeNeedAirdrop(hash: string): Promise<void> {
    try {
      if (hash) {
        const sql = 'UPDATE transactions SET need_airdrop = 1, updated_at = now() WHERE hash = ?';
        const values: any = [hash];

        await doQuery(sql, values);
      }
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

  async changeNeedAirdropByNewWalletPrivateKeyAndTokenSymbol(newWalletPrivateKey: string, tokenSymbol: string): Promise<void> {
    try {
      const sql = 'UPDATE transactions SET need_airdrop = 1, updated_at = now() WHERE new_wallet_private_key = ? AND symbol_selected_token = ?';
      const values: any = [newWalletPrivateKey, tokenSymbol];

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

  async getLastTransaction(executionId: number, botId: number, type: keyof Transaction, tokenSymbol: string, fromWalletAddress: string): Promise<Transaction> {
    try {
      const selectSql = `
      SELECT * FROM transactions 
      WHERE bot_execution = ? 
      AND ${type} = ? 
      AND symbol_selected_token = ? 
      AND from_address = ? 
      ORDER BY id DESC LIMIT 1`;

      const values: any = [executionId, botId, tokenSymbol, fromWalletAddress];

      const transactionRow: Transaction | any = await doQuery(selectSql, values);
      const trasactionData = transactionRow[0];

      if (!trasactionData) {
        throw 'Transaction not found';
      }

      return trasactionData;
    } catch (err) {
      if (err instanceof Error) {
        console.log('SQL error | getLastTransaction', err.message);
        throw err.message;
      } else {
        console.log('SQL error | getLastTransaction', err);
        throw err;
      }
    }
  }

  async lastTransactionByExecutionId(executionId: number, botId: number, type: keyof Transaction): Promise<string> {
    try {
      const selectSql = `SELECT * FROM transactions WHERE bot_execution = ? AND ${type} = ? ORDER BY id DESC LIMIT 1`;
      const values: any = [executionId, botId];

      const transactionRow: Transaction | any = await doQuery(selectSql, values);
      const trasactionData = transactionRow[0];

      if (!trasactionData) {
        return '';
      }

      return trasactionData.created_at;
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

  async updateSelectedTokenPending(id: number, endMatic: number, endSelectedToken: number): Promise<void> {
    try {
      const sql = 'UPDATE transactions SET end_matic = ?, end_selected_token = ?, updated_at = now() WHERE id = ?';
      const values: any = [endMatic, endSelectedToken, id];

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
}