import { TradeBotRepository } from '../repositories/tradeBotRepository';
import { TradeBot } from '../models/TradeBot';
import { v4 as uuidv4 } from 'uuid';
import { addressIsValid, getMaticBalance, getSelectedTokenBalance2, getSigner } from '../helpers/ethersHelper';
import { AcceptedTokenRepository } from '../repositories/acceptedTokenRepository';
import { TradeBotSellService } from './tradeBotSellService';
import { BotExecutionRepository } from '../repositories/botExecutionRepository';
import { settings } from '../utils/settings';
import { Signer, ethers } from 'ethers';
import { calcStartTime, isBettweenTime, timerCountdown } from '../helpers/functionsHelper';
import { getGasFeePrices } from '../helpers/cryptoHelper';
import { TradeBotFlowRepository } from '../repositories/tradeBotFlowRepository';
import { TradeBotFlow } from '../models/TradeBotFlow';
import { TradeBotBuyService } from './tradeBotBuyService';
import { SwapRepository } from '../repositories/swapRepository';

const listQueues: any = [];

export class TradeBotService {
  private tradeBotRepository: TradeBotRepository;
  private acceptedTokenRepository: AcceptedTokenRepository;
  private botExecutionRepository: BotExecutionRepository;
  private tradeBotFlowRepository: TradeBotFlowRepository;

  constructor() {
    this.tradeBotRepository = new TradeBotRepository();
    this.acceptedTokenRepository = new AcceptedTokenRepository();
    this.botExecutionRepository = new BotExecutionRepository();
    this.tradeBotFlowRepository = new TradeBotFlowRepository();
  }

  async create(
    userId: number,
    name: string,
    helperPrivateKey: string,
    accountPrivateKey: string,
    accountFriendlyName: string,
    destinyAddress: string,
    destinyFriendlyName: string,
    tokenSymbol: string,
    targetPrice: number,
    minAmount: number,
    maxAmount: number,
    minDelay: number,
    maxDelay: number,
    targetBalance: number,
    holderPercent: number,
    slippageTolerance: number,
    delayToStart: number,
    strategy: string,
    cycles: number,
    cycleDelay: number,
    cycleGhosts: number,
    workStart: string,
    workEnd: string,
    airdropTime: number,
    mode: string = 'linear',
    maxQueue: number = 0
  ): Promise<void> {
    try {
      if (!cycleGhosts || cycleGhosts < 3) {
        throw 'Cycle ghosts wallets is invalid';
      }

      if (cycleGhosts % 2 === 0) {
        throw 'Cycle ghosts must be impar';
      }

      if (!cycles || cycles == 0) {
        throw 'Cycles is invalid';
      }

      if (!cycleDelay || cycleDelay == 0) {
        throw 'Cycle delay is invalid';
      }

      if (maxAmount < minAmount) {
        throw 'Maximum quantity must be greater than the minimum quantity';
      }

      if (maxDelay < minDelay) {
        throw 'Maximum delay must be greater than the minimum delay';
      }

      if (!airdropTime || airdropTime == 0) {
        airdropTime = 60;
      }

      if (!addressIsValid(destinyAddress)) {
        throw 'Destiny address is invalid';
      }

      if (holderPercent > 90) {
        throw 'Holder percent is invalid';
      }

      if (mode != 'queue' && mode != 'linear') {
        throw 'This mode is not recognize';
      }

      if (mode == 'queue' && maxQueue < 1) {
        throw 'Max queue must be greater than 0';
      }

      const tokenData = await this.acceptedTokenRepository.findBySymbol(tokenSymbol);

      if (!tokenData) {
        throw 'This symbol is not setup';
      }

      if (!tokenData.active) {
        throw 'This symbol is inactive';
      }

      const botUuid = uuidv4();

      const tradeBot: TradeBot = {
        uuid: botUuid,
        user_id: userId,
        name: name,
        helper_private_key: helperPrivateKey,
        account_private_key: accountPrivateKey,
        account_friendly_name: accountFriendlyName,
        destiny_address: destinyAddress,
        destiny_friendly_name: destinyFriendlyName,
        token_name: tokenData.name,
        token_symbol: tokenData.symbol,
        token_address: tokenData.address,
        target_price: targetPrice,
        min_amount: minAmount,
        max_amount: maxAmount,
        min_delay: minDelay,
        max_delay: maxDelay,
        target_balance: targetBalance,
        holder_percent: holderPercent,
        slippage_tolerance: slippageTolerance,
        delay_to_start: delayToStart,
        strategy: strategy,
        cycles: cycles,
        cycle_delay: cycleDelay,
        cycle_ghosts: cycleGhosts,
        work_start: workStart,
        work_end: workEnd,
        airdrop_time: airdropTime,
        mode: mode,
        max_queue: maxQueue,
      };

      await this.tradeBotRepository.create(tradeBot);
    } catch (error) {
      throw error;
    }
  }

  async edit(
    userId: number,
    uuid: string,
    name: string,
    accountFriendlyName: string,
    destinyAddress: string,
    destinyFriendlyName: string,
    tokenSymbol: string,
    targetPrice: number,
    minAmount: number,
    maxAmount: number,
    minDelay: number,
    maxDelay: number,
    targetBalance: number,
    holderPercent: number,
    slippageTolerance: number,
    delayToStart: number,
    cycles: number,
    cycleDelay: number,
    cycleGhosts: number,
    workStart: string,
    workEnd: string,
    airdropTime: number,
    mode: string = 'linear',
    maxQueue: number = 0
  ): Promise<void> {
    try {
      if (!cycleGhosts || cycleGhosts < 3) {
        throw 'Cycle ghosts wallets is invalid';
      }

      if (cycleGhosts % 2 === 0) {
        throw 'Cycle ghosts must be impar';
      }

      if (!cycles || cycles == 0) {
        throw 'Cycles is invalid';
      }

      if (!cycleDelay || cycleDelay == 0) {
        throw 'Cycle delay is invalid';
      }

      if (maxAmount < minAmount) {
        throw 'Maximum quantity must be greater than the minimum quantity';
      }

      if (maxDelay < minDelay) {
        throw 'Maximum delay must be greater than the minimum delay';
      }

      if (!airdropTime || airdropTime == 0) {
        airdropTime = 60;
      }

      if (!addressIsValid(destinyAddress)) {
        throw 'Destiny address is invalid';
      }

      if (holderPercent > 90) {
        throw 'Holder percent is invalid';
      }

      if (mode != 'queue' && mode != 'linear') {
        throw 'This mode is not recognize';
      }

      if (mode == 'queue' && maxQueue < 1) {
        throw 'Max queue must be greater than 0';
      }

      const tokenData = await this.acceptedTokenRepository.findBySymbol(tokenSymbol);

      if (!tokenData) {
        throw 'This symbol is not setup';
      }

      if (!tokenData.active) {
        throw 'This symbol is inactive';
      }

      const botData = await this.tradeBotRepository.find(uuid, userId);

      if (!botData) {
        throw 'Bot was not found';
      }

      if (botData.active) {
        throw 'Stop bot before edit';
      }

      const tradeBot: TradeBot = {
        uuid: botData.uuid,
        user_id: userId,
        name: name,
        account_friendly_name: accountFriendlyName,
        destiny_address: destinyAddress,
        destiny_friendly_name: destinyFriendlyName,
        token_name: tokenData.name,
        token_symbol: tokenData.symbol,
        token_address: tokenData.address,
        target_price: targetPrice,
        min_amount: minAmount,
        max_amount: maxAmount,
        min_delay: minDelay,
        max_delay: maxDelay,
        target_balance: targetBalance,
        holder_percent: holderPercent,
        slippage_tolerance: slippageTolerance,
        delay_to_start: delayToStart,
        cycles: cycles,
        cycle_delay: cycleDelay,
        cycle_ghosts: cycleGhosts,
        work_start: workStart,
        work_end: workEnd,
        airdrop_time: airdropTime,
        account_private_key: '',
        helper_private_key: '',
        strategy: '',
        mode: mode,
        max_queue: maxQueue
      };

      await this.tradeBotRepository.update(tradeBot);
    } catch (error) {
      throw error;
    }
  }

  async hideUnhide(userId: number, uuid: string) {
    const botData = await this.tradeBotRepository.find(uuid, userId);

    if (!botData) {
      throw 'Trade bot was not found';
    }

    let status = 0;

    if (!botData.is_hidden) {
      status = 1;
    }

    await this.tradeBotRepository.changeHidden(botData.uuid, status);

    if (status) {
      switch (botData.strategy) {
        case 'buy':
          const buyService = new TradeBotBuyService();
          buyService.stop(userId, botData.uuid);
          break;

        case 'sell':
          const sellService = new TradeBotSellService();
          sellService.stop(userId, botData.uuid);
          break;

        default:
          break;
      }

      return 'hide'
    } else {
      return 'unhide';
    }
  }

  async find(userId: number, uuid: string) {
    const tradeBot = await this.tradeBotRepository.find(uuid, userId);

    return tradeBot;
  }

  async list(userId: number, strategy: string, isHidden: boolean) {
    const listTradeBots = await this.tradeBotRepository.list(strategy, userId, isHidden);

    return listTradeBots;
  }

  async listHidden(userId: number, strategy: string) {
    const listTradeBots = await this.tradeBotRepository.list(strategy, userId, true);

    return listTradeBots;
  }

  async doAllAirdrops(userId: number, uuid: string, executionId: number) {
    /*
    const tradeBotData = await this.tradeBotRepository.find(uuid, userId);
    
    if (!tradeBotData) {
    throw 'Bot was not found';
    }
    
    if (tradeBotData.active) {
    throw 'You need stop bot to do airdrop';
    }
    
    if (tradeBotData.active_airdrop) {
    throw 'Airdrop already is running';
    }
    
    if (tradeBotData.need_wait) {
    throw 'Wait feel seconds to do airdrop';
    }
    
    const botAddress = await this.botAddressRepository.find(tradeBotData.bot_address);
    
    if (!botAddress) {
    throw 'Bot address is not find';
    }
    
    const transactionRepository = new TransactionRepository();
    const transactions = await transactionRepository.listAirdrop(executionId);
    const transactionsMatic = await transactionRepository.listAirdropMatic(executionId);
    
    if (transactions.length == 0 && transactionsMatic.length == 0) {
    throw 'This bot address do not have pending airdrops';
    }
    
    executeAllAirdrop(botAddress, transactions, transactionsMatic);
    */
  }

  async doAirdrop(userId: number, addressId: number, txHash: string, destinyAddress: string = '') {
    try {
      /*
      console.log(`[Trade - Airdrop] Preparing ${txHash} airdrop...`);
      
      const transactionRepository = new TransactionRepository();
      await transactionRepository.changeNeedAirdrop(txHash);
      const transaction = await transactionRepository.findByHash(txHash);
      
      if (!transaction) {
      console.log(`[Trade - Airdrop] ${txHash}] not found`);
      return;
      }
      
      const botAddress: BotAddress | null = await this.botAddressRepository.find(addressId);
      
      if (!botAddress) {
      console.log(`[Trade - Airdrop] ${botAddress!.bot_uuid} not found`);
      return;
      }
      
      const botRepository = new TradeBotRepository();
      const bot: Bot | null = await botRepository.find(botAddress!.bot_uuid, userId);
      
      if (!bot) {
      console.log(`[Trade - Airdrop] ${bot!.uuid} not found`);
      return;
      }
      
      if (bot.active_airdrop || bot.need_wait) {
      console.log(`[Trade - Airdrop] ${bot!.uuid} need to wait`);
      return;
      }
      
      await botRepository.changeAirdropActive(botAddress!.bot_uuid, 1);
      
      console.log(`Trade - Airdrop] ${bot!.uuid} starting ${transaction.symbol_selected_token} airdrop...`);
      
      if (destinyAddress == '') {
      destinyAddress = botAddress.destiny_address;
      }
      
      if (transaction.symbol_selected_token.toUpperCase() != "MATIC") {
      await selectedTokenAirdrop(botAddress.id, bot.uuid, 'bot_address', transaction, destinyAddress, botAddress.token_symbol, botAddress.token_address, bot.account_private_key!);
      } else {
      await maticAirdrop(botAddress.id, 'bot_address', transaction, destinyAddress);
      }
      
      await botRepository.changeAirdropActive(botAddress!.bot_uuid, 0);
      */
    } catch (error) {
      console.log(`[Trade - Airdrop] ${txHash} | doAirdrop error ${error}`);
    }
  }

  async executions(userId: number, uuid: string, page: number, symbol: string, startDate: string, endDate: string) {
    if (page < 1) {
      page = 1;
    }

    const tradeBotData = await this.tradeBotRepository.find(uuid, userId);

    if (!tradeBotData) {
      throw 'Trade bot was not found';
    }

    const executions = await this.botExecutionRepository.list(tradeBotData.id!, page, startDate, endDate, 'trade_bot');
    const details = await this.tradeBotRepository.executionsDetails(tradeBotData.id!, symbol, startDate, endDate);

    return {
      'details': details,
      'executions': executions
    };
  }

  async transactions(executionId: number, userId: number, uuid: string, page: number, symbol: string, startDate: string, endDate: string) {
    if (page < 1) {
      page = 1;
    }

    const tradeBotData = await this.tradeBotRepository.find(uuid, userId);

    if (!tradeBotData) {
      throw 'Trade bot was not found';
    }

    const transactions = await this.tradeBotRepository.transactions(tradeBotData.id!, executionId, page, symbol, startDate, endDate);
    const details = await this.tradeBotRepository.transactionsDetails(tradeBotData.id!, executionId, symbol, startDate, endDate);

    return {
      'details': details,
      'transactions': transactions
    };
  }

  async queueSwaps(userId: number, uuid: string) {
    const swapRepository = new SwapRepository();
    const list = await swapRepository.listToStartIdles(uuid, 0, userId);

    return {
      'count': list.length
    };
  }

  async runCheckStep1(userId: number, uuid: string, fromFront: boolean, type: string) {
    try {
      const response = await doPreValidations(userId, uuid, fromFront, type);

      if (!response) {
        console.log(`[${type}] ${uuid} can't run now`);
        return;
      }

      const tradeBot = response;

      const signer = await getSigner(tradeBot.account_private_key);

      const tokenDetails = await this.acceptedTokenRepository.findByAddress(tradeBot.token_address);

      if (!tokenDetails) {
        throw 'Token details not found';
      }

      let selectedTokenBalance = BigInt(0);
      let tokenSymbol = '';

      switch (type.toLowerCase()) {
        case 'buy':
          selectedTokenBalance = await getSelectedTokenBalance2(signer, tokenDetails.pool_address);
          tokenSymbol = tokenDetails.pool_symbol;
          break;

        case 'sell':
          selectedTokenBalance = await getSelectedTokenBalance2(signer, tradeBot.token_address);
          tokenSymbol = tradeBot.token_symbol;
          break;

        default:
          console.log(`runCheckStep1 error: ${type} doesn't exists`)
          break;
      }

      const balancePol = await getMaticBalance(signer);
      const getFeeData = await getGasFeePrices();
      const polTaxNeed = getFeeData.gasPrice * BigInt(30000) * BigInt(tradeBot.cycle_ghosts * tradeBot.cycles * 10);

      if (balancePol < polTaxNeed && settings.WITH_PAYMENT == 'y') {
        const message = `[${type}] ${tradeBot.name} doesn't have a necessary [POL] balance to proceed`;

        if (fromFront) {
          throw message;
        } else {
          console.log(message);
          return;
        }
      }

      let minAmount = 0;
      let minTokenNecessary = BigInt(0);

      if (type.toLowerCase() == 'buy') {
        minAmount = Number(tradeBot.max_amount.toFixed(tokenDetails.pool_decimals));
        minTokenNecessary = ethers.parseUnits(minAmount.toString(), tokenDetails.pool_decimals);
      } else {
        minAmount = Number(tradeBot.max_amount.toFixed(tokenDetails.decimals));
        minTokenNecessary = ethers.parseUnits(minAmount.toString(), tokenDetails.decimals);
      }

      if ((selectedTokenBalance == BigInt(0) || selectedTokenBalance < minTokenNecessary) && settings.WITH_PAYMENT == 'y') {
        const message = `[${type}] ${tradeBot.name} doesn't have a necessary ${tokenSymbol} balance to proceed`;

        if (fromFront) {
          throw message;
        } else {
          console.log(message);
          return;
        }
      }

      await this.tradeBotRepository.changeActive(tradeBot.uuid, 1);

      return { bot: tradeBot, signer: signer, taxNeed: polTaxNeed, canRun: true };
    } catch (error) {
      if (fromFront) {
        throw error;
      } else {
        console.log(`[${type}] ${uuid} | runCheckStep1 error ${error}`);
      }
    }
  }

  async runCheckStep2(tradeBot: TradeBot, fromFront: boolean, isNewExecution: boolean, executionId: number, type: string) {
    try {
      if (isNewExecution) {
        executionId = await this.botExecutionRepository.startExecution(tradeBot.id!, 'trade_bot', true);
      }

      const response = await calcStartTime(
        type,
        tradeBot.name,
        tradeBot.id!,
        'trade_bot',
        tradeBot.id!,
        'id',
        tradeBot.delay_to_start!,
        tradeBot.min_delay,
        tradeBot.max_delay,
        isNewExecution
      );

      return { executionId: executionId, delay: response.delay, message: response.message, canRun: true };
    } catch (error) {
      if (fromFront) {
        throw error;
      } else {
        console.log(`[${type}] ${tradeBot.uuid} | runCheckStep2 error ${error}`);
      }
    }
  }

  async runCheckStep3(
    tradeBot: TradeBot,
    tradeBotFlow: TradeBotFlow,
    delayToStart: number,
    signer: Signer,
    polNeedTax: bigint
  ) {
    try {
      if (!await checkRunning(tradeBot, tradeBotFlow.bot_execution, tradeBot.strategy)) {
        return;
      }

      const refreshBot = await new TradeBotRepository().find(tradeBot.uuid, tradeBot.user_id);

      if (refreshBot) {
        tradeBot = refreshBot;
      }

      if (tradeBot.mode != 'queue') {
        const secondsDelay = delayToStart / 1000;
        timerCountdown(secondsDelay, `[${tradeBot.strategy}] ${tradeBot.name} will start`, false);
        await new Promise(resolve => setTimeout(resolve, delayToStart));
      }

      if (tradeBot.mode == 'queue') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const isRunningQueue = listQueues.findIndex((listData: any) => listData.uuid === tradeBot.uuid);

        if (isRunningQueue == -1) {
          switch (tradeBot.strategy) {
            case 'buy':
              new TradeBotBuyService().startIdleSwaps(tradeBot, false);
              break;
            case 'sell':
              new TradeBotSellService().startIdleSwaps(tradeBot, false)
              break;
            default:
              throw 'This trade bot strategy is not recognized';
          }

          listQueues.push(tradeBot);
        }

        const queueCount = await new SwapRepository().queueCount(tradeBot.uuid);

        if (queueCount >= tradeBot.max_queue) {
          timerCountdown(60, `[${tradeBot.strategy}] ${tradeBot.name} reach max queue, checking again`, false);
          await new Promise(resolve => setTimeout(resolve, 60 * 1000));
          this.runCheckStep3(tradeBot, tradeBotFlow, 0, signer, polNeedTax);
          return;
        }
      }

      if (!await checkRunning(tradeBot, tradeBotFlow.bot_execution, tradeBot.strategy)) {
        return;
      }

      console.log(`[${tradeBot.strategy}] ${tradeBot.name} is running`);

      const isCurrentTimeWithinRange: boolean = isBettweenTime(tradeBot.work_start, tradeBot.work_end);

      if (!isCurrentTimeWithinRange) {
        console.log(`[${tradeBot.strategy}] ${tradeBot.name} is out of the range ${tradeBot.work_start} ~ ${tradeBot.work_end}`);
        const delay = 60 * 1000;
        this.runCheckStep3(tradeBot, tradeBotFlow, delay, signer, polNeedTax);
        return;
      };

      const newTradeBotFlow: TradeBotFlow = {
        trade_bot: tradeBotFlow.trade_bot,
        bot_execution: tradeBotFlow.bot_execution,
        actual_cycle: 1,
        flow: tradeBotFlow.flow + 1
      }

      await this.tradeBotFlowRepository.create(newTradeBotFlow);

      switch (tradeBot.strategy) {
        case 'buy':
          new TradeBotBuyService().execution(tradeBot, newTradeBotFlow, signer, polNeedTax);
          break;
        case 'sell':
          new TradeBotSellService().execution(tradeBot, newTradeBotFlow, signer, polNeedTax);
          break;
        default:
          throw 'This trade bot strategy is not recognized';
      }
    } catch (error) {
      await forceStop(tradeBot, tradeBotFlow.bot_execution);
      console.log(`[${tradeBot.strategy}] ${tradeBot.name} | runCheckStep3 error ${error}`);
    }
  }

  removeFromQueueList(uuid: string) {
    const index = listQueues.findIndex((listData: any) => listData.uuid === uuid);

    if (index !== -1) {
      listQueues.splice(index, 1);
    }
  }
}

async function doPreValidations(userId: number, uuid: string, fromFront: boolean, type: string): Promise<TradeBot | false> {
  try {
    const tradeBotRepository = new TradeBotRepository();
    const tradeBot = await tradeBotRepository.find(uuid, userId);

    if (!tradeBot) {
      const message = `Trade bot was not found`;

      if (fromFront) {
        throw message;
      } else {
        console.log(message);
        return false;
      }
    }

    if (tradeBot.strategy != type.toLowerCase()) {
      const message = `[${type}] ${tradeBot.name} isn't a ${type.toLowerCase()} bot`;

      if (fromFront) {
        throw message;
      } else {
        console.log(message);
        return false;
      }
    }

    if (tradeBot.is_hidden) {
      const message = `[${type}] ${tradeBot.name} can't run because is hidden`;

      if (fromFront) {
        throw message;
      } else {
        console.log(message);
        return false;
      }
    }

    if (tradeBot.target_balance > 0 && Number(tradeBot.spent_balance) >= tradeBot.target_balance) {
      const message = `[${type}] ${tradeBot.name} reach target balance limit`;

      if (fromFront) {
        throw message;
      } else {
        console.log(message);
        return false;
      }
    }

    return tradeBot;
  } catch (error) {
    console.log(`[${type}] ${uuid} | doPreValidations error ${error}`);

    if (fromFront) {
      throw error;
    }

    return false;
  }
}

async function checkRunning(tradeBot: TradeBot, executionId: number, type: string): Promise<boolean> {
  try {
    const tradeBotRepository = new TradeBotRepository();
    const isRunning = await tradeBotRepository.isRunning(tradeBot.uuid);

    const botExecutionRepository = new BotExecutionRepository();
    const isExecutionRunning = await botExecutionRepository.isRunning(tradeBot.id!, executionId, 'trade_bot');

    if (!isRunning || !isExecutionRunning) {
      const botExecutionRepository = new BotExecutionRepository();
      await botExecutionRepository.changeActive(executionId, 0);
      console.log(`[${type}] ${tradeBot.name} running successful ended`);
      return false;
    }

    return true;
  } catch (error) {
    console.log(`[${type}] ${tradeBot.name} | checkRunning error ${error}`);
    return false;
  }
}

async function forceStop(tradeBot: TradeBot, executionId: number) {
  try {
    await new BotExecutionRepository().changeActive(executionId, 2);
    //await new TradeBotRepository().changeActive(tradeBot.uuid, 0);

    switch (tradeBot.strategy) {
      case 'buy':
        //await new TradeBotBuyService().stop(tradeBot.user_id, tradeBot.uuid);
        break;

      case 'sell':
        //await new TradeBotSellService().stop(tradeBot.user_id, tradeBot.uuid);
        break;

      default:
        break;
    }
  } catch (error) {
    console.log(`[${tradeBot.strategy}] ${tradeBot.name} | forceStop error ${error}`);
  }
}
