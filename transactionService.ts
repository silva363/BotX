import { HDNodeWallet, Signer, TransactionRequest, ethers } from 'ethers';
import { getGasFeePrices } from '../helpers/cryptoHelper';
import { buy } from '../helpers/ethersBuyTokenHelper';
import { sell } from '../helpers/ethersSellTokenHelper';
import { sendTransaction } from '../helpers/transferHelper';
import { getMaticBalance, getSelectedTokenBalance, getSelectedTokenBalance2, getSigner, getWmaticBalance } from '../helpers/ethersHelper';
import { settings } from '../utils/settings';
import contracts from '../utils/contracts.json';
import { TransactionResponse } from '../models/TransactionResponse.model';
import { Transaction } from '../models/Transaction';
import { TransactionRepository } from '../repositories/transactionRepository';
import { divideAmount, removePercent } from '../helpers/functionsHelper';
import { AirdropRepository } from '../repositories/airdropRepository';
import { AcceptedToken } from '../models/AcceptedToken';
import { BotAddressRepository } from '../repositories/botAddressRepository';
import { TradeBotRepository } from '../repositories/tradeBotRepository';

export async function swapBuy(
    executionId: number,
    botId: number,
    botName: string,
    botType: keyof Transaction,
    signer: Signer,
    tokenDetails: AcceptedToken,
    amount: bigint,
    newWalletPrivateKey: string,
    slippageTolerance: number
): Promise<TransactionResponse> {
    const transactionRepository = new TransactionRepository();
    const walletAddress = await signer.getAddress();

    try {
        const balanceMatic = await getMaticBalance(signer);
        const balanceSelectedToken = await getSelectedTokenBalance2(signer, tokenDetails.address);

        let transaction: Transaction = {
            id: 0,
            hash: '',
            start_matic: ethers.formatEther(balanceMatic),
            end_matic: '0',
            symbol_selected_token: tokenDetails.symbol,
            start_selected_token: ethers.formatUnits(balanceSelectedToken, tokenDetails.decimals),
            end_selected_token: '0',
            new_wallet_address: walletAddress,
            new_wallet_private_key: newWalletPrivateKey,
            from_address: walletAddress,
            to_address: walletAddress,
            message: '',
            result: '',
            status: 0,
            need_airdrop: 0,
            type: 'swap_buy',
            airdrop_status: 0,
            bot_execution: executionId
        };

        transaction = setTransactionBotId(transaction, botType, botId);
        transaction = await transactionRepository.create(transaction);

        let trade;

        if (settings.WORKSPACE == 'local' && settings.WITH_PAYMENT == 'n') {
            trade = { hash: '', status: 1, message: 'test', result: 'test' };
        } else {
            trade = await buy(signer, amount, tokenDetails, slippageTolerance);
        }

        let attempt = 0;

        while (trade.status == 0 && attempt < 5) {
            attempt = attempt + 1;
            console.log(`[Swap buy] ${botName} failed on attempt ${attempt}, trying again...`);
            await new Promise(resolve => setTimeout(resolve, 15000));

            if (settings.WORKSPACE == 'local' && settings.WITH_PAYMENT == 'n') {
                trade = { hash: '', status: 1, message: 'test', result: 'test' };
            } else {
                trade = await buy(signer, amount, tokenDetails, slippageTolerance);
            }
        }

        let maticNow = balanceMatic;
        let selectedTokenNow = balanceSelectedToken;

        if (trade.status == 1) {
            maticNow = await getMaticBalance(signer);
            selectedTokenNow = await getSelectedTokenBalance2(signer, tokenDetails.address);
        }

        transaction.hash = trade.hash;
        transaction.end_matic = ethers.formatEther(maticNow);
        transaction.end_selected_token = ethers.formatUnits(selectedTokenNow, tokenDetails.decimals);
        transaction.message = trade.message;
        transaction.result = trade.result;
        transaction.status = trade.status;

        await transactionRepository.update(transaction);
        console.log(`[SWAP BUY] ${botName} ${trade.message} | Status: ${trade.status}`);
        return trade;
    } catch (error) {
        const errorTransaction = await transactionRepository.getLastTransaction(executionId, botId, botType, tokenDetails.symbol, walletAddress);
        errorTransaction.message = JSON.stringify(error);
        errorTransaction.status = 2;
        await transactionRepository.update(errorTransaction);

        console.log(`[SWAP BUY] [${botName}] | doTransfer error`, error);
        return { hash: '', message: JSON.stringify(error), result: [], status: errorTransaction.status };
    }
}

export async function swapSell(
    executionId: number,
    botId: number,
    botName: string,
    botType: keyof Transaction,
    signer: Signer,
    tokenDetails: AcceptedToken,
    amount: bigint,
    newWalletPrivateKey: string,
    slippageTolerance: number
): Promise<TransactionResponse> {
    const transactionRepository = new TransactionRepository();
    const walletAddress = await signer.getAddress();

    try {
        const balanceMatic = await getMaticBalance(signer);
        const balanceSelectedToken = await getSelectedTokenBalance2(signer, tokenDetails.address);

        let transaction: Transaction = {
            id: 0,
            hash: '',
            start_matic: ethers.formatEther(balanceMatic),
            end_matic: '0',
            symbol_selected_token: tokenDetails.symbol,
            start_selected_token: ethers.formatEther(balanceSelectedToken),
            end_selected_token: '0',
            new_wallet_address: walletAddress,
            new_wallet_private_key: newWalletPrivateKey,
            from_address: walletAddress,
            to_address: walletAddress,
            message: '',
            result: '',
            status: 0,
            need_airdrop: 0,
            type: 'swap_sell',
            airdrop_status: 0,
            bot_execution: executionId
        };

        transaction = setTransactionBotId(transaction, botType, botId);
        transaction = await transactionRepository.create(transaction);

        let trade;

        if (settings.WORKSPACE == 'local' && settings.WITH_PAYMENT == 'n') {
            trade = { hash: '', status: 1, message: 'test', result: 'test' };
        } else {
            trade = await sell(signer, amount, tokenDetails.name, tokenDetails.symbol, tokenDetails.address, tokenDetails, slippageTolerance);
        }

        let attempt = 0;

        while (trade.status == 0 && attempt < 5) {
            attempt = attempt + 1;
            console.log(`[Swap sell] ${botName} failed on attempt ${attempt}, trying again...`);
            await new Promise(resolve => setTimeout(resolve, 15000));

            if (settings.WORKSPACE == 'local' && settings.WITH_PAYMENT == 'n') {
                trade = { hash: '', status: 1, message: 'test', result: 'test' };
            } else {
                trade = await sell(signer, amount, tokenDetails.name, tokenDetails.symbol, tokenDetails.address, tokenDetails, slippageTolerance);
            }
        }

        let maticNow = balanceMatic;
        let selectedTokenNow = balanceSelectedToken;

        if (trade.status == 1) {
            maticNow = await getMaticBalance(signer);
            selectedTokenNow = await getSelectedTokenBalance2(signer, tokenDetails.address);
        }

        transaction.hash = trade.hash;
        transaction.end_matic = ethers.formatEther(maticNow);
        transaction.end_selected_token = ethers.formatEther(selectedTokenNow);
        transaction.message = trade.message;
        transaction.result = trade.result;
        transaction.status = trade.status;

        await transactionRepository.update(transaction);
        console.log(`[SWAP SELL] ${botName} ${trade.message} | Status: ${trade.status}`);
        return trade;
    } catch (error) {
        const errorTransaction = await transactionRepository.getLastTransaction(executionId, botId, botType, tokenDetails.symbol, walletAddress);
        errorTransaction.message = JSON.stringify(error);
        errorTransaction.status = 2;
        await transactionRepository.update(errorTransaction);

        console.log(`[SWAP SELL] [${botName}] | doTransfer error`, error);
        return { hash: '', message: JSON.stringify(error), result: [], status: errorTransaction.status };
    }
}

export async function swapMaticForWmatic(
    botTypeId: number,
    botType: keyof Transaction,
    signer: Signer,
    amount: bigint,
    executionId: number,
    newWalletAddress: string = '',
    newWalletPrivateKey: string = ''
): Promise<TransactionResponse> {
    try {
        const balanceMatic = await getMaticBalance(signer);
        const to = await signer.getAddress();
        const balanceWmatic = await getWmaticBalance(signer);

        let maticNow = balanceMatic;
        let wMaticNow = balanceWmatic;

        const resDeposit = await transferTokenTo(signer, settings.WMATIC_ADDRESS, 'WMATIC', settings.WMATIC_ADDRESS, amount, 'deposit');

        if (resDeposit.status == 1) {
            maticNow = await getMaticBalance(signer);
            wMaticNow = await getWmaticBalance(signer);
        }

        let transaction: Transaction = {
            id: 0,
            hash: resDeposit.hash,
            start_matic: ethers.formatEther(balanceMatic),
            end_matic: ethers.formatEther(maticNow),
            symbol_selected_token: 'WMATIC',
            start_selected_token: ethers.formatEther(balanceWmatic),
            end_selected_token: ethers.formatEther(wMaticNow),
            new_wallet_address: newWalletAddress,
            new_wallet_private_key: newWalletPrivateKey,
            from_address: to,
            to_address: to,
            message: resDeposit.message,
            result: resDeposit.result,
            status: resDeposit.status,
            type: 'deposit',
            airdrop_status: 0,
            need_airdrop: 0,
            bot_execution: executionId
        };

        transaction = setTransactionBotId(transaction, botType, botTypeId);

        const transactionRepository = new TransactionRepository();
        await transactionRepository.create(transaction);

        console.log(`[Swap] MATIC to WMATIC ${resDeposit.message} | Status: ${resDeposit.status}`);
        return { hash: '', message: resDeposit.message, result: resDeposit.result, status: resDeposit.status };
    } catch (error) {
        console.log('swapMaticForWmatic error', error);
        if (error instanceof Error) {
            return { hash: '', message: error.message, result: [], status: 0 };
        } else {
            return { hash: '', message: JSON.stringify(error), result: [], status: 0 };
        }
    }
}

export async function swapWmaticForMatic(
    botTypeId: number,
    botType: keyof Transaction,
    signer: Signer,
    amount: bigint,
    executionId: number,
    newWalletAddress: string = '',
    newWalletPrivateKey: string = ''
): Promise<TransactionResponse> {
    try {
        const balanceMatic = await getMaticBalance(signer);
        const to = await signer.getAddress();

        let maticNow = balanceMatic;

        const resDeposit = await transferTokenTo(signer, settings.WMATIC_ADDRESS, 'MATIC', settings.WMATIC_ADDRESS, amount, 'withdraw');

        if (resDeposit.status == 1) {
            maticNow = await getMaticBalance(signer);
        }

        let transaction: Transaction = {
            id: 0,
            hash: resDeposit.hash,
            start_matic: ethers.formatEther(balanceMatic),
            end_matic: ethers.formatEther(maticNow),
            symbol_selected_token: 'MATIC',
            start_selected_token: ethers.formatEther(balanceMatic),
            end_selected_token: ethers.formatEther(maticNow),
            new_wallet_address: newWalletAddress,
            new_wallet_private_key: newWalletPrivateKey,
            from_address: to,
            to_address: to,
            message: resDeposit.message,
            result: resDeposit.result,
            status: resDeposit.status,
            type: 'withdraw',
            airdrop_status: 0,
            need_airdrop: 0,
            bot_execution: executionId
        };

        transaction = setTransactionBotId(transaction, botType, botTypeId);

        const transactionRepository = new TransactionRepository();
        await transactionRepository.create(transaction);

        console.log(`[Swap] WMATIC to MATIC ${resDeposit.message} | Status: ${resDeposit.status}`);
        return { hash: '', message: resDeposit.message, result: resDeposit.result, status: resDeposit.status };
    } catch (error) {
        console.log('swapWmaticForMatic error');
        if (error instanceof Error) {
            return { hash: '', message: error.message, result: [], status: 0 };
        } else {
            return { hash: '', message: JSON.stringify(error), result: [], status: 0 };
        }
    }
}

export async function doTransferToDestinyBuy(
    signer: Signer,
    botAddressId: number,
    holderPercent: number,
    selectedTokenSymbol: string,
    newWalletPrivateKey: string,
    destinyAddress: string,
    tokenAddress: string,
    maticStart: bigint,
    startSelectedToken: bigint,
    executionId: number,
    airdropId: number,
    decimals: number
) {
    try {
        selectedTokenSymbol = selectedTokenSymbol.toUpperCase();
        console.log(`Doing [${selectedTokenSymbol}] transfer to destiny...`);

        if (startSelectedToken == BigInt(0)) {
            console.log('Insufficient selected token balance');
            return;
        }

        if (maticStart == BigInt(0)) {
            console.log('Insufficient matic balance');
            return;
        }

        const resTransfer = await transferTokenTo(signer, tokenAddress, selectedTokenSymbol, destinyAddress, removePercent(startSelectedToken, holderPercent), 'transfer', decimals);
        let maticNow = maticStart;
        let selectedTokenNow = startSelectedToken;

        if (resTransfer.status == 1) {
            maticNow = await getMaticBalance(signer);
            selectedTokenNow = await getSelectedTokenBalance(newWalletPrivateKey, tokenAddress);
        }

        const fromWalletAddress = await signer.getAddress();

        const transaction: Transaction = {
            id: 0,
            hash: resTransfer.hash,
            bot_address: botAddressId,
            start_matic: ethers.formatEther(maticStart),
            end_matic: ethers.formatEther(maticNow),
            symbol_selected_token: selectedTokenSymbol,
            start_selected_token: ethers.formatUnits(startSelectedToken, decimals),
            end_selected_token: ethers.formatUnits(selectedTokenNow, decimals),
            new_wallet_address: fromWalletAddress,
            new_wallet_private_key: newWalletPrivateKey,
            from_address: fromWalletAddress,
            to_address: destinyAddress,
            message: resTransfer.message,
            result: resTransfer.result,
            status: resTransfer.status,
            type: 'transfer_destiny_buy',
            airdrop_status: 0,
            need_airdrop: 0,
            bot_execution: executionId
        };

        const transactionRepository = new TransactionRepository();
        await transactionRepository.create(transaction);
        console.log(`Transfer [${selectedTokenSymbol}] to destiny ended`, `Message: ${resTransfer.message} | Status: ${resTransfer.status}`);

        const airdropRepository = new AirdropRepository();

        if (resTransfer.status == 0) {
            airdropRepository.changeStatus(airdropId, 2);
        } else if (resTransfer.status == 1) {
            airdropRepository.changeStatus(airdropId, 1);
        }
    } catch (error) {
        console.log(`Transfer [${selectedTokenSymbol}] to destiny error`, error);
    }
}

export async function doTransferToDestinySell(
    signer: Signer,
    botAddressId: number,
    holderPercent: number,
    newWalletPrivateKey: string,
    destinyAddress: string,
    resultBalanceStart: bigint,
    executionId: number,
    airdropId: number,
    tokenDetails: AcceptedToken
): Promise<void> {
    try {
        console.log(`Doing [WMATIC] transfer to destiny...`);

        const maticStart = await getMaticBalance(signer);

        if (maticStart == BigInt(0)) {
            console.log('Insufficient matic balance to transfer to destiny');
        }

        const resTransfer = await transferTokenTo(signer, tokenDetails.pool_address, tokenDetails.pool_symbol, destinyAddress, removePercent(resultBalanceStart, holderPercent), 'transfer');

        let maticNow = maticStart;
        let selectedTokenNow = resultBalanceStart;

        if (resTransfer.status == 1) {
            maticNow = await getMaticBalance(signer);
            selectedTokenNow = await getSelectedTokenBalance2(signer, tokenDetails.pool_address);
        }

        const fromWalletAddress = await signer.getAddress();

        const transaction: Transaction = {
            id: 0,
            hash: resTransfer.hash,
            bot_address: botAddressId,
            start_matic: ethers.formatEther(maticStart),
            end_matic: ethers.formatEther(maticNow),
            symbol_selected_token: tokenDetails.pool_symbol,
            start_selected_token: ethers.formatEther(resultBalanceStart),
            end_selected_token: ethers.formatEther(selectedTokenNow),
            new_wallet_address: fromWalletAddress,
            new_wallet_private_key: newWalletPrivateKey,
            from_address: fromWalletAddress,
            to_address: destinyAddress,
            message: resTransfer.message,
            result: resTransfer.result,
            status: resTransfer.status,
            type: 'transfer_destiny_sell',
            airdrop_status: 0,
            need_airdrop: 0,
            bot_execution: executionId
        };

        const transactionRepository = new TransactionRepository();
        await transactionRepository.create(transaction);
        console.log(`Transfer [${tokenDetails.pool_symbol}] to destiny ended`, `Message: ${resTransfer.message} | Status: ${resTransfer.status}`);

        const airdropRepository = new AirdropRepository();

        if (resTransfer.status == 0) {
            airdropRepository.changeStatus(airdropId, 2);
        } else if (resTransfer.status == 1) {
            airdropRepository.changeStatus(airdropId, 1);
        }
    } catch (error) {
        console.log(`Transfer [${tokenDetails.pool_symbol}] to destiny error`, error);
    }
}

export async function doTransferAirdrop(signer: Signer, destinyAddress: string, selectedTokenSymbol: string, tokenAddress: string, amount: bigint): Promise<TransactionResponse> {
    try {
        selectedTokenSymbol = selectedTokenSymbol.toUpperCase();
        console.log(`Doing [${selectedTokenSymbol}] airdrop...`);

        const resTransfer = await transferTokenTo(signer, tokenAddress, selectedTokenSymbol, destinyAddress, amount, 'transfer');

        console.log(`Airdrop [${selectedTokenSymbol}] to destiny ended`, `Message: ${resTransfer.message} | Status: ${resTransfer.status}`);
        return resTransfer;
    } catch (error) {
        console.log(`Airdrop [${selectedTokenSymbol}] to destiny error`, error);
        return { hash: '', message: JSON.stringify(error), result: [], status: 0 };
    }
}

export async function doTransferDistribution(signer: Signer, destinyAddress: string, selectedTokenSymbol: string, tokenAddress: string, amount: bigint): Promise<TransactionResponse> {
    try {
        selectedTokenSymbol = selectedTokenSymbol.toUpperCase();
        console.log(`Doing [${selectedTokenSymbol}] distribution...`);

        const resTransfer = await transferTokenTo(signer, tokenAddress, selectedTokenSymbol, destinyAddress, amount, 'transfer');

        console.log(`Distribution [${selectedTokenSymbol}] to wallet  ${destinyAddress} ended`, `Message: ${resTransfer.message} | Status: ${resTransfer.status}`);
        return resTransfer;
    } catch (error) {
        console.log(`Distribution [${selectedTokenSymbol}] to wallet ${destinyAddress} error`, error);
        return { hash: '', message: JSON.stringify(error), result: [], status: 0 };
    }
}

export async function selectedTokenAirdrop(
    botId: number,
    botUuid: string,
    botType: keyof Transaction,
    transaction: Transaction,
    destinyAddress: string,
    tokenSymbol: string,
    tokenAddress: string,
    rechargePrivateKey: string
) {
    try {
        tokenSymbol = tokenSymbol.toUpperCase();
        const transactionRepository = new TransactionRepository();

        if (transaction.new_wallet_private_key) {
            const signer = await getSigner(transaction.new_wallet_private_key);

            let startSelectedTokenBalance = BigInt(0);
            let finalTokenSymbol = '';
            let finalTokenAddress = '';

            if (transaction.symbol_selected_token == 'WMATIC') {
                startSelectedTokenBalance = await getWmaticBalance(signer);
                finalTokenSymbol = 'WMATIC';
                finalTokenAddress = settings.WMATIC_ADDRESS;
            } else {
                startSelectedTokenBalance = await getSelectedTokenBalance2(signer, tokenAddress);
                finalTokenSymbol = tokenSymbol;
                finalTokenAddress = tokenAddress;
            }

            const startSelectedTokenBalanceFormatted = Number(ethers.formatEther(startSelectedTokenBalance));

            if (startSelectedTokenBalanceFormatted == 0) {
                await transactionRepository.changeAirdropStatus(transaction.id);
                console.log(`[Transaction - ${transaction.id}] no ${finalTokenSymbol}, airdrop updated`);
                return;
            }

            const actualMatic = await getMaticBalance(signer);
            const actualMaticFormatted = Number(ethers.formatEther(actualMatic));

            const getFeeData = await getGasFeePrices();
            const maticTax = getFeeData.gasPrice;
            const maticTaxFormatted = Number(ethers.formatEther(maticTax));

            if (actualMaticFormatted < maticTaxFormatted) {
                if (!transaction.new_wallet_address) {
                    return;
                }

                switch (botType) {
                    case 'bot_address':
                        const rechargeSigner = await getSigner(rechargePrivateKey);
                        const resCharge = await transferTokenTo(rechargeSigner, settings.MATIC_ADDRESS, 'MATIC', transaction.new_wallet_address, maticTax, 'transfer');

                        if (resCharge.status != 1) {
                            console.log(`[Transaction - ${transaction.id}] need matic to proceed, actual matic is ${actualMaticFormatted}, MATIC gas is ${maticTaxFormatted}`);
                            return;
                        }

                        break;

                    default:
                        return;
                }
            }

            let startMaticBalance = await getMaticBalance(signer);

            const transferResult = await doTransferAirdrop(signer, destinyAddress, finalTokenSymbol, finalTokenAddress, startSelectedTokenBalance);

            let maticNow = startMaticBalance;
            let selectedTokenNow = startSelectedTokenBalance;

            if (transferResult.status == 1) {
                maticNow = await getMaticBalance(signer);
                selectedTokenNow = await getSelectedTokenBalance2(signer, finalTokenAddress);
            }

            let from = '';

            if (transaction.new_wallet_address) {
                from = transaction.new_wallet_address;
            }

            let transactionObject: Transaction = {
                id: 0,
                hash: transferResult.hash,
                message: transferResult.message,
                result: transferResult.result,
                start_matic: ethers.formatEther(startMaticBalance),
                end_matic: ethers.formatEther(maticNow),
                symbol_selected_token: transaction.symbol_selected_token,
                start_selected_token: ethers.formatEther(startSelectedTokenBalance),
                end_selected_token: ethers.formatEther(selectedTokenNow),
                new_wallet_address: transaction.new_wallet_address,
                new_wallet_private_key: transaction.new_wallet_private_key,
                from_address: from,
                to_address: destinyAddress,
                type: 'airdrop',
                airdrop_status: transferResult.status,
                status: transferResult.status,
                need_airdrop: 0
            };

            transactionObject = setTransactionBotId(transactionObject, botType, botId);

            await transactionRepository.create(transactionObject);

            if (transferResult.status == 1) {
                await transactionRepository.changeAirdropStatus(transaction.id);
            }

            console.log(`Airdrop finish: status ${transferResult.status}`);
        } else {
            await transactionRepository.changeAirdropStatus(transaction.id);
            console.log(`[Transaction - ${transaction.id}] does not have a private key, airdrop was updated`);
        }
    } catch (error) {
        console.log(`[Airdrop] Transaction ${transaction.hash} | selectedTokenAirdrop error`, error);
    }
}

export async function maticAirdrop(botId: number, botType: keyof Transaction, transaction: Transaction, destinyAddress: string) {
    try {
        const transactionRepository = new TransactionRepository();

        if (transaction.new_wallet_private_key) {
            const tokenSymbol = 'MATIC';
            const tokenAddress = settings.MATIC_ADDRESS;
            const signer = await getSigner(transaction.new_wallet_private_key);

            let startSelectedTokenBalance = await getMaticBalance(signer);
            const getFeeData = await getGasFeePrices();
            const maticTax = getFeeData.gasPrice * BigInt(30000);

            let startSelectedTokenBalanceFormatted = Number(ethers.formatEther(startSelectedTokenBalance));
            const maticTaxFormatted = Number(ethers.formatEther(maticTax));

            if (startSelectedTokenBalanceFormatted == 0) {
                await transactionRepository.changeAirdropStatus(transaction.id);
                console.log(`[Transaction - ${transaction.id}] no matic, airdrop updated`);
                return;
            }

            if (startSelectedTokenBalanceFormatted < maticTaxFormatted) {
                await transactionRepository.changeAirdropStatus(transaction.id);
                console.log(`[Transaction - ${transaction.id}] need matic to proceed, actual matic is ${startSelectedTokenBalanceFormatted}, MATIC gas is ${maticTaxFormatted}`);
                return;
            }

            startSelectedTokenBalanceFormatted = startSelectedTokenBalanceFormatted - maticTaxFormatted;

            if (startSelectedTokenBalanceFormatted > maticTaxFormatted) {
                startSelectedTokenBalance = startSelectedTokenBalance - maticTax;

                let startMaticBalance = await getMaticBalance(signer);

                const transferResult = await doTransferAirdrop(signer, destinyAddress, tokenSymbol, tokenAddress, startSelectedTokenBalance);

                let maticNow = startMaticBalance;
                let selectedTokenNow = startSelectedTokenBalance;

                if (transferResult.status == 1) {
                    maticNow = await getMaticBalance(signer);
                    selectedTokenNow = await getSelectedTokenBalance2(signer, tokenAddress);
                }

                let from = '';

                if (transaction.new_wallet_address) {
                    from = transaction.new_wallet_address;
                }

                let transactionObject: Transaction = {
                    id: 0,
                    hash: transferResult.hash,
                    message: transferResult.message,
                    result: transferResult.result,
                    start_matic: ethers.formatEther(startMaticBalance),
                    end_matic: ethers.formatEther(maticNow),
                    symbol_selected_token: transaction.symbol_selected_token,
                    start_selected_token: ethers.formatEther(startSelectedTokenBalance),
                    end_selected_token: ethers.formatEther(selectedTokenNow),
                    new_wallet_address: transaction.new_wallet_address,
                    new_wallet_private_key: transaction.new_wallet_private_key,
                    from_address: from,
                    to_address: destinyAddress,
                    type: 'airdrop',
                    airdrop_status: transferResult.status,
                    status: transferResult.status,
                    need_airdrop: 0
                };

                transactionObject = setTransactionBotId(transactionObject, botType, botId);

                if (transferResult.status == 1) {
                    await transactionRepository.create(transactionObject);
                    await transactionRepository.changeAirdropStatus(transaction.id);
                }

                console.log(`[Transaction - ${transaction.id}] airdrop finish: status ${transferResult.status}`);
            } else {
                await transactionRepository.changeAirdropStatus(transaction.id);
                console.log(`[Transaction - ${transaction.id}] cant proceed, actual matic is ${startSelectedTokenBalanceFormatted}, MATIC gas is ${maticTaxFormatted}`);
            }
        } else {
            await transactionRepository.changeAirdropStatus(transaction.id);
            console.log(`[Transaction - ${transaction.id}] does not have a private key, airdrop was updated`);
        }
    } catch (error) {
        console.log(`[Airdrop] Transaction ${transaction.hash} | maticAirdrop error`, error);
    }
}

export async function doCycle(
    executionId: number,
    botId: number,
    botName: string,
    botType: keyof Transaction,
    helperPrivateKey: string,
    tokenSymbol: string,
    tokenAddress: string,
    mainGhost: ethers.HDNodeWallet,
    listGhosts: ethers.HDNodeWallet[]
) {
    try {
        const half = Math.floor(listGhosts.length / 2);
        const leftSide = listGhosts.slice(0, half);
        const rightSide = listGhosts.slice(half).reverse();

        const parallelExec = async (ghosts: ethers.HDNodeWallet[], pos: string) => {
            if (pos == 'LEFT') {
                await new Promise(resolve => setTimeout(resolve, 3000));
            }

            for (let i = 0; i < ghosts.length; i++) {
                const currentGhost = ghosts[i];
                let nextGhost = null;

                if (i + 1 === ghosts.length) {
                    console.log(`[${botType}] ${botName} is seeding ${pos} MAIN`);
                    nextGhost = mainGhost;
                } else {
                    console.log(`[${botType}] ${botName} is seeding ${pos} PARALLEL`);
                    nextGhost = ghosts[i + 1];
                }

                let needsPartialSend = true;

                if (i > 0) {
                    needsPartialSend = false;
                }

                const currentGhostTokenAmount = await getSelectedTokenBalance2(currentGhost, tokenAddress);
                const currentGhostPolAmount = await getMaticBalance(currentGhost);

                await doTransferFlow(
                    executionId,
                    botId,
                    botName,
                    botType,
                    tokenSymbol,
                    tokenAddress,
                    helperPrivateKey,
                    currentGhost,
                    nextGhost,
                    currentGhostTokenAmount,
                    needsPartialSend,
                    currentGhostPolAmount
                );
            }
        };

        console.log(`[${botType}] ${botName} starting parallels...`);
        await Promise.all([
            parallelExec(leftSide, 'LEFT'),
            parallelExec(rightSide, 'RIGHT')
        ]);
    } catch (error) {
        throw error;
    }
}

export async function doCyclePol(
    executionId: number,
    botId: number,
    botName: string,
    botType: keyof Transaction,
    mainGhost: ethers.HDNodeWallet,
    listGhosts: ethers.HDNodeWallet[]
) {
    try {
        const half = Math.floor(listGhosts.length / 2);
        const leftSide = listGhosts.slice(0, half);
        const rightSide = listGhosts.slice(half).reverse();

        const parallelExec = async (ghosts: ethers.HDNodeWallet[], pos: string) => {
            if (pos == 'LEFT') {
                await new Promise(resolve => setTimeout(resolve, 3000));
            }

            for (let i = 0; i < ghosts.length; i++) {
                const currentGhost = ghosts[i];
                let nextGhost = null;

                if (i + 1 === ghosts.length) {
                    console.log(`[${botType}] ${botName} is seeding [POL] from ${pos} MAIN`);
                    nextGhost = mainGhost;
                } else {
                    console.log(`[${botType}] ${botName} is seeding [POL] from ${pos} PARALLEL`);
                    nextGhost = ghosts[i + 1];
                }

                const currentGhostPolAmount = await getMaticBalance(currentGhost);

                await doTransferFlowPol(
                    executionId,
                    botId,
                    botName,
                    botType,
                    currentGhost,
                    nextGhost,
                    currentGhostPolAmount
                );
            }
        };

        console.log(`[${botType}] ${botName} starting parallels...`);
        await Promise.all([
            parallelExec(leftSide, 'LEFT'),
            parallelExec(rightSide, 'RIGHT')
        ]);
    } catch (error) {
        throw error;
    }
}

export async function doTransferFlow(
    executionId: number,
    botId: number,
    botName: string,
    botType: keyof Transaction,
    tokenSymbol: string,
    tokenAddress: string,
    helperPrivateKey: string,
    signerSender: Signer,
    signerReceiver: HDNodeWallet,
    tokenAmount: bigint,
    doubleTransfer: boolean,
    polAmount: bigint,
    destinyAddress: string = '',
    transferType: string = '',
    needPolRecalc: boolean = false
) {
    try {
        let polMultTax = 1;
        let finalTokens = [tokenAmount];

        if (doubleTransfer) {
            finalTokens = divideAmount(tokenAmount);
        }

        let destiny = signerReceiver.address;

        if (transferType == 'destiny') {
            destiny = destinyAddress;
        }

        for (let index = 0; index < finalTokens.length; index++) {
            const element = finalTokens[index];

            const actualTokenBalance = await getSelectedTokenBalance2(signerSender, tokenAddress);

            if (actualTokenBalance >= element && actualTokenBalance > BigInt(0)) {
                polMultTax = polMultTax + 1;

                await checkHelper(
                    executionId,
                    botId,
                    botName,
                    botType,
                    helperPrivateKey,
                    signerSender
                );

                const transferToken = await doTransfer(
                    executionId,
                    botId,
                    botName,
                    botType,
                    signerSender,
                    signerReceiver,
                    signerReceiver.privateKey,
                    tokenSymbol,
                    tokenAddress,
                    destiny,
                    element,
                    0,
                    transferType
                );

                if (transferToken.status !== 1) {
                    throw `Transfer [${tokenSymbol}] fail`;
                }
            }
        }

        if (polAmount > BigInt(0) || needPolRecalc) {
            const getFeeData = await getGasFeePrices();
            const tax = (getFeeData.gasPrice * BigInt(50000 * polMultTax));
            const ToSendPol = polAmount - tax;

            if (ToSendPol > tax) {
                const transferPol = await doTransfer(executionId,
                    botId,
                    botName,
                    botType,
                    signerSender,
                    signerReceiver,
                    signerReceiver.privateKey,
                    'POL',
                    settings.MATIC_ADDRESS,
                    destiny,
                    ToSendPol,
                    0,
                    transferType
                );

                if (transferPol.status !== 1) {
                    throw `Transfer [POL] fail`;
                }
            }
        }
    } catch (error) {
        throw error;
    }
}

export async function doTransferFlowPol(
    executionId: number,
    botId: number,
    botName: string,
    botType: keyof Transaction,
    signerSender: Signer,
    signerReceiver: HDNodeWallet,
    polAmount: bigint
) {
    try {
        let destiny = signerReceiver.address;

        if (polAmount > BigInt(0)) {
            const getFeeData = await getGasFeePrices();
            const tax = (getFeeData.gasPrice * BigInt(50000));
            const ToSendPol = polAmount - tax;

            if (ToSendPol > tax) {
                const transferPol = await doTransfer(executionId,
                    botId,
                    botName,
                    botType,
                    signerSender,
                    signerReceiver,
                    signerReceiver.privateKey,
                    'POL',
                    settings.MATIC_ADDRESS,
                    destiny,
                    ToSendPol
                );

                if (transferPol.status !== 1) {
                    throw `Transfer [POL] fail`;
                }
            }
        }
    } catch (error) {
        throw error;
    }
}

export async function checkHelper(executionId: number, botId: number, botName: string, botType: keyof Transaction, helperPrivateKey: string, signerReceiver: Signer, isSwap: boolean = false) {
    try {
        const currentPolBalance = await getMaticBalance(signerReceiver);
        const gasFee = await getGasFeePrices();
        let taxCalc = 60000;

        if (isSwap) {
            taxCalc = 300000;
        }

        const tax = gasFee.gasPrice * BigInt(taxCalc);

        if (currentPolBalance < tax) {
            console.log(`[${botType}] starting [AUTO HELPER]...`);
            const signerHelper = await getSigner(helperPrivateKey);
            const toAddress = await signerReceiver.getAddress();

            const helperResponse = await doTransfer(
                executionId,
                botId,
                botName,
                botType,
                signerHelper,
                signerReceiver,
                '',
                'POL',
                settings.MATIC_ADDRESS,
                toAddress,
                tax
            );

            if (helperResponse.status != 1) {
                throw 'Helper feed failed';
            }

            console.log(`[${botType}] success [AUTO HELPER]...`);
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
    } catch (error) {
        throw error;
    }
}

export async function doTransfer(
    executionId: number,
    botId: number,
    botName: string,
    botType: keyof Transaction,
    signerSender: Signer,
    signerReceiver: Signer,
    newWalletPrivateKey: string,
    tokenSymbol: string,
    tokenAddress: string,
    destinyAddress: string,
    amount: bigint,
    holderPercent: number = 0,
    transferType: string = ''
): Promise<TransactionResponse> {
    const transactionRepository = new TransactionRepository();
    const fromWalletAddress = await signerSender.getAddress();
    tokenSymbol = tokenSymbol.toUpperCase();

    try {
        const finalTransferType = transferType ? transferType : 'transfer';
        console.log(`[Transfer] ${botName} ${finalTransferType}ing [${tokenSymbol}]...`);
        let finalAmount = amount;

        if (holderPercent > 0) {
            finalAmount = removePercent(amount, holderPercent);
        }

        if (finalAmount <= BigInt(0) && settings.WITH_PAYMENT == 'y') {
            throw `You can't send [${tokenSymbol}] zero or negative amount: ${finalAmount}`;
        }

        const maticStart = await getMaticBalance(signerReceiver);
        const startSelectedToken = await getSelectedTokenBalance2(signerReceiver, tokenAddress);

        let newWalletAddress = '';

        if (newWalletPrivateKey) {
            const newWalletSigner = await getSigner(newWalletPrivateKey);
            newWalletAddress = await newWalletSigner.getAddress();
        }

        let transaction: Transaction = {
            id: 0,
            hash: '',
            start_matic: ethers.formatEther(maticStart),
            end_matic: '0',
            symbol_selected_token: tokenSymbol,
            start_selected_token: ethers.formatEther(startSelectedToken),
            end_selected_token: '0',
            new_wallet_address: newWalletAddress,
            new_wallet_private_key: newWalletPrivateKey,
            from_address: fromWalletAddress,
            to_address: destinyAddress,
            message: '',
            result: '',
            status: 0,
            type: finalTransferType.toLowerCase(),
            airdrop_status: 0,
            need_airdrop: 0,
            bot_execution: executionId
        };

        transaction = setTransactionBotId(transaction, botType, botId);
        transaction = await transactionRepository.create(transaction);

        const resTransfer = await transferTokenTo(signerSender, tokenAddress, tokenSymbol, destinyAddress, finalAmount, finalTransferType);

        let maticNow = maticStart;
        let selectedTokenNow = startSelectedToken;

        let needAirdrop = 0;

        let finalTxStatus = 0;

        if (resTransfer.status == 1) {
            finalTxStatus = 1;
            maticNow = await getMaticBalance(signerReceiver);
            selectedTokenNow = await getSelectedTokenBalance2(signerReceiver, tokenAddress);

            if (botType == 'bot_address') {
                await new BotAddressRepository().updateSpentBalance(botId, amount);
            } else if (botType == 'trade_bot' && transferType == '') {
                await new TradeBotRepository().updateSpentBalance(botId, amount);
            }
        } else {
            needAirdrop = 1;
            finalTxStatus = 2;
        }

        transaction.hash = resTransfer.hash;
        transaction.end_matic = ethers.formatEther(maticNow);
        transaction.end_selected_token = ethers.formatEther(selectedTokenNow);
        transaction.message = resTransfer.message;
        transaction.result = resTransfer.result;
        transaction.status = finalTxStatus;
        transaction.need_airdrop = needAirdrop;

        await transactionRepository.update(transaction);
        console.log(`[Transfer] ${botName} ${finalTransferType}ed [${tokenSymbol}] ${resTransfer.message} | Status: ${finalTxStatus}`);
        return resTransfer;
    } catch (error) {
        console.log(`[Transfer] [${botName}] | doTransfer error`, error);

        const errorTransaction = await transactionRepository.getLastTransaction(executionId, botId, botType, tokenSymbol, fromWalletAddress);
        errorTransaction.message = JSON.stringify(error);
        errorTransaction.status = 2;
        await transactionRepository.update(errorTransaction);

        return { hash: '', message: JSON.stringify(error), result: [], status: errorTransaction.status };
    }
}

export async function doTransferBasic(
    executionId: number,
    botId: number,
    botName: string,
    botType: keyof Transaction,
    signerSender: Signer,
    destinyAddress: string,
    amount: bigint,
    tokenDetails: AcceptedToken,
    transferType: string = ''
): Promise<TransactionResponse> {
    const transactionRepository = new TransactionRepository();
    const fromWalletAddress = await signerSender.getAddress();

    try {
        const finalTransferType = transferType ? transferType : 'transfer';
        console.log(`[Transfer] ${botName} ${finalTransferType}ing [${tokenDetails.symbol}]...`);
        let finalAmount = amount;

        if (finalAmount <= BigInt(0) && settings.WITH_PAYMENT == 'y') {
            throw `You can't send [${tokenDetails.symbol}] zero or negative amount: ${finalAmount}`;
        }

        const maticStart = await getMaticBalance(signerSender);
        const startSelectedToken = await getSelectedTokenBalance2(signerSender, tokenDetails.address);

        let transaction: Transaction = {
            id: 0,
            hash: '',
            start_matic: ethers.formatEther(maticStart),
            end_matic: '0',
            symbol_selected_token: tokenDetails.symbol,
            start_selected_token: ethers.formatUnits(startSelectedToken, tokenDetails.decimals),
            end_selected_token: '0',
            new_wallet_address: '',
            new_wallet_private_key: '',
            from_address: fromWalletAddress,
            to_address: destinyAddress,
            message: '',
            result: '',
            status: 0,
            type: finalTransferType.toLowerCase(),
            airdrop_status: 0,
            need_airdrop: 0,
            bot_execution: executionId
        };

        transaction = setTransactionBotId(transaction, botType, botId);
        transaction = await transactionRepository.create(transaction);

        const resTransfer = await transferTokenTo(signerSender, tokenDetails.address, tokenDetails.symbol, destinyAddress, finalAmount, finalTransferType, tokenDetails.decimals);

        let maticNow = maticStart;
        let selectedTokenNow = startSelectedToken;

        let needAirdrop = 0;

        let finalTxStatus = 0;

        if (resTransfer.status == 1) {
            finalTxStatus = 1;
            maticNow = await getMaticBalance(signerSender);
            selectedTokenNow = await getSelectedTokenBalance2(signerSender, tokenDetails.address);

            if (botType == 'bot_address') {
                await new BotAddressRepository().updateSpentBalance(botId, amount);
            } else if (botType == 'trade_bot' && transferType == '') {
                await new TradeBotRepository().updateSpentBalance(botId, amount);
            }
        } else {
            needAirdrop = 1;
            finalTxStatus = 2;
        }

        transaction.hash = resTransfer.hash;
        transaction.end_matic = ethers.formatEther(maticNow);
        transaction.end_selected_token = ethers.formatUnits(selectedTokenNow, tokenDetails.decimals);
        transaction.message = resTransfer.message;
        transaction.result = resTransfer.result;
        transaction.status = finalTxStatus;
        transaction.need_airdrop = needAirdrop;

        await transactionRepository.update(transaction);
        console.log(`[Transfer] ${botName} ${finalTransferType}ed [${tokenDetails.symbol}] ${resTransfer.message} | Status: ${finalTxStatus}`);
        return resTransfer;
    } catch (error) {
        console.log(`[Transfer] [${botName}] | doTransfer error`, error);

        const errorTransaction = await transactionRepository.getLastTransaction(executionId, botId, botType, tokenDetails.symbol, fromWalletAddress);
        errorTransaction.message = JSON.stringify(error);
        errorTransaction.status = 2;
        await transactionRepository.update(errorTransaction);

        return { hash: '', message: JSON.stringify(error), result: [], status: errorTransaction.status };
    }
}

//============================================================

export async function transferTokenTo(
    signer: Signer,
    tokenAddress: string,
    tokenSymbol: string,
    to: string,
    amount: bigint,
    txFunction: string,
    decimals: number = 18
): Promise<TransactionResponse> {
    try {
        tokenSymbol = tokenSymbol.toUpperCase();

        let contractFunctions;

        switch (txFunction) {
            case 'deposit':
                contractFunctions = ['function deposit() payable'];
                break;

            case 'withdraw':
                contractFunctions = ['function withdraw(uint256 wad) public'];
                break;

            default:
                contractFunctions = contracts.ERC20_ABI;
                break;
        }

        const tokenContract = new ethers.Contract(tokenAddress, contractFunctions, signer);
        let getFeeData = await getGasFeePrices();

        let tx: TransactionRequest;

        switch (txFunction) {
            case 'deposit':
                tx = {
                    to: to,
                    value: amount,
                    data: tokenContract.interface.encodeFunctionData(txFunction),
                    gasPrice: getFeeData.gasPrice
                };

                break;

            case 'withdraw':
                tx = {
                    to: to,
                    value: BigInt(0),
                    data: tokenContract.interface.encodeFunctionData(txFunction, [amount]),
                    gasPrice: getFeeData.gasPrice
                };

                break;

            default:
                tx = {
                    to: to,
                    value: amount,
                    gasPrice: getFeeData.gasPrice
                };

                if (tokenSymbol !== 'MATIC' && tokenSymbol !== 'POL') {
                    tx.to = tokenAddress;
                    tx.value = BigInt(0);
                    tx.data = tokenContract.interface.encodeFunctionData('transfer', [to, amount]);
                }

                break;
        }

        let transfer;

        if (settings.WORKSPACE == 'local' && settings.WITH_PAYMENT == 'n') {
            transfer = { hash: '0x', status: 1, message: 'Test success', result: 'only test' };
        } else {
            transfer = await sendTransaction(tx, signer);

            let attempt = 0;

            while (transfer.status == 0 && attempt < 5) {
                attempt = attempt + 1;
                console.log(`[Transfer] ${ethers.formatUnits(amount, decimals)} ${tokenSymbol} to ${to} failed on attempt ${attempt}, trying again...`);
                await new Promise(resolve => setTimeout(resolve, 15000));

                if (tokenSymbol !== 'MATIC' && tokenSymbol !== 'POL') {
                    getFeeData = await getGasFeePrices();
                    tx.gasPrice = getFeeData.gasPrice;
                }

                transfer = await sendTransaction(tx, signer);
            }
        }

        return transfer;
    } catch (error) {
        if (error instanceof Error) {
            return { hash: '', message: error.message, result: [], status: 2 };
        } else {
            return { hash: '', message: JSON.stringify(error), result: [], status: 2 };
        }
    }
}

function setTransactionBotId(transaction: Transaction, botType: keyof Transaction, botId: number): Transaction {
    try {
        switch (botType) {
            case 'bot_address':
                transaction.bot_address = botId;
                break;

            case 'volume_bot':
                transaction.volume_bot = botId;
                break;

            case 'distribution_bot_wallet':
                transaction.distribution_bot_wallet = botId;
                break;

            case 'seed_bot':
                transaction.seed_bot = botId;
                break;

            case 'trade_bot':
                transaction.trade_bot = botId;
                break;

            default:
                throw new Error('Transaction type is wrong');
        }

        return transaction;
    } catch (error) {
        console.log('setTransactionBotId error', error);
        return transaction;
    }
}