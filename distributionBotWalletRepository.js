"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DistributionBotWalletRepository = void 0;
const functionsHelper_1 = require("../helpers/functionsHelper");
const db_1 = __importDefault(require("../utils/db"));
class DistributionBotWalletRepository {
    async create(wallet) {
        try {
            const sql = 'INSERT INTO distribution_bot_wallets (distribution_bot_uuid, name, wallet_address, percent) VALUES (?, ?, ?, ?)';
            const values = [
                wallet.distribution_bot_uuid,
                wallet.name,
                wallet.wallet_address,
                wallet.percent
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
    async update(wallet) {
        try {
            const sql = 'UPDATE distribution_bot_wallets SET name = ?, percent = ?, active = 1, updated_at = now() WHERE id = ? AND distribution_bot_uuid = ?';
            const values = [
                wallet.name,
                wallet.percent,
                wallet.id,
                wallet.distribution_bot_uuid
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
    async changeActive(id, active) {
        try {
            const sql = 'UPDATE distribution_bot_wallets SET active = ?, updated_at = now() WHERE id = ?';
            const values = [active, id];
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
            const sql = `SELECT * FROM distribution_bot_wallets WHERE id = ?`;
            const values = [id];
            const distributionBotWalletRow = await (0, db_1.default)(sql, values);
            const distributionBotWalletData = distributionBotWalletRow[0];
            return distributionBotWalletData;
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
    async findVerify(uuid, walletAddress) {
        try {
            const sql = `SELECT * FROM distribution_bot_wallets WHERE distribution_bot_uuid = ? AND wallet_address = ?`;
            const values = [uuid, walletAddress];
            const distributionBotWalletRow = await (0, db_1.default)(sql, values);
            const distributionBotWalletData = distributionBotWalletRow[0];
            return distributionBotWalletData;
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
    async list(uuid) {
        try {
            const sql = `SELECT * FROM distribution_bot_wallets WHERE distribution_bot_uuid = ? AND active = 1`;
            const values = [uuid];
            const listDistributionBotWallets = await (0, db_1.default)(sql, values);
            listDistributionBotWallets.forEach((element) => {
                element.wallet_address = (0, functionsHelper_1.hideCharacters)(element.wallet_address, 5);
            });
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
    async listSystem(uuid) {
        try {
            const sql = `SELECT * FROM distribution_bot_wallets WHERE distribution_bot_uuid = ? AND active = 1`;
            const values = [uuid];
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
    async verifyUpdateWallets(uuid, wallets) {
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
                }
                ;
                if (exists == 1) {
                    await this.update(element);
                }
                else if (exists == 0 && !element.wallet_address.includes("***")) {
                    element.distribution_bot_uuid = uuid;
                    await this.create(element);
                }
            }
            ;
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
exports.DistributionBotWalletRepository = DistributionBotWalletRepository;
//# sourceMappingURL=distributionBotWalletRepository.js.map