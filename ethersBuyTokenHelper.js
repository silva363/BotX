"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buy = void 0;
const ethers_1 = require("ethers");
const sdk_core_1 = require("@uniswap/sdk-core");
const ethersHelper_1 = require("./ethersHelper");
const transferHelper_1 = require("./transferHelper");
const cryptoHelper_1 = require("./cryptoHelper");
const settings_1 = require("../utils/settings");
const SwapRouter_json_1 = require("@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json");
async function buy(signer, amount, tokenDetails, slippageTolerance) {
    try {
        console.log('Starting swap buy...');
        const selectedToken = new sdk_core_1.Token(sdk_core_1.ChainId.POLYGON, tokenDetails.address, tokenDetails.decimals, tokenDetails.symbol, tokenDetails.name);
        let getFeeData = await (0, cryptoHelper_1.getGasFeePrices)();
        const walletAddress = await signer.getAddress();
        const maticTax = getFeeData.gasPrice * BigInt(300000);
        let finalAmount = amount;
        if (tokenDetails.pool_symbol == 'WPOL' || tokenDetails.pool_symbol == 'WMATIC') {
            finalAmount = amount - maticTax;
        }
        let isApproved = await (0, transferHelper_1.getTokenTransferApproval)(signer, tokenDetails.pool_address, getFeeData.gasPrice);
        let count = 0;
        while (!isApproved && count < 10) {
            await new Promise(resolve => setTimeout(resolve, 20000));
            getFeeData = await (0, cryptoHelper_1.getGasFeePrices)();
            isApproved = await (0, transferHelper_1.getTokenTransferApproval)(signer, selectedToken.address, getFeeData.gasPrice);
            count + 1;
        }
        const trade = await createTrade(signer, finalAmount, walletAddress, selectedToken, tokenDetails);
        const tx = {
            to: settings_1.settings.UNISWAP_ROUTER_V3_ADDRESS,
            from: walletAddress,
            data: trade,
            value: finalAmount,
            gasPrice: getFeeData.gasPrice
        };
        return await (0, transferHelper_1.sendTransaction)(tx, signer);
    }
    catch (error) {
        console.log('Transaction [buy] error');
        return { hash: '', status: 0, message: JSON.stringify(error), result: [] };
    }
}
exports.buy = buy;
async function createTrade(signer, amount, to, selectedToken, tokenDetails) {
    try {
        const tokenA = new sdk_core_1.Token(sdk_core_1.ChainId.POLYGON, tokenDetails.pool_address, tokenDetails.pool_decimals, tokenDetails.pool_symbol, tokenDetails.pool_name);
        const router = new ethers_1.ethers.Contract(settings_1.settings.UNISWAP_ROUTER_V3_ADDRESS, SwapRouter_json_1.abi);
        const deadline = Math.floor(Date.now() / 1000) + 60 * 20;
        const validFee = await (0, ethersHelper_1.findValidFee)(signer, tokenA, selectedToken);
        if (!validFee) {
            throw new Error(`Valid fee not found at pool ${tokenA.symbol} / ${selectedToken.symbol}`);
        }
        const params = {
            tokenIn: tokenA.address,
            tokenOut: selectedToken.address,
            fee: validFee,
            recipient: to,
            deadline: deadline,
            amountIn: amount,
            amountOutMinimum: 0,
            sqrtPriceLimitX96: 0
        };
        const trade = router.interface.encodeFunctionData('exactInputSingle', [params]);
        return trade;
    }
    catch (error) {
        console.log('createTrade error');
        throw (error);
    }
}
//# sourceMappingURL=ethersBuyTokenHelper.js.map