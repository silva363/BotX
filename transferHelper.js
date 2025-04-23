"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendTransaction = exports.getTokenTransferApproval = void 0;
const ethers_1 = require("ethers");
const settings_1 = require("../utils/settings");
const contracts_json_1 = __importDefault(require("../utils/contracts.json"));
async function getTokenTransferApproval(signer, address, gasPrice) {
    try {
        const walletAddress = await signer.getAddress();
        const tokenContract = new ethers_1.ethers.Contract(address, contracts_json_1.default.ERC20_ABI, signer);
        const allowance = await tokenContract.allowance(walletAddress, settings_1.settings.UNISWAP_ROUTER_V3_ADDRESS);
        if (allowance < ethers_1.ethers.parseEther("5000")) {
            console.log('Sending transaction approve...');
            const approvalTransaction = await tokenContract.approve(settings_1.settings.UNISWAP_ROUTER_V3_ADDRESS, ethers_1.ethers.MaxUint256, {
                gasPrice: gasPrice
            });
            console.log('Waiting transaction approve...');
            const approvalReceipt = await approvalTransaction.wait();
            if (approvalReceipt.status === 1) {
                console.log('Transaction approved');
                return true;
            }
            else {
                console.error('Transaction not approved');
                return false;
            }
        }
        else {
            console.log('Already approved');
            return true;
        }
    }
    catch (error) {
        console.log('getTokenTransferApproval error');
        return false;
    }
}
exports.getTokenTransferApproval = getTokenTransferApproval;
async function sendTransaction(transaction, signer) {
    try {
        if (!signer.provider) {
            throw 'You need a signer provider';
        }
        console.log(`Sending transaction...`);
        const txRes = await signer.sendTransaction(transaction);
        console.log(`Awaiting transaction confirmations...`);
        await txRes.wait(settings_1.settings.TX_APPROVALS);
        return await getReceipt(signer.provider, txRes.hash);
    }
    catch (error) {
        console.log('sendTransaction error');
        throw error;
    }
}
exports.sendTransaction = sendTransaction;
async function getReceipt(provider, txHash, retries = 5, delayMs = 3000) {
    let attempt = 0;
    while (attempt < retries) {
        try {
            console.log(`Awaiting transaction receipt ${attempt + 1}/${retries}...`);
            const receipt = await provider.getTransactionReceipt(txHash);
            if (receipt) {
                const status = receipt.status === 1 ? 1 : 2;
                const message = status === 1 ? 'Transfer success' : 'Transfer fail';
                return { hash: txHash, message, result: receipt, status };
            }
        }
        catch (error) {
            console.log(`Get transaction receipt error on attempt ${attempt + 1}/${retries}`);
        }
        attempt++;
        if (attempt < retries) {
            await new Promise(resolve => setTimeout(resolve, delayMs));
        }
    }
    throw new Error(`getReceipt error`);
}
//# sourceMappingURL=transferHelper.js.map