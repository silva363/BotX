import { hideCharacters } from '../helpers/functionsHelper';
import { DistributionBotWallet } from '../models/DistributionBotWallet';
import doQuery from '../utils/db';

export class DistributionBotWalletRepository {
  async create(wallet: DistributionBotWallet): Promise<void> {
    try {
      const sql = 'INSERT INTO distribution_bot_wallets (distribution_bot_uuid, name, wallet_address, percent) VALUES (?, ?, ?, ?)';
      const values = [
        wallet.distribution_bot_uuid,
        wallet.name,
        wallet.wallet_address,
        wallet.percent
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

  async update(wallet: DistributionBotWallet): Promise<void> {
    try {
      const sql = 'UPDATE distribution_bot_wallets SET name = ?, percent = ?, active = 1, updated_at = now() WHERE id = ? AND distribution_bot_uuid = ?';
      const values = [
        wallet.name,
        wallet.percent,
        wallet.id,
        wallet.distribution_bot_uuid
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

  async changeActive(id: number, active: number): Promise<void> {
    try {
      const sql = 'UPDATE distribution_bot_wallets SET active = ?, updated_at = now() WHERE id = ?';
      const values = [active, id];

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

  async find(id: number): Promise<DistributionBotWallet | null> {
    try {
      const sql = `SELECT * FROM distribution_bot_wallets WHERE id = ?`;
      const values = [id];

      const distributionBotWalletRow: DistributionBotWallet | any = await doQuery(sql, values);
      const distributionBotWalletData: DistributionBotWallet = distributionBotWalletRow[0];

      return distributionBotWalletData;
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

  async findVerify(uuid: string, walletAddress: string): Promise<DistributionBotWallet | null> {
    try {
      const sql = `SELECT * FROM distribution_bot_wallets WHERE distribution_bot_uuid = ? AND wallet_address = ?`;
      const values = [uuid, walletAddress];

      const distributionBotWalletRow: DistributionBotWallet | any = await doQuery(sql, values);
      const distributionBotWalletData: DistributionBotWallet = distributionBotWalletRow[0];

      return distributionBotWalletData;
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

  async list(uuid: string): Promise<DistributionBotWallet[]> {
    try {
      const sql = `SELECT * FROM distribution_bot_wallets WHERE distribution_bot_uuid = ? AND active = 1`;
      const values = [uuid];

      const listDistributionBotWallets: DistributionBotWallet[] | any = await doQuery(sql, values);

      listDistributionBotWallets.forEach((element: DistributionBotWallet) => {
        element.wallet_address = hideCharacters(element.wallet_address, 5);
      });

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

  async listSystem(uuid: string): Promise<DistributionBotWallet[]> {
    try {
      const sql = `SELECT * FROM distribution_bot_wallets WHERE distribution_bot_uuid = ? AND active = 1`;
      const values = [uuid];

      const listDistributionBotWallets: DistributionBotWallet[] | any = await doQuery(sql, values);

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

  async verifyUpdateWallets(uuid: string, wallets: DistributionBotWallet[]) {
    try {
      const oldWallets = await this.list(uuid);

      for (let index = 0; index < oldWallets.length; index++) {
        await this.changeActive(oldWallets[index].id, 0);
      }

      for (let index = 0; index < wallets.length; index++) {
        const element = wallets[index];
        let exists = 0;

        for (let indexOld = 0; indexOld < oldWallets.length; indexOld++) {
          const oldWallet = oldWallets[indexOld];

          if (element.wallet_address == oldWallet.wallet_address || (element.wallet_address.includes(oldWallet.wallet_address.substring(4)) && element.wallet_address.includes(oldWallet.wallet_address.substring(-5)))) {
            element.id = oldWallet.id;
            exists = 1;
          }
        };

        if (exists == 1) {
          await this.update(element);
        } else if (exists == 0 && !element.wallet_address.includes("***")) {
          element.distribution_bot_uuid = uuid;
          await this.create(element);
        }
      };
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
