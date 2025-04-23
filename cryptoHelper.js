"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGasFeePrices = void 0;
const settings_1 = require("../utils/settings");
const alchemy_sdk_1 = require("alchemy-sdk");
const sdkSettings = {
    apiKey: settings_1.settings.ALCHEMY_KEY,
    network: alchemy_sdk_1.Network.MATIC_MAINNET,
};
const alchemy = new alchemy_sdk_1.Alchemy(sdkSettings);
async function getGasFeePrices() {
    try {
        const getFeeData = await alchemy.core.getFeeData();
        if (!getFeeData || !getFeeData.gasPrice || !getFeeData.lastBaseFeePerGas || !getFeeData.maxFeePerGas || !getFeeData.maxPriorityFeePerGas) {
            throw 'Error to get gas fee price';
        }
        const data = {
            gasPrice: BigInt(getFeeData.gasPrice.mul(115).div(100).toString()),
            lastBaseFeePerGas: BigInt(getFeeData.lastBaseFeePerGas.toString()),
            maxFeePerGas: BigInt(getFeeData.maxFeePerGas.toString()),
            maxPriorityFeePerGas: BigInt(getFeeData.maxPriorityFeePerGas.toString())
        };
        return data;
    }
    catch (error) {
        if (error instanceof Error) {
            throw error.message;
        }
        else {
            throw error;
        }
    }
}
exports.getGasFeePrices = getGasFeePrices;
//# sourceMappingURL=cryptoHelper.js.map