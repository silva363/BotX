"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTokenPrice = exports.poolConstants = exports.getOutputQuote = exports.verifyWorstExecutionPrice = exports.findValidFee = exports.swapOptions = exports.fromReadableAmount = exports.addressIsValid = exports.generateNewWallet = exports.getSelectedTokenBalance2 = exports.getSelectedTokenBalance = exports.getWmaticBalance = exports.getMaticBalance = exports.getSigner = void 0;
const ethers_1 = require("ethers");
const functionsHelper_1 = require("./functionsHelper");
const sdk_core_1 = require("@uniswap/sdk-core");
const v3_sdk_1 = require("@uniswap/v3-sdk");
const settings_1 = require("../utils/settings");
const IUniswapV3Pool_json_1 = __importDefault(require("@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json"));
const contracts_json_1 = __importDefault(require("../utils/contracts.json"));
const jsbi_1 = __importDefault(require("jsbi"));
const blockchainHelper_1 = __importDefault(require("./blockchainHelper"));
async function getSigner(accountPrivateKey) {
    try {
        const blockchainHelper = new blockchainHelper_1.default();
        const provider = blockchainHelper.getProvider();
        const signer = new ethers_1.ethers.Wallet(accountPrivateKey, provider);
        return signer;
    }
    catch (error) {
        console.log('getSigner error');
        throw 'This private key is not valid';
    }
}
exports.getSigner = getSigner;
async function getMaticBalance(signer) {
    try {
        if (!signer.provider) {
            return BigInt(0);
        }
        const address = await signer.getAddress();
        const balance = await signer.provider.getBalance(address);
        return balance;
    }
    catch (error) {
        console.log('getMaticBalance error');
        throw 'This private key is not valid';
    }
}
exports.getMaticBalance = getMaticBalance;
async function getWmaticBalance(signer) {
    try {
        if (!signer.provider) {
            return BigInt(0);
        }
        const wmaticContract = new ethers_1.ethers.Contract(settings_1.settings.WMATIC_ADDRESS, contracts_json_1.default.ERC20_ABI, signer);
        const address = await signer.getAddress();
        const balance = await wmaticContract.balanceOf(address);
        return balance;
    }
    catch (error) {
        console.log('getWmaticBalance error');
        throw error;
    }
}
exports.getWmaticBalance = getWmaticBalance;
async function getSelectedTokenBalance(accountPrivateKey, tokenContractAddress) {
    try {
        const signer = await getSigner(accountPrivateKey);
        if (!signer.provider) {
            return BigInt(0);
        }
        const address = await signer.getAddress();
        const tokenContract = new ethers_1.ethers.Contract(tokenContractAddress, contracts_json_1.default.ERC20_ABI, signer);
        const balance = await tokenContract.balanceOf(address);
        return balance;
    }
    catch (error) {
        console.log('getSelectedTokenBalance error');
        throw error;
    }
}
exports.getSelectedTokenBalance = getSelectedTokenBalance;
async function getSelectedTokenBalance2(signer, tokenContractAddress) {
    try {
        const address = await signer.getAddress();
        const tokenContract = new ethers_1.ethers.Contract(tokenContractAddress, contracts_json_1.default.ERC20_ABI, signer);
        const balance = await tokenContract.balanceOf(address);
        return balance;
    }
    catch (error) {
        console.log('getSelectedTokenBalance2 error');
        throw error;
    }
}
exports.getSelectedTokenBalance2 = getSelectedTokenBalance2;
async function generateNewWallet(provider) {
    const newWallet = ethers_1.ethers.Wallet.createRandom(provider);
    if (!newWallet) {
        console.log('Error to create a new wallet');
        return null;
    }
    if (!ethers_1.ethers.isAddressable(newWallet)) {
        console.log('New wallet address is not addressable');
        return null;
    }
    if (!addressIsValid(newWallet.address)) {
        console.log('New wallet address is invalid');
        return null;
    }
    return newWallet;
}
exports.generateNewWallet = generateNewWallet;
async function addressIsValid(address) {
    try {
        const isValid = ethers_1.ethers.isAddress(address);
        return isValid;
    }
    catch (error) {
        throw error;
    }
}
exports.addressIsValid = addressIsValid;
async function fromReadableAmount(amount) {
    try {
        const extraDigits = Math.pow(10, await (0, functionsHelper_1.countDecimals)(amount));
        const adjustedAmount = amount * extraDigits;
        const amountFrom = jsbi_1.default.divide(jsbi_1.default.multiply(jsbi_1.default.BigInt(adjustedAmount), jsbi_1.default.exponentiate(jsbi_1.default.BigInt(10), jsbi_1.default.BigInt(18))), jsbi_1.default.BigInt(extraDigits));
        return amountFrom;
    }
    catch (error) {
        console.log('fromReadableAmount error', error);
        throw (error);
    }
}
exports.fromReadableAmount = fromReadableAmount;
function swapOptions(to, slippageTolerance) {
    const options = {
        slippageTolerance: new sdk_core_1.Percent(slippageTolerance, 100),
        deadline: Math.floor(Date.now() / 1000) + 60 * 20,
        recipient: to
    };
    return options;
}
exports.swapOptions = swapOptions;
async function findValidFee(signer, tokenA, tokenB) {
    const fees = [v3_sdk_1.FeeAmount.LOWEST, v3_sdk_1.FeeAmount.LOW, v3_sdk_1.FeeAmount.MEDIUM, v3_sdk_1.FeeAmount.HIGH];
    for (const fee of fees) {
        const poolAddress = (0, v3_sdk_1.computePoolAddress)({
            factoryAddress: settings_1.settings.UNISWAP_V3_ADDRESS,
            tokenA: tokenA,
            tokenB: tokenB,
            fee: fee,
        });
        const poolCode = await signer.provider.getCode(poolAddress);
        if (poolCode !== '0x') {
            return fee;
        }
    }
    return null;
}
exports.findValidFee = findValidFee;
function verifyWorstExecutionPrice(uncheckedTrade, acceptablePrice) {
    const worstPrice = uncheckedTrade.worstExecutionPrice(new sdk_core_1.Percent(1, 100));
    if (worstPrice.greaterThan(acceptablePrice)) {
        throw 'Price is too high';
    }
}
exports.verifyWorstExecutionPrice = verifyWorstExecutionPrice;
async function getOutputQuote(route, signer, amount, tokenIn) {
    try {
        const { calldata } = v3_sdk_1.SwapQuoter.quoteCallParameters(route, sdk_core_1.CurrencyAmount.fromRawAmount(tokenIn, jsbi_1.default.BigInt(amount.toString())), sdk_core_1.TradeType.EXACT_INPUT, {
            useQuoterV2: true,
        });
        const quoteCallReturnData = await signer.call({
            to: settings_1.settings.UNISWAP_QUOTER_V2_ADDRESS,
            data: calldata,
        });
        const abiCoder = ethers_1.ethers.AbiCoder.defaultAbiCoder();
        const quote = abiCoder.decode(['uint256'], quoteCallReturnData);
        return quote;
    }
    catch (error) {
        console.log('getOutputQuote error');
        throw (error);
    }
}
exports.getOutputQuote = getOutputQuote;
async function poolConstants(signer, tokenA, tokenB) {
    try {
        const validFee = await findValidFee(signer, tokenA, tokenB);
        if (!validFee) {
            throw new Error(`Valid fee not found at pool ${tokenA.symbol} / ${tokenB.symbol}`);
        }
        const currentPoolAddress = (0, v3_sdk_1.computePoolAddress)({
            factoryAddress: settings_1.settings.UNISWAP_V3_ADDRESS,
            tokenA: tokenA,
            tokenB: tokenB,
            fee: validFee,
        });
        const poolCode = await signer.provider.getCode(currentPoolAddress);
        if (poolCode === '0x') {
            throw new Error(`No contract deployed at pool ${tokenA.symbol} / ${tokenB.symbol}`);
        }
        const poolContract = new ethers_1.ethers.Contract(currentPoolAddress, IUniswapV3Pool_json_1.default.abi, signer.provider);
        const fee = await poolContract.fee();
        const liquidity = await poolContract.liquidity();
        const slot0 = await poolContract.slot0();
        const pool = new v3_sdk_1.Pool(tokenA, tokenB, Number(fee.toString()), slot0[0].toString(), liquidity.toString(), Number(slot0[1]));
        return pool;
    }
    catch (error) {
        console.log('poolConstants error');
        throw (error);
    }
}
exports.poolConstants = poolConstants;
async function getTokenPrice(signer, tokenAddress, tokenSymbol, tokenName, decimals, poolDetails) {
    try {
        const tokenA = new sdk_core_1.Token(sdk_core_1.ChainId.POLYGON, tokenAddress, decimals, tokenSymbol, tokenName);
        let tokenB;
        if (!poolDetails) {
            tokenB = new sdk_core_1.Token(sdk_core_1.ChainId.POLYGON, settings_1.settings.WMATIC_ADDRESS, 18, "WMATIC", "Wrapped Matic");
        }
        else {
            tokenB = new sdk_core_1.Token(sdk_core_1.ChainId.POLYGON, poolDetails.pool_address, poolDetails.pool_decimals, poolDetails.pool_symbol, poolDetails.pool_name);
        }
        const pool = await poolConstants(signer, tokenA, tokenB);
        const quoteAmount = BigInt(2 ** 192 * 1 * 10 ** tokenA.decimals) / BigInt(Number(pool.sqrtRatioX96) ** 2);
        const quoteAmountInDecimal = Number(quoteAmount.toString()) / (10 ** tokenB.decimals);
        return quoteAmountInDecimal;
    }
    catch (error) {
        console.log('getTokenPrice error');
        throw (error);
    }
}
exports.getTokenPrice = getTokenPrice;
//# sourceMappingURL=ethersHelper.js.map