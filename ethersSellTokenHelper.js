"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sell = void 0;
const sdk_core_1 = require("@uniswap/sdk-core");
const ethersHelper_1 = require("./ethersHelper");
const transferHelper_1 = require("./transferHelper");
const cryptoHelper_1 = require("./cryptoHelper");
const settings_1 = require("../utils/settings");
const jsbi_1 = __importDefault(require("jsbi"));
const v3_sdk_1 = require("@uniswap/v3-sdk");
const acceptedTokenRepository_1 = require("../repositories/acceptedTokenRepository");
async function sell(signer, amount, selectedTokenName, selectedTokenSymbol, selectedTokenAddress, tokenDetails, slippageTolerance) {
    try {
        console.log('Starting swap sell...');
        const selectedToken = new sdk_core_1.Token(sdk_core_1.ChainId.POLYGON, selectedTokenAddress, tokenDetails.decimals, selectedTokenSymbol, selectedTokenName);
        let getFeeData = await (0, cryptoHelper_1.getGasFeePrices)();
        const walletAddress = await signer.getAddress();
        let isApproved = await (0, transferHelper_1.getTokenTransferApproval)(signer, selectedToken.address, getFeeData.gasPrice);
        let count = 0;
        while (!isApproved && count < 10) {
            await new Promise(resolve => setTimeout(resolve, 20000));
            getFeeData = await (0, cryptoHelper_1.getGasFeePrices)();
            isApproved = await (0, transferHelper_1.getTokenTransferApproval)(signer, selectedToken.address, getFeeData.gasPrice);
            count + 1;
        }
        const trade = await createTrade(signer, amount, selectedToken);
        const options = (0, ethersHelper_1.swapOptions)(walletAddress, slippageTolerance);
        const swapCallParams = v3_sdk_1.SwapRouter.swapCallParameters([trade], options);
        const tx = {
            data: swapCallParams.calldata,
            to: settings_1.settings.UNISWAP_ROUTER_V3_ADDRESS,
            value: BigInt(swapCallParams.value),
            gasPrice: getFeeData.gasPrice
        };
        return await (0, transferHelper_1.sendTransaction)(tx, signer);
    }
    catch (error) {
        console.log('Transaction [sell] error');
        return { hash: '', status: 0, message: JSON.stringify(error), result: [] };
    }
}
exports.sell = sell;
async function createTrade(signer, amount, selectedToken) {
    try {
        const acceptedTokenRepository = new acceptedTokenRepository_1.AcceptedTokenRepository();
        const tokenDetails = await acceptedTokenRepository.findByAddress(selectedToken.address);
        if (!tokenDetails) {
            throw 'Token details not found';
        }
        const tokenB = new sdk_core_1.Token(sdk_core_1.ChainId.POLYGON, tokenDetails.pool_address, tokenDetails.pool_decimals, tokenDetails.pool_symbol, tokenDetails.pool_name);
        const pool = await (0, ethersHelper_1.poolConstants)(signer, selectedToken, tokenB);
        const swapRoute = new v3_sdk_1.Route([pool], selectedToken, tokenB);
        const inputAmount = sdk_core_1.CurrencyAmount.fromRawAmount(selectedToken, jsbi_1.default.BigInt(amount.toString()));
        const amountOut = await (0, ethersHelper_1.getOutputQuote)(swapRoute, signer, amount, selectedToken);
        const outputAmount = sdk_core_1.CurrencyAmount.fromRawAmount(tokenB, jsbi_1.default.BigInt(amountOut));
        const uncheckedTrade = v3_sdk_1.Trade.createUncheckedTrade({
            route: swapRoute,
            inputAmount: inputAmount,
            outputAmount: outputAmount,
            tradeType: sdk_core_1.TradeType.EXACT_INPUT,
        });
        return uncheckedTrade;
    }
    catch (error) {
        console.log('createTrade error');
        throw (error);
    }
}
//# sourceMappingURL=ethersSellTokenHelper.js.map