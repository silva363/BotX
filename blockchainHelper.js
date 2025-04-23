"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const settings_1 = require("../utils/settings");
const ethers_1 = require("ethers");
class BlockchainHelper {
    constructor() {
        this.usage = 0;
    }
    getProvider() {
        try {
            const network = new ethers_1.ethers.Network('mainnet', settings_1.settings.CHAIN_ID);
            const provider = new ethers_1.ethers.JsonRpcProvider(settings_1.settings.ALCHEMY_API, network, {
                staticNetwork: network,
            });
            return provider;
        }
        catch (error) {
            console.log('[BlockchainHelper] getProvider error', error);
            throw error;
        }
    }
}
exports.default = BlockchainHelper;
//# sourceMappingURL=blockchainHelper.js.map