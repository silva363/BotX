import { v4 as uuidv4 } from 'uuid';
import { generateNewWallet, getMaticBalance, getSelectedTokenBalance2, getSigner, getTokenPrice, getWmaticBalance } from '../helpers/ethersHelper';
import { AcceptedTokenRepository } from '../repositories/acceptedTokenRepository';
import { BotExecutionRepository } from '../repositories/botExecutionRepository';
import { TransactionRepository } from '../repositories/transactionRepository';
import { HDNodeWallet, Signer, ethers } from 'ethers';
import { calcStartTime, distributeTotalAmount, getRange, getTokenRange, removeVolumeBotFromList, timerCountdown } from '../helpers/functionsHelper';
import { doTransfer, maticAirdrop, selectedTokenAirdrop, swapBuy, swapMaticForWmatic, swapSell, swapWmaticForMatic } from './transactionService';
import { VolumeBot } from '../models/VolumeBot';
import { VolumeBotRepository } from '../repositories/volumeBotRepository';
import { settings } from '../utils/settings';
import { getGasFeePrices } from '../helpers/cryptoHelper';
import { VolumeBotSigner } from '../models/VolumeBotSigner';
import { Airdrop } from '../models/Airdrop';
import { AirdropRepository } from '../repositories/airdropRepository';

const listBots: VolumeBot[] = [];
const type = 'Volume';

export class VolumeBotService {
  private volumeBotRepository: VolumeBotRepository;
  private acceptedTokenRepository: AcceptedTokenRepository;
  private botExecutionRepository: BotExecutionRepository;

  constructor() {
    this.volumeBotRepository = new VolumeBotRepository();
    this.acceptedTokenRepository = new AcceptedTokenRepository();
    this.botExecutionRepository = new BotExecutionRepository();
  }

  async create(
    userId: number,
    name: string,
    tokenSymbol: string,
    accountPrivateKeyBuy: string,
    privateKeyBuyFriendlyName: string,
    accountPrivateKeySell: string,
    privateKeySellFriendlyName: string,
    minAmount: number,
    maxAmount: number,
    minDelay: number,
    maxDelay: number,
    sellSwapTimes: number,
    slippageTolerance: number,
    delayToStart: number,
    airdropTime: number
  ): Promise<void> {
    try {
      if (maxAmount < minAmount) {
        throw 'Maximum quantity must be greater than the minimum quantity';
      }

      if (maxDelay < minDelay) {
        throw 'Maximum delay must be greater than the minimum delay';
      }

      const tokenData = await this.acceptedTokenRepository.findBySymbol(tokenSymbol);

      if (!tokenData) {
        throw 'This symbol is not setup';
      }

      if (!tokenData.active) {
        throw 'This symbol is inactive';
      }

      const botUuid = uuidv4();

      const volumeBot: VolumeBot = {
        uuid: botUuid,
        user_id: userId,
        name: name,
        min_amount: minAmount,
        max_amount: maxAmount,
        min_delay: minDelay,
        max_delay: maxDelay,
        sell_swap_times: sellSwapTimes,
        slippage_tolerance: slippageTolerance,
        delay_to_start: delayToStart,
        airdrop_time: airdropTime,
        active: false,
        active_airdrop: false,
        need_wait: false,
        account_private_key_buy: accountPrivateKeyBuy,
        account_private_key_sell: accountPrivateKeySell,
        private_key_buy_friendly_name: privateKeyBuyFriendlyName,
        private_key_sell_friendly_name: privateKeySellFriendlyName,
        token_name: tokenData.name,
        token_symbol: tokenData.symbol,
        token_address: tokenData.address
      };

      await this.volumeBotRepository.create(volumeBot);
    } catch (error) {
      throw error;
    }
  }

  async edit(
    userId: number,
    uuid: string,
    name: string,
    tokenSymbol: string,
    accountPrivateKeyBuy: string,
    privateKeyBuyFriendlyName: string,
    accountPrivateKeySell: string,
    privateKeySellFriendlyName: string,
    minAmount: number,
    maxAmount: number,
    minDelay: number,
    maxDelay: number,
    sellSwapTimes: number,
    slippageTolerance: number,
    delayToStart: number,
    airdropTime: number
  ): Promise<void> {
    try {
      if (maxAmount < minAmount) {
        throw 'Maximum quantity must be greater than the minimum quantity';
      }

      if (maxDelay < minDelay) {
        throw 'Maximum delay must be greater than the minimum delay';
      }

      const tokenData = await this.acceptedTokenRepository.findBySymbol(tokenSymbol);

      if (!tokenData) {
        throw 'This symbol is not setup';
      }

      if (!tokenData.active) {
        throw 'This symbol is inactive';
      }

      const botData = await this.volumeBotRepository.find(uuid, userId);

      if (!botData) {
        throw 'Bot was not found';
      }

      if (botData.active) {
        throw 'Stop bot before edit';
      }

      const volumeBot: VolumeBot = {
        uuid: botData.uuid,
        user_id: userId,
        name: name,
        min_amount: minAmount,
        max_amount: maxAmount,
        min_delay: minDelay,
        max_delay: maxDelay,
        sell_swap_times: sellSwapTimes,
        slippage_tolerance: slippageTolerance,
        delay_to_start: delayToStart,
        airdrop_time: airdropTime,
        active: false,
        active_airdrop: false,
        need_wait: false,
        account_private_key_buy: accountPrivateKeyBuy,
        account_private_key_sell: accountPrivateKeySell,
        private_key_buy_friendly_name: privateKeyBuyFriendlyName,
        private_key_sell_friendly_name: privateKeySellFriendlyName,
        token_name: tokenData.name,
        token_symbol: tokenData.symbol,
        token_address: tokenData.address
      };

      await this.volumeBotRepository.update(volumeBot);
    } catch (error) {
      throw error;
    }
  }

  async hideUnhide(userId: number, uuid: string) {
    const botData = await this.volumeBotRepository.find(uuid, userId);

    if (!botData) {
      throw 'Bot was not found';
    }

    let status = 0;

    if (!botData.is_hidden) {
      status = 1;
    }

    await this.volumeBotRepository.changeHidden(botData.uuid, status);

    if (status) {
      await this.stop(userId, botData.uuid);

      return 'hide'
    } else {
      return 'unhide';
    }
  }

  async find(userId: number, uuid: string) {
    const bot = await this.volumeBotRepository.find(uuid, userId);

    return bot;
  }

  async list(userId: number) {
    const listBots = await this.volumeBotRepository.list(userId);

    return listBots;
  }

  async listHidden(userId: number) {
    const listBots = await this.volumeBotRepository.listInactives(type, userId);

    return listBots;
  }

  async executions(userId: number, uuid: string, page: number, symbol: string, startDate: string, endDate: string) {
    if (page < 1) {
      page = 1;
    }

    const botData = await this.volumeBotRepository.find(uuid, userId);

    if (!botData) {
      throw 'Bot was not found';
    }

    const executions = await this.botExecutionRepository.list(botData.id!, page, startDate, endDate, 'volume_bot');
    const details = await this.volumeBotRepository.executionsDetails(botData.id!, symbol, startDate, endDate);

    return {
      'details': details,
      'executions': executions
    };
  }

  async transactions(executionId: number, userId: number, uuid: string, page: number, symbol: string, startDate: string, endDate: string) {
    if (page < 1) {
      page = 1;
    }

    const botData = await this.volumeBotRepository.find(uuid, userId);

    if (!botData) {
      throw 'Bot was not found';
    }

    const transactions = await this.volumeBotRepository.transactions(botData.id!, executionId, page, symbol, startDate, endDate);
    const details = await this.volumeBotRepository.transactionsDetails(botData.id!, executionId, symbol, startDate, endDate);

    return {
      'details': details,
      'transactions': transactions
    };
  }

  async run(userId: number, uuid: string, fromFront: boolean, isNewExecution: boolean, executionId: number) {
    try {
      const response = await this.runCheckStep1(userId, uuid, fromFront);

      if (!response || !response.canRun) {
        console.log(`[${type}] ${uuid} can't run now`);
        return;
      }

      const volumeBot = response.volumeBot;
      const signer = response.signer;

      await new Promise(resolve => setTimeout(resolve, 1000));
      const isRunning = listBots.findIndex((listData) => listData.uuid === volumeBot.uuid);

      if (isRunning != -1) {
        const message = `[${type}] ${volumeBot.name} is already running`;

        if (fromFront) {
          throw message;
        } else {
          console.log(message);
          return false;
        }
      }

      listBots.push(volumeBot);

      const response2 = await this.runCheckStep2(volumeBot, fromFront, isNewExecution, executionId);

      if (!response2 || !response2.canRun) {
        console.log(`[${type}] ${uuid} can't run at now`);
        return;
      }

      runCheckStep3(volumeBot, response2.executionId, response2.delay, signer);
      return response2.message;
    } catch (error) {
      if (fromFront) {
        throw error;
      } else {
        console.log(`[${type}] ${uuid} | run error ${error}`);
      }
    }
  }

  async stop(userId: number, uuid: string): Promise<void> {
    const botData = await this.volumeBotRepository.find(uuid, userId);

    if (!botData) {
      throw 'Bot was not found';
    }

    await removeVolumeBotFromList(listBots, botData.uuid);
  }

  async runCheckStep1(userId: number, uuid: string, fromFront: boolean) {
    try {
      const response = await doPreValidations(userId, uuid, fromFront);

      if (!response) {
        console.log(`[${type}] ${uuid} can't run now`);
        return;
      }

      const volumeBot: VolumeBot = response;

      const signer = await getSigner(volumeBot.account_private_key_buy);
      const selectedTokenBalance = await getMaticBalance(signer);

      if (selectedTokenBalance == BigInt(0)) {
        const message = `[${type}] ${volumeBot.name} doesn't have a necessary MATIC balance to proceed`;

        if (fromFront) {
          throw message;
        } else {
          console.log(message);
          return;
        }
      }

      await this.volumeBotRepository.changeActive(volumeBot.uuid, 1);

      return { volumeBot: volumeBot, signer: signer, canRun: true };
    } catch (error) {
      if (fromFront) {
        throw error;
      } else {
        console.log(`[${type}] ${uuid} | runCheckStep1 error ${error}`);
      }
    }
  }

  async runCheckStep2(volumeBot: VolumeBot, fromFront: boolean, isNewExecution: boolean, executionId: number) {
    try {
      if (isNewExecution) {
        executionId = await this.botExecutionRepository.startExecution(volumeBot.id!, 'volume_bot', true);
      }

      await this.volumeBotRepository.changeNeedWait(volumeBot.uuid, 0);

      const response = await calcStartTime(
        type,
        volumeBot.name,
        volumeBot.id!,
        'volume_bot',
        volumeBot.id!,
        'volume_bot',
        volumeBot.delay_to_start!,
        volumeBot.min_delay,
        volumeBot.max_delay,
        isNewExecution
      );

      return { executionId: executionId, delay: response.delay, message: response.message, canRun: true };
    } catch (error) {
      if (fromFront) {
        throw error;
      } else {
        console.log(`[${type}] ${volumeBot.uuid} | runCheckStep2 error ${error}`);
      }
    }
  }

  async doAirdrop(userId: number, uuid: string, txHash: string, destinyAddress: string = '', fromFront: boolean) {
    try {
      const volumeBot = await this.volumeBotRepository.find(uuid, userId);

      if (!volumeBot) {
        throw 'Bot was not found';
      }

      await executeAirdrop(volumeBot, txHash, destinyAddress, fromFront);

      if (fromFront) {
        return 'Airdrop successful';
      } else {
        console.log(`[${type}] ${uuid} airdrop successful`);
      }
    } catch (error) {
      if (fromFront) {
        throw error;
      } else {
        console.log(`[${type}] ${uuid} | run error ${error}`);
      }
    }
  }
}

async function doPreValidations(userId: number, uuid: string, fromFront: boolean): Promise<VolumeBot | false> {
  try {
    const volumeBotRepository = new VolumeBotRepository();
    const botData = await volumeBotRepository.find(uuid, userId);

    if (!botData) {
      const message = `Bot was not found`;

      if (fromFront) {
        throw message;
      } else {
        console.log(message);
        return false;
      }
    }

    if (botData.is_hidden) {
      const message = `[${type}] ${botData.name} can't run because is hidden`;

      if (fromFront) {
        throw message;
      } else {
        console.log(message);
        return false;
      }
    }

    return botData;
  } catch (error) {
    console.log(`[${type}] ${uuid} | doPreValidations error ${error}`);

    if (fromFront) {
      throw error;
    }

    return false;
  }
}

async function checkRunning(volumeBot: VolumeBot, executionId: number, type: string): Promise<boolean> {
  try {
    const volumeBotRepository = new VolumeBotRepository();
    const isRunning = await volumeBotRepository.isRunning(volumeBot.uuid);

    const botExecutionRepository = new BotExecutionRepository();
    const isExecutionRunning = await botExecutionRepository.isRunning(volumeBot.id!, executionId, 'volume_bot');

    if (!isRunning || !isExecutionRunning) {
      const botExecutionRepository = new BotExecutionRepository();
      await botExecutionRepository.changeActive(executionId, 0);
      console.log(`[${type}] ${volumeBot.name} running successful ended`);
      return false;
    }

    return true;
  } catch (error) {
    console.log(`[${type}] ${volumeBot.name} | checkRunning error ${error}`);
    return false;
  }
}

async function runCheckStep3(volumeBot: VolumeBot, executionId: number, delayToStart: number, signer: Signer) {
  try {
    if (!await checkRunning(volumeBot, executionId, type)) {
      return;
    }

    const secondsDelay = delayToStart / 1000;
    timerCountdown(secondsDelay, `[${type}] ${volumeBot.name} will start`, false);
    await new Promise(resolve => setTimeout(resolve, delayToStart));

    if (!await checkRunning(volumeBot, executionId, type)) {
      return;
    }

    const refreshVolumeBot = await new VolumeBotRepository().find(volumeBot.uuid, volumeBot.user_id);

    if (refreshVolumeBot) {
      volumeBot = refreshVolumeBot;
    }

    console.log(`[${type}] ${volumeBot.name} is running`);

    if (volumeBot.need_wait) {
      const delay = 10 * 1000;
      console.log(`[${type}] ${volumeBot.name} need to wait`);
      runCheckStep3(volumeBot, executionId, delay, signer);
      return;
    }

    await startFlow(volumeBot, executionId, signer);
  } catch (error) {
    await forceStop(volumeBot, executionId);
    console.log(`[${type}] ${volumeBot.name} | runCheckStep3 error ${error}`);
  }
}

async function startFlow(volumeBot: VolumeBot, executionId: number, signer: Signer) {
  try {
    const amount = getTokenRange(volumeBot.min_amount, volumeBot.max_amount);
    const balanceMatic = await getMaticBalance(signer);

    let getFeeData = await getGasFeePrices();
    let maticTax = getFeeData.gasPrice * BigInt(300000);
    maticTax = maticTax * BigInt(2);

    const maticNeededToBuy = amount + maticTax;

    if (balanceMatic > 0 && balanceMatic > maticNeededToBuy) {
      await doTransactions(volumeBot, signer, amount, maticNeededToBuy, executionId);
    } else {
      console.log(`[${type}] ${volumeBot.name} insuficient Matic balance`);
      runCheckStep3(volumeBot, executionId, 60 * 1000, signer);
    }
  } catch (error) {
    await forceStop(volumeBot, executionId);
    console.log(`[${type}] ${volumeBot.name} | startFlow error`, error);
  }
}

async function doTransactions(volumeBot: VolumeBot, signer: Signer, maticAmount: bigint, maticNeededToBuy: bigint, executionId: number) {
  try {
    console.log(`[${type}] ${volumeBot.name} starting transactions...`);

    const acceptedTokenRepository = new AcceptedTokenRepository();
    const tokenDetails = await acceptedTokenRepository.findByAddress(volumeBot.token_address);

    if (!tokenDetails) {
      throw 'Token details not found';
    }

    const newWallet = await generateNewWallet(signer.provider!);

    if (!newWallet) {
      await removeVolumeBotFromList(listBots, volumeBot.uuid);
      throw 'Error generating new wallet';
    }

    const volumeBotRepository = new VolumeBotRepository();
    await volumeBotRepository.changeNeedWait(volumeBot.uuid, 1);
    const newWalletSigner = await getSigner(newWallet.privateKey);

    const resCharge = await doTransfer(
      executionId,
      volumeBot.id!,
      volumeBot.name,
      'volume_bot',
      signer,
      newWalletSigner,
      newWallet.privateKey,
      'MATIC',
      settings.MATIC_ADDRESS,
      newWallet.address,
      maticNeededToBuy
    );

    await volumeBotRepository.changeNeedWait(volumeBot.uuid, 0);

    if (resCharge.status == 1) {
      console.log(`[${type}] ${volumeBot.name} recharge buy wallet success`);

      const txHashBefore = resCharge.hash;
      const maticPriceUsd = await getTokenPrice(signer, settings.MATIC_USD_ADDRESS, 'USDT', 'Tether USD', 6, null);
      const tokenPrice = await getTokenPrice(signer, volumeBot.token_address, volumeBot.token_symbol, volumeBot.token_name, 18, tokenDetails);
      const maticPrice = await getTokenPrice(signer, settings.MATIC_ADDRESS, 'MATIC', 'MATIC', 18, tokenDetails);
      const selectedTokenPrice = tokenPrice / maticPriceUsd;
      const finalMaticPrice = (maticPrice / maticPriceUsd) * 0.1;
      const maxMaticPrice = finalMaticPrice * Number(ethers.formatEther(maticAmount));
      const tokenAmount = ethers.parseEther((maxMaticPrice / selectedTokenPrice).toString());
      const signerTokenBalance = await getSelectedTokenBalance2(signer, volumeBot.token_address);

      if (signerTokenBalance < tokenAmount) {
        console.log(`[${type}] ${volumeBot.name} insuficient ${volumeBot.token_symbol} balance, restarting...`);
        await doRefund(volumeBot, executionId, txHashBefore, 'buy');
        restartExecution(volumeBot, executionId);
        return;
      }

      const swapAmount = distributeTotalAmount(Number(ethers.formatEther(tokenAmount)), volumeBot.sell_swap_times);
      console.log(`[${type}] ${volumeBot.name} swapAmounts ${swapAmount}`);

      const sellSigners: Array<VolumeBotSigner> = [];

      let seedSellersSuccess = true;

      for (let index = 0; index < volumeBot.sell_swap_times; index++) {
        const finalSwapSellAmount = ethers.parseEther(swapAmount[index].toString());

        const seedSellResults = await verifySellFlow(volumeBot, executionId, signer, finalSwapSellAmount, 0, volumeBot.sell_swap_times, index + 1);

        if (seedSellResults.success) {
          sellSigners.push(seedSellResults);
        } else {
          console.log(`[${type}] ${volumeBot.name} sell flow ${index + 1}/${volumeBot.sell_swap_times} failed`);
          seedSellersSuccess = false;
          index = volumeBot.sell_swap_times;
        }
      }

      console.log(`[${type}] ${volumeBot.name} success ${sellSigners.length}/${volumeBot.sell_swap_times} sells seeded`);

      if (seedSellersSuccess == false) {
        for (let index = 0; index < sellSigners.length; index++) {
          const element = sellSigners[index];

          if (element.refundHash !== '') {
            await doRefund(volumeBot, executionId, element.refundHash, 'buy');
          }
        }

        await doRefund(volumeBot, executionId, txHashBefore, 'buy');
        restartExecution(volumeBot, executionId);
        return;
      }

      console.log(`[${type}] ${volumeBot.name} recharge sell wallets success`);

      const swapBuyResponse = await doSwapBuy(volumeBot, executionId, newWalletSigner, newWallet);

      if (!swapBuyResponse) {
        console.log(`[${type}] ${volumeBot.name} buy swap failed`);
        await doRefund(volumeBot, executionId, txHashBefore, 'buy');
        restartExecution(volumeBot, executionId);
        return;
      }

      for (let index = 0; index < volumeBot.sell_swap_times; index++) {
        const sellData = sellSigners[index];
        doSwapSell(volumeBot, executionId, sellData.transactionResponse!.hash, sellData.newSigner!, sellData.newWallet!);
      }
    }

    restartExecution(volumeBot, executionId);
  } catch (error) {
    await forceStop(volumeBot, executionId);
    console.log(`[${type}] ${volumeBot.name} | doTransactions error`, error);
  }
}

async function verifySellFlow(volumeBot: VolumeBot, executionId: number, signer: Signer, amount: bigint, delay: number, sellTimes: number, sellFlow: number, attempt: number = 1): Promise<VolumeBotSigner> {
  try {
    await new Promise(resolve => setTimeout(resolve, delay));
    const selectedTokenBalance = await getSelectedTokenBalance2(signer, volumeBot.token_address);

    if (attempt <= 10) {
      console.log(`[${type}] ${volumeBot.name} selling ${sellFlow}/${sellTimes} attempt ${attempt}/10...`);

      if (selectedTokenBalance > 0 && selectedTokenBalance > amount) {
        return await seedSellWallet(volumeBot, executionId, signer, amount);
      } else {
        console.log(`[${type}] ${volumeBot.name} insuficient ${volumeBot.token_symbol} balance`);
        await verifySellFlow(volumeBot, executionId, signer, amount, 5 * 1000, sellTimes, sellFlow, attempt + 1);
      }
    }

    return { newSigner: null, newWallet: null, transactionResponse: null, refundHash: '', success: false };
  } catch (error) {
    await forceStop(volumeBot, executionId);
    console.log(`[${type}] ${volumeBot.name} | verifySellFlow error`, error);
    throw error;
  }
}

async function seedSellWallet(volumeBot: VolumeBot, executionId: number, signer: Signer, amount: bigint): Promise<VolumeBotSigner> {
  try {
    console.log(`[${type}] ${volumeBot.name} generating random wallet sell...`);

    const newWallet = await generateNewWallet(signer.provider!);

    if (!newWallet) {
      await removeVolumeBotFromList(listBots, volumeBot.uuid);
      throw 'Error generating new wallet';
    }

    const newWalletSigner = await getSigner(newWallet.privateKey);

    console.log(`[${type}] ${volumeBot.name} charging matic...`);
    const volumeBotRepository = new VolumeBotRepository();
    await volumeBotRepository.changeNeedWait(volumeBot.uuid, 1);

    const resCharge = await doTransfer(
      executionId,
      volumeBot.id!,
      volumeBot.name,
      'volume_bot',
      signer,
      newWalletSigner,
      newWallet.privateKey,
      'MATIC',
      settings.MATIC_ADDRESS,
      newWallet.address,
      ethers.parseEther("0.2")
    );

    let refundHash = '';

    if (resCharge.status == 1) {
      refundHash = resCharge.hash;
      const delay = await getRange(2, 4);
      await new Promise(resolve => setTimeout(resolve, delay * 1000));

      const swapMaticForWmaticResponse = await swapMaticForWmatic(volumeBot.id!, 'volume_bot', newWalletSigner, ethers.parseEther("0.14"), executionId, newWallet.address, newWallet.privateKey);

      if (swapMaticForWmaticResponse.status == 1) {
        refundHash = swapMaticForWmaticResponse.hash;

        const resChargeToken = await doTransfer(
          executionId,
          volumeBot.id!,
          volumeBot.name,
          'volume_bot',
          signer,
          newWalletSigner,
          newWallet.privateKey,
          volumeBot.token_symbol,
          volumeBot.token_address,
          newWallet.address,
          amount
        );

        await volumeBotRepository.changeNeedWait(volumeBot.uuid, 0);

        if (resChargeToken.status == 1) {
          return { newSigner: newWalletSigner, newWallet: newWallet, transactionResponse: resCharge, refundHash: '', success: true };
        }
      }
    }

    await volumeBotRepository.changeNeedWait(volumeBot.uuid, 0);
    return { newSigner: null, newWallet: null, transactionResponse: null, refundHash: refundHash, success: false };
  } catch (error) {
    await forceStop(volumeBot, executionId);
    console.log(`[${type}] ${volumeBot.name} | seedSellWallet error`, error);
    throw error;
  }
}

async function doSwapBuy(volumeBot: VolumeBot, executionId: number, newWalletSigner: Signer, newWallet: HDNodeWallet): Promise<boolean> {
  try {
    console.log(`[${type}] ${volumeBot.name} starting buy swap...`);
    let balanceMatic = await getMaticBalance(newWalletSigner);

    const gasFee = await getGasFeePrices();
    const finalMaticAmount = balanceMatic - (gasFee.gasPrice * BigInt(100000));

    if (finalMaticAmount <= BigInt(0)) {
      console.log(`[${type}] ${volumeBot.name} can't do buy swap because [POL] balance is insuficient...`);
      return false;
    }

    const tokenDetails = await new AcceptedTokenRepository().findByAddress(volumeBot.token_address);

    const resSwap = await swapBuy(
      executionId,
      volumeBot.id!,
      volumeBot.name,
      'volume_bot',
      newWalletSigner,
      tokenDetails!,
      finalMaticAmount,
      newWallet.privateKey,
      volumeBot.slippage_tolerance
    );

    if (resSwap.status == 1) {
      const signerBuy = await getSigner(volumeBot.account_private_key_buy);
      const toAddress = await signerBuy.getAddress();
      const selectedTokenNow = await getSelectedTokenBalance2(newWalletSigner, volumeBot.token_address);

      const airdrop: Airdrop = {
        user_id: volumeBot.user_id,
        bot_execution: executionId,
        private_key: newWallet.privateKey,
        amount: ethers.formatEther(selectedTokenNow),
        token_address: volumeBot.token_address,
        token_symbol: volumeBot.token_symbol,
        destiny_address: toAddress,
        delay_to_start: volumeBot.airdrop_time,
        status: 0,
      };

      const airdropRepository = new AirdropRepository();
      const airdropResult = await airdropRepository.create(airdrop);

      setTimeout(async () => {
        const resTransfer = await doTransfer(
          executionId,
          volumeBot.id!,
          volumeBot.name,
          'volume_bot',
          newWalletSigner,
          signerBuy,
          newWallet.privateKey,
          volumeBot.token_symbol,
          volumeBot.token_address,
          toAddress,
          selectedTokenNow
        );

        if (resTransfer.status != 1) {
          airdropRepository.changeStatus(airdropResult.id!, 2);
        } else {
          airdropRepository.changeStatus(airdropResult.id!, 1);
        }
      }, volumeBot.airdrop_time * 60000);

      timerCountdown(volumeBot.airdrop_time, `[${type}] ${volumeBot.name} will start buy airdrop`, true);
      return true;
    }

    return false
  } catch (error) {
    await forceStop(volumeBot, executionId);
    console.log(`[${type}] ${volumeBot.name} | doSwapBuy error`, error);
    return false;
  }
}

async function doSwapSell(volumeBot: VolumeBot, executionId: number, txHashBefore: string, newWalletSigner: Signer, newWallet: HDNodeWallet) {
  try {
    const tokenDetails = await new AcceptedTokenRepository().findByAddress(volumeBot.token_address);

    if (!tokenDetails) {
      throw 'Token details not found';
    }

    console.log(`[${type}] ${volumeBot.name} starting sell swap...`);
    const balanceSelectedToken = await getSelectedTokenBalance2(newWalletSigner, volumeBot.token_address);

    if (balanceSelectedToken <= BigInt(0)) {
      console.log(`[${type}] ${volumeBot.name} swap sell [${volumeBot.token_symbol}] don't have balance. Current [${volumeBot.token_symbol}] balance is ${ethers.formatEther(balanceSelectedToken)}`);
      await doRefund(volumeBot, executionId, txHashBefore, 'buy');
      return;
    }

    const resSwap = await swapSell(
      executionId,
      volumeBot.id!,
      volumeBot.name,
      'volume_bot',
      newWalletSigner,
      tokenDetails,
      balanceSelectedToken,
      newWallet.privateKey,
      volumeBot.slippage_tolerance
    );

    if (resSwap.status == 1) {
      txHashBefore = resSwap.hash;
      let wmaticBalance = await getWmaticBalance(newWalletSigner);

      let attempt = 0;

      while (wmaticBalance == BigInt(0) && attempt < 10) {
        attempt = attempt + 1
        console.log(`[${type}] ${volumeBot.name}, wallet ${newWallet.address} don't have wmatic balance on attempt ${attempt}, retrying...`);
        await new Promise(resolve => setTimeout(resolve, 10 * 1000));
        wmaticBalance = await getWmaticBalance(newWalletSigner);
      }

      if (wmaticBalance > BigInt(0)) {
        const resConvert = await swapWmaticForMatic(volumeBot.id!, 'volume_bot', newWalletSigner, wmaticBalance, executionId, newWallet.address, newWallet.privateKey);

        if (resConvert.status == 1) {
          txHashBefore = resConvert.hash;

          let maticBalance = await getMaticBalance(newWalletSigner);

          while (maticBalance == BigInt(0) && attempt < 10) {
            attempt = attempt + 1
            console.log(`[${type}] ${volumeBot.name}, wallet ${newWallet.address} don't have [POL] balance on attempt ${attempt}, retrying...`);
            await new Promise(resolve => setTimeout(resolve, 10 * 1000));
            maticBalance = await getMaticBalance(newWalletSigner);
          }

          const signerBuy = await getSigner(volumeBot.account_private_key_buy);
          const toAddress = await signerBuy.getAddress();

          const airdrop: Airdrop = {
            user_id: volumeBot.user_id,
            bot_execution: executionId,
            private_key: newWallet.privateKey,
            amount: ethers.formatEther(maticBalance),
            token_address: settings.MATIC_ADDRESS,
            token_symbol: 'MATIC',
            destiny_address: toAddress,
            delay_to_start: volumeBot.airdrop_time,
            status: 0,
          };

          const airdropRepository = new AirdropRepository();
          const airdropResult = await airdropRepository.create(airdrop);

          setTimeout(async () => {
            const getFeeData = await getGasFeePrices();
            const finalMaticAmount = maticBalance - (getFeeData.gasPrice * BigInt(30000));

            const resTransfer = await doTransfer(
              executionId,
              volumeBot.id!,
              volumeBot.name,
              'volume_bot',
              newWalletSigner,
              signerBuy,
              newWallet.privateKey,
              'MATIC',
              settings.MATIC_ADDRESS,
              toAddress,
              finalMaticAmount
            );

            if (resTransfer.status != 1) {
              airdropRepository.changeStatus(airdropResult.id!, 2);
            } else {
              airdropRepository.changeStatus(airdropResult.id!, 1);
            }
          }, volumeBot.airdrop_time * 60000);

          timerCountdown(volumeBot.airdrop_time, `[${type}] ${volumeBot.name} will start sell airdrop`, true);
          return true;
        } else {
          console.log(`[${type}] ${volumeBot.name} swap sell failed to swap MATIC TO WMATIC`);
        }
      } else {
        console.log(`[${type}] ${volumeBot.name} swap sell [WMATIC] don't have balance`);
      }
    }

    console.log(`[${type}] ${volumeBot.name} sell swap failed`);
    await doRefund(volumeBot, executionId, txHashBefore, 'buy');
    return false;
  } catch (error) {
    await forceStop(volumeBot, executionId);
    console.log(`[${type}] ${volumeBot.name} | doSwapSell error`, error);
    return false;
  }
}

async function executeAirdrop(volumeBot: VolumeBot, txHash: string, destinyAddress: string, fromFront: boolean) {
  try {
    console.log(`[${type}] ${volumeBot.name} preparing airdrop ${txHash}...`);

    const transactionRepository = new TransactionRepository();
    await transactionRepository.changeNeedAirdrop(txHash);
    const transaction = await transactionRepository.findByHash(txHash);

    if (!transaction) {
      console.log(`[${type}] ${volumeBot.name} airdrop ${txHash} not found`);
      return;
    }

    console.log(`[${type}] ${volumeBot.name} starting ${transaction.symbol_selected_token} airdrop...`);

    if (transaction.symbol_selected_token.toUpperCase() != "MATIC") {
      await selectedTokenAirdrop(volumeBot.id!, volumeBot.uuid, 'volume_bot', transaction, destinyAddress, volumeBot.token_symbol, volumeBot.token_address, '');
    } else {
      await maticAirdrop(volumeBot.id!, 'volume_bot', transaction, destinyAddress);
    }
  } catch (error) {
    console.log(`[${type}] ${volumeBot.name} | executeAirdrop error ${error}`);

    if (fromFront) {
      throw error;
    }
  }
}

async function doRefund(volumeBot: VolumeBot, executionId: number, txHash: string, origin: string) {
  try {
    console.log(`[${type}] ${volumeBot.name} starting refund ${txHash}...`);

    const transactionRepository = new TransactionRepository();
    const transaction = await transactionRepository.findByHash(txHash);

    if (!transaction || !transaction.new_wallet_private_key) {
      throw 'Transaction not found';
    }

    const signerSender = await getSigner(transaction.new_wallet_private_key);
    const tokenSymbol = transaction.symbol_selected_token;
    let tokenAddress = '';

    switch (tokenSymbol.toUpperCase()) {
      case 'MATIC':
        tokenAddress = settings.MATIC_ADDRESS;
        break;

      case 'WMATIC':
        tokenAddress = settings.WMATIC_ADDRESS;
        break;

      default:
        const acceptedTokens = new AcceptedTokenRepository();
        const tokenData = await acceptedTokens.findBySymbol(tokenSymbol);

        if (!tokenData) {
          throw 'Token not found';
        }

        break;
    }

    let originKey = '';

    switch (origin.toLowerCase()) {
      case 'buy':
        originKey = volumeBot.account_private_key_buy;
        break;

      case 'sell':
        originKey = volumeBot.account_private_key_sell;
        break;

      default:
        throw 'Refund invalid origin';
    }

    let amount = BigInt(0);

    switch (tokenSymbol.toUpperCase()) {
      case 'MATIC':
        amount = await getMaticBalance(signerSender);
        break;

      default:
        amount = await getSelectedTokenBalance2(signerSender, tokenAddress);
        break;
    }

    const signerReceiver = await getSigner(originKey);
    const to = await signerReceiver.getAddress();

    if (amount > BigInt(0)) {
      const resCharge = await doTransfer(
        executionId,
        volumeBot.id!,
        volumeBot.name,
        'volume_bot',
        signerSender,
        signerReceiver,
        transaction.new_wallet_private_key,
        tokenSymbol,
        tokenAddress,
        to,
        amount,
        0,
        'refund'
      );

      if (resCharge.status == 1) {
        console.log(`[${type}] ${volumeBot.name} refund ${tokenSymbol} success`);
      }
    } else {
      console.log(`[${type}] ${volumeBot.name} refund ${tokenSymbol} don't have balance`);
    }
  } catch (error) {
    console.log(`[${type}] ${volumeBot.name} | doRefund error ${error}`);
  }
}

async function restartExecution(volumeBot: VolumeBot, executionId: number) {
  try {
    const delayRange = await getRange(volumeBot.min_delay, volumeBot.max_delay);
    const delay = delayRange * 1000;
    const signerBuy = await getSigner(volumeBot.account_private_key_buy);

    runCheckStep3(volumeBot, executionId, delay, signerBuy);
  } catch (error) {
    await forceStop(volumeBot, executionId);
    console.log(`[${type}] ${volumeBot.name} | restartExecution error ${error}`);
  }
}

async function forceStop(volumeBot: VolumeBot, executionId: number) {
  try {
    await new BotExecutionRepository().changeActive(executionId, 2);
    await new VolumeBotRepository().changeActive(volumeBot.uuid, 0);
    removeVolumeBotFromList(listBots, volumeBot.uuid);
  } catch (error) {
    console.log(`[${type}] ${volumeBot.name} | forceStop error ${error}`);
  }
}