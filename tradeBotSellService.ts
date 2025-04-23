import { checkHelper, doCycle, doTransfer, doTransferFlow, swapSell } from './transactionService';
import { TradeBotRepository } from '../repositories/tradeBotRepository';
import { getRange, getTokenRange, perAmount, removeFromList, timerCountdown } from '../helpers/functionsHelper';
import { generateNewWallet, getSelectedTokenBalance2, getMaticBalance, getSigner, getTokenPrice } from '../helpers/ethersHelper';
import { HDNodeWallet, Signer, ethers } from 'ethers';
import { BotExecutionRepository } from '../repositories/botExecutionRepository';
import { TradeBotService } from './tradeBotService';
import { AcceptedTokenRepository } from '../repositories/acceptedTokenRepository';
import { TradeBot } from '../models/TradeBot';
import { getGasFeePrices } from '../helpers/cryptoHelper';
import { TradeBotFlowRepository } from '../repositories/tradeBotFlowRepository';
import { TradeBotFlow } from '../models/TradeBotFlow';
import { Airdrop } from '../models/Airdrop';
import { AirdropRepository } from '../repositories/airdropRepository';
import { Transaction } from '../models/Transaction';
import { Swap } from '../models/Swap';
import { SwapRepository } from '../repositories/swapRepository';
import { AcceptedToken } from '../models/AcceptedToken';
import { settings } from '../utils/settings';

const listSalesBots: TradeBot[] = [];
const type = 'Sell';

export class TradeBotSellService {
  private tradeBotRepository: TradeBotRepository;
  private botExecutionRepository: BotExecutionRepository;
  private tradeBotService: TradeBotService;

  constructor() {
    this.tradeBotRepository = new TradeBotRepository();
    this.botExecutionRepository = new BotExecutionRepository();
    this.tradeBotService = new TradeBotService();
  }

  async run(userId: number, uuid: string, fromFront: boolean, isNewExecution: boolean, executionId: number) {
    try {
      const response = await this.tradeBotService.runCheckStep1(userId, uuid, fromFront, type);

      if (!response || !response.canRun) {
        console.log(`[${type}] ${uuid} can't run now`);
        return;
      }

      const tradeBot = response.bot;
      const signer = response.signer;
      const polTaxNeed = response.taxNeed;

      await new Promise(resolve => setTimeout(resolve, 1000));
      const isRunning = listSalesBots.findIndex((listData) => listData.uuid === tradeBot.uuid);

      if (isRunning != -1) {
        const message = `[${type}] ${tradeBot.name} is already running`;

        if (fromFront) {
          throw message;
        }
      }

      listSalesBots.push(tradeBot);

      const response2 = await this.tradeBotService.runCheckStep2(tradeBot, fromFront, isNewExecution, executionId, type);

      if (!response2 || !response2.canRun) {
        console.log(`[${type}] ${tradeBot.name} can't run at now`);
        return;
      }

      const tradeBotFlow: TradeBotFlow = {
        trade_bot: tradeBot.id!,
        bot_execution: response2.executionId,
        actual_cycle: 1,
        flow: 0,
      }

      this.tradeBotService.runCheckStep3(tradeBot, tradeBotFlow, response2.delay, signer, polTaxNeed);
      return response2.message;
    } catch (error) {
      if (fromFront) {
        throw error;
      } else {
        console.log(`[${type}] ${uuid} | run error ${error}`);
      }
    }
  }

  async execution(tradeBot: TradeBot, tradeBotFlow: TradeBotFlow, signer: Signer, polNeedTax: bigint) {
    try {
      const amount = getTokenRange(tradeBot.min_amount, tradeBot.max_amount);
      const selectedTokenBalance = await getSelectedTokenBalance2(signer, tradeBot.token_address);

      if (selectedTokenBalance > BigInt(0) && selectedTokenBalance > amount) {
        await executeGhostWallets(signer, tradeBot, tradeBotFlow, polNeedTax, amount);
      } else {
        console.log(`[${type}] ${tradeBot.name} insuficient ${tradeBot.token_symbol} balance`);
      }

      if (tradeBot.target_balance == 0 || Number(tradeBot.spent_balance) < tradeBot.target_balance) {
        const delayRange = await getRange(tradeBot.min_delay, tradeBot.max_delay);
        const delay = delayRange * 1000;

        this.tradeBotService.runCheckStep3(tradeBot, tradeBotFlow, delay, signer, polNeedTax);
      } else {
        await this.botExecutionRepository.changeActive(tradeBotFlow.bot_execution, 0);
        await removeFromList(listSalesBots, tradeBot.uuid);
        console.log(`[${type}] ${tradeBot.name} was stopped because reach target balance`);
      }
    } catch (error) {
      await forceStop(tradeBot, tradeBotFlow, 2);
      console.log(`[${type}] ${tradeBot.name} | execution error`, error);
    }
  }

  async stop(userId: number, uuid: string): Promise<void> {
    const botData = await this.tradeBotRepository.find(uuid, userId);

    if (!botData) {
      throw 'Trade bot was not found';
    }

    if (botData.strategy != 'sell') {
      throw 'This is not a sell bot';
    }

    await removeFromList(listSalesBots, botData.uuid);
  }

  async reRun(executionId: number, userId: number, uuid: string, flowId: number) {
    try {
      const tradeBot = await this.tradeBotRepository.find(uuid, userId);

      if (!tradeBot) {
        throw `[Trade] bot was not found`;
      }

      if (tradeBot.is_hidden) {
        throw `[${tradeBot.strategy}] ${tradeBot.name} can't run because bot is hidden`;
      }

      const flow = await new TradeBotFlowRepository().find(flowId, tradeBot.id!, executionId);

      if (!flow) {
        throw `[${tradeBot.strategy}] ${tradeBot.name} flow was not found`;
      }

      if (flow.actual_cycle! == 0) {
        throw `[${tradeBot.strategy}] ${tradeBot.name} can't run because actual cycle is 0`;
      }

      const lastTransactions = await this.tradeBotRepository.reRunGetLastTransactions(executionId, flow.id!, tradeBot.id!, tradeBot.cycle_ghosts * 3);

      if (lastTransactions.length == 0) {
        await this.botExecutionRepository.changeActive(executionId, 0);
        throw `[${tradeBot.strategy}] ${tradeBot.name} can't run because you don't have pending transactions`;
      }

      await this.botExecutionRepository.changeActive(executionId, 1);

      restart(tradeBot, flow, lastTransactions);
      //this.run(tradeBot.user_id, tradeBot.uuid, false, false, flow.bot_execution);
    } catch (error) {
      throw error;
    }
  }

  async restartSwap(executionId: number, userId: number, uuid: string, swap: Swap) {
    try {
      const tradeBot = await this.tradeBotRepository.find(uuid, userId);

      if (!tradeBot) {
        throw `[Trade] bot was not found`;
      }

      if (tradeBot.is_hidden) {
        throw `[${tradeBot.strategy}] ${tradeBot.name} can't run because bot is hidden`;
      }

      if (tradeBot.mode != 'linear') {
        throw `[${tradeBot.strategy}] ${tradeBot.name} wrong mode`;
      }

      const tokenDetails = await new AcceptedTokenRepository().findByAddress(tradeBot.token_address);

      if (!tokenDetails) {
        throw `Token details not found`;
      }

      const oldMainGhost = await getSigner(swap.private_key);
      const newMainGhost = await generateNewWallet(oldMainGhost.provider!);

      const oldPolBalance = await getMaticBalance(oldMainGhost!);
      const oldTokenBalance = await getSelectedTokenBalance2(oldMainGhost, tradeBot.token_address);

      await doTransferFlow(
        executionId,
        tradeBot.id!,
        tradeBot.name,
        `trade_bot`,
        tradeBot.token_symbol,
        tradeBot.token_address,
        tradeBot.helper_private_key,
        oldMainGhost,
        newMainGhost!,
        oldTokenBalance,
        false,
        oldPolBalance
      );

      await this.botExecutionRepository.changeActive(executionId, 1);

      const actualPolBalance = await getMaticBalance(newMainGhost!);
      const actualTokenBalance = await getSelectedTokenBalance2(newMainGhost!, tradeBot.token_address);

      console.log(`[${type}] ${tradeBot.name} restarting...`);
      startSwapFlow(executionId, tradeBot, actualPolBalance, actualTokenBalance, newMainGhost!, tokenDetails, swap)
    } catch (error) {
      console.log(error);
    }
  }

  async startIdleSwaps(tradeBot: TradeBot, useTimer: boolean) {
    try {
      if (tradeBot.is_hidden) {
        throw `[${tradeBot.strategy}] ${tradeBot.name} can't run because bot is hidden`;
      }

      if (tradeBot.mode != 'queue') {
        throw `[${tradeBot.strategy}] ${tradeBot.name} wrong mode`;
      }

      const tokenDetails = await new AcceptedTokenRepository().findByAddress(tradeBot.token_address);

      if (!tokenDetails) {
        throw `Token details not found`;
      }

      const swapRepository = new SwapRepository();
      const list: Swap[] = await swapRepository.listToStartIdles(tradeBot.uuid);

      for (let index = 0; index < list.length; index++) {
        const element = list[index];

        if ((useTimer || index > 0)) {
          const delayRange = await getRange(tradeBot.min_delay, tradeBot.max_delay);
          timerCountdown(delayRange, `[${tradeBot.strategy}] ${tradeBot.name} queue ${index + 1}/${list.length} will start`, false);
          await new Promise(resolve => setTimeout(resolve, delayRange * 1000));
        } else {
          console.log(`[${type}] ${tradeBot.name} [${tradeBot.mode}] starting queue ${index + 1}/${list.length}`);
        }

        const verifyTradeBot = await this.tradeBotRepository.find(tradeBot.uuid, tradeBot.user_id);

        if (!verifyTradeBot?.active) {
          return;
        }

        const signer = await getSigner(element.private_key);
        const actualPolBalance = await getMaticBalance(signer);
        const actualTokenBalance = await getSelectedTokenBalance2(signer, tradeBot.token_address);
        await startIdleSwapFlow(signer, element.private_key, element.bot_execution, tradeBot, actualPolBalance, actualTokenBalance, tokenDetails, element);
      }

      await new Promise(resolve => setTimeout(resolve, 10 * 1000));

      const refreshedTradeBot = await this.tradeBotRepository.find(tradeBot.uuid, tradeBot.user_id);
      this.startIdleSwaps(refreshedTradeBot!, true);
    } catch (error) {
      console.log(error);
      this.startIdleSwaps(tradeBot, false);
    }
  }
}

async function restart(tradeBot: TradeBot, tradeBotFlow: TradeBotFlow, lastTransactions: Transaction[]) {
  try {
    const executionId = tradeBotFlow.bot_execution;
    const signer = await getSigner(tradeBot.account_private_key);
    const restartSigner = await generateNewWallet(signer.provider!);

    if (!restartSigner) {
      throw `[${tradeBot.strategy}] ${tradeBot.name} create ghost failed`;
    }

    let hasPending = false;

    for (let index = 0; index < lastTransactions.length; index++) {
      const element: Transaction = lastTransactions[index];

      if (element.new_wallet_private_key) {
        const txSigner = await getSigner(element.new_wallet_private_key);
        const pendingTokenBalance = await getSelectedTokenBalance2(txSigner, tradeBot.token_address);
        const pendingPolBalance = await getMaticBalance(txSigner);

        if (pendingTokenBalance > BigInt(0) || pendingPolBalance > BigInt(0)) {
          hasPending = true;

          await doTransferFlow(
            executionId,
            tradeBot.id!,
            tradeBot.name,
            'trade_bot',
            tradeBot.token_symbol,
            tradeBot.token_address,
            tradeBot.helper_private_key,
            txSigner,
            restartSigner,
            pendingTokenBalance,
            false,
            pendingPolBalance
          );
        }
      }
    }

    if (!hasPending) {
      await new BotExecutionRepository().changeActive(executionId, 0);
      console.log(`[${type}] ${tradeBot.name} Does not have pending tokens`);
      return;
    }

    await new TradeBotRepository().changeActive(tradeBot.uuid, 1);
    await new BotExecutionRepository().changeActive(tradeBotFlow.bot_execution, 1);

    const polBalance = await getMaticBalance(restartSigner);
    const tokenBalance = await getSelectedTokenBalance2(restartSigner, tradeBot.token_address);

    console.log(`[${type}] ${tradeBot.name} re-runing...`);
    executeGhostWallets(signer, tradeBot, tradeBotFlow, polBalance, tokenBalance);
  } catch (error) {
    console.log(`[${tradeBot.strategy}] "${tradeBot.name}" restart error`, error);
    await forceStop(tradeBot, tradeBotFlow, 2);
    return;
  }
}

async function executeGhostWallets(
  signer: Signer,
  tradeBot: TradeBot,
  tradeBotFlow: TradeBotFlow,
  polAmount: bigint,
  tokenAmount: bigint
) {
  try {
    const tradeBotFlowRepository = new TradeBotFlowRepository();

    if (tradeBotFlow.actual_cycle <= tradeBot.cycles) {
      if (!signer.provider) {
        return;
      }

      const text = `[${type}] ${tradeBot.name} starting cycle ${tradeBotFlow.actual_cycle}/${tradeBot.cycles}`;

      if (tradeBotFlow.actual_cycle > 1) {
        timerCountdown(tradeBot.cycle_delay, text, false);
        await new Promise(resolve => setTimeout(resolve, tradeBot.cycle_delay * 1000));
      }

      let mainGhost: ethers.HDNodeWallet | null = null;
      const listGhosts: ethers.HDNodeWallet[] = [];
      const tokenAmountList = perAmount(tokenAmount, tradeBot.cycle_ghosts - 1);
      //const polAmountPerSide = polAmount / BigInt(2);
      const polAmountPerAccount = polAmount / BigInt(tradeBot.cycle_ghosts - 1)

      console.log(`[${type}] ${tradeBot.name} creating ghosts...`);
      for (let index = 0; index < tradeBot.cycle_ghosts; index++) {
        const newWalletSigner = await generateNewWallet(signer.provider);

        if (!newWalletSigner) {
          return;
        }

        if (index == 0) {
          mainGhost = newWalletSigner;
        } else {
          listGhosts.push(newWalletSigner);
        }
      }

      if (listGhosts.length < (tradeBot.cycle_ghosts - 1) || !mainGhost) {
        return;
      }

      console.log(`[${type}] ${tradeBot.name} seeding ghosts...`);
      for (let index = 0; index < listGhosts.length; index++) {
        const element: ethers.HDNodeWallet = listGhosts[index];
        //let polToSend = BigInt(0);

        if (index == 0 || index + 1 == listGhosts.length) {
          //polToSend = polAmountPerSide;
        }

        await doTransferFlow(
          tradeBotFlow.bot_execution,
          tradeBot.id!,
          tradeBot.name,
          `trade_bot`,
          tradeBot.token_symbol,
          tradeBot.token_address,
          tradeBot.helper_private_key,
          signer,
          element,
          tokenAmountList[index],
          false,
          polAmountPerAccount//polToSend
        );
      }

      console.log(`[${type}] ${tradeBot.name} doing cycle ${tradeBotFlow.actual_cycle}/${tradeBot.cycles}...`);

      await doCycle(
        tradeBotFlow.bot_execution,
        tradeBot.id!,
        tradeBot.name,
        'trade_bot',
        tradeBot.helper_private_key,
        tradeBot.token_symbol,
        tradeBot.token_address,
        mainGhost,
        listGhosts
      );

      const tokenBalance = await getSelectedTokenBalance2(mainGhost, tradeBot.token_address);
      const polBalance = await getMaticBalance(mainGhost);

      console.log(`[${type}] ${tradeBot.name} cycle ${tradeBotFlow.actual_cycle}/${tradeBot.cycles} successful ended`);

      if (tradeBotFlow.actual_cycle < tradeBot.cycles) {
        tradeBotFlow.actual_cycle = tradeBotFlow.actual_cycle + 1;
        await tradeBotFlowRepository.updateFlowCycle(tradeBotFlow);

        executeGhostWallets(mainGhost, tradeBot, tradeBotFlow, polBalance, tokenBalance);
      } else {
        await startPoolFlow(tradeBotFlow.bot_execution, tradeBot, polBalance, tokenBalance, mainGhost);
      }
    } else {
      console.log(`[${type}] ${tradeBot.name} starting last flow...`);
      const signerTokenBalance = await getSelectedTokenBalance2(signer, tradeBot.token_address);
      const signerPolBalance = await getMaticBalance(signer);

      const mainGhost = await generateNewWallet(signer.provider!);

      if (!mainGhost) {
        throw 'Failed to generate main ghost wallet';
      }

      const delay = await getRange(450, 900);
      await new Promise(resolve => setTimeout(resolve, delay * 1000));

      await doTransferFlow(
        tradeBotFlow.bot_execution,
        tradeBot.id!,
        tradeBot.name,
        `trade_bot`,
        tradeBot.token_symbol,
        tradeBot.token_address,
        tradeBot.helper_private_key,
        signer,
        mainGhost,
        signerTokenBalance,
        false,
        signerPolBalance
      );

      const tokenBalance = await getSelectedTokenBalance2(mainGhost, tradeBot.token_address);
      const polBalance = await getMaticBalance(mainGhost);

      await startPoolFlow(tradeBotFlow.bot_execution, tradeBot, polBalance, tokenBalance, mainGhost);
    }
  } catch (error) {
    console.log(`[${type}] ${tradeBot.name} | executeGhostWallets error`, error);
    await forceStop(tradeBot, tradeBotFlow, 2);
  }
}

async function startPoolFlow(executionId: number, tradeBot: TradeBot, polBalance: bigint, tokenBalance: bigint, mainGhost: HDNodeWallet) {
  try {
    const tokenDetails = await new AcceptedTokenRepository().findByAddress(tradeBot.token_address);

    if (!tokenDetails) {
      throw `Token details not found`;
    }

    console.log(`[${type}] ${tradeBot.name} swapping [${tokenDetails.symbol}] to [${tokenDetails.pool_symbol}]...`);

    const getFeeData = await getGasFeePrices();
    const swapTax = (getFeeData.gasPrice * BigInt(200000));

    if (polBalance < swapTax) {
      await checkHelper(
        executionId,
        tradeBot.id!,
        tradeBot.name,
        'trade_bot',
        tradeBot.helper_private_key,
        mainGhost,
        true
      );
    }

    const swapPolToTokenPool = await doTransfer(
      executionId,
      tradeBot.id!,
      tradeBot.name,
      'trade_bot',
      mainGhost,
      mainGhost,
      mainGhost.privateKey,
      tokenDetails.pool_symbol,
      tokenDetails.pool_address,
      mainGhost.address,
      swapTax,
      0,
      'deposit'
    );

    if (swapPolToTokenPool.status != 1) {
      throw `Swap [${tokenDetails.symbol}] to [${tokenDetails.pool_symbol}] fail`;
    }

    console.log(`[${type}] ${tradeBot.name} set swap pool finished`);
    await startSwapFlow(executionId, tradeBot, polBalance, tokenBalance, mainGhost, tokenDetails, null);
  } catch (error) {
    console.log(`[${type}] ${tradeBot.name} ${error}`);
  }
}

async function startSwapFlow(executionId: number, tradeBot: TradeBot, polBalance: bigint, tokenBalance: bigint, mainGhost: HDNodeWallet, tokenDetails: AcceptedToken, swap: Swap | null = null) {
  const swapRepository = new SwapRepository();

  try {
    console.log(`[${type}] ${tradeBot.name} swapping [${tradeBot.token_symbol}] to [${tokenDetails.pool_symbol}]...`);


    if (!swap) {
      const swapModel: Swap = {
        user_id: tradeBot.user_id,
        bot_execution: executionId,
        bot_uuid: tradeBot.uuid,
        private_key: mainGhost.privateKey,
        amount: ethers.formatEther(tokenBalance),
        token_name: tradeBot.token_name,
        token_address: tradeBot.token_address,
        token_symbol: tradeBot.token_symbol,
        swap_type: 'sell',
        bot_type: 'trade_bot',
        mode: tradeBot.mode,
        status: 0,
      };

      swap = await swapRepository.create(swapModel);
    }

    if (tradeBot.mode == 'queue') {
      console.log(`[SWAP SELL] with token [${tradeBot.token_symbol}] has been placed in the queue`);
      return;
    }

    const maticUsdPrice = await getTokenPrice(mainGhost, settings.MATIC_USD_ADDRESS, 'USDT', 'Tether USD', 6, null);
    const tokenPrice = await getTokenPrice(mainGhost, tradeBot.token_address, tradeBot.token_symbol, tradeBot.token_name, tokenDetails.decimals, tokenDetails);
    let selectedTokenPrice = tokenPrice / maticUsdPrice;

    if (tokenDetails.pool_symbol == 'USDT') {
      selectedTokenPrice = tokenPrice;
    }

    /*
    if (selectedTokenPrice <= tradeBot.target_price) {
      timerCountdown(5, `[${tradeBot.strategy}] ${tradeBot.name} ${tradeBot.token_symbol} value is below target price`, false);
      await new Promise(resolve => setTimeout(resolve, 5 * 1000));
      await startSwapFlow(executionId, tradeBot, polBalance, tokenBalance, mainGhost, tokenDetails, swap, enterQueue);
      return;
    }
    */

    const resSwap = await swapSell(
      executionId,
      tradeBot.id!,
      tradeBot.name,
      'trade_bot',
      mainGhost,
      tokenDetails,
      tokenBalance,
      mainGhost.privateKey,
      tradeBot.slippage_tolerance,
    );

    await swapRepository.changeStatus(swap.id!, resSwap.status);

    if (resSwap.status !== 1) {
      throw `[SWAP SELL] with token [${tradeBot.token_symbol}] and [${tokenDetails.pool_symbol}] fail`;
    }

    console.log(`[${type}] ${tradeBot.name} swap finished`);
    startDestinyFlow(executionId, tradeBot, tokenDetails, mainGhost);
  } catch (error) {
    console.log(`[${type}] ${tradeBot.name} ${error}`);

    if (swap) {
      await swapRepository.changeStatus(swap.id!, 2);
    }
    /*
    timerCountdown(10, `[${tradeBot.strategy}] ${tradeBot.name} ${tradeBot.token_symbol} error`, false);
    await new Promise(resolve => setTimeout(resolve, 10 * 1000));
    startSwapFlow(executionId, tradeBot, polBalance, tokenBalance, mainGhost, tokenDetails, swap);
    */
  }
}

async function startIdleSwapFlow(signer: Signer, privateKey: string, executionId: number, tradeBot: TradeBot, polBalance: bigint, tokenBalance: bigint, tokenDetails: AcceptedToken, swap: Swap) {
  const swapRepository = new SwapRepository();

  try {
    console.log(`[${type}] ${tradeBot.name} swapping [${tradeBot.token_symbol}] to [${tokenDetails.pool_symbol}]...`);

    const getFeeData = await getGasFeePrices();
    const tax = (getFeeData.gasPrice * BigInt(300000));

    if (tax > polBalance) {
      await checkHelper(
        executionId,
        tradeBot.id!,
        tradeBot.name,
        'trade_bot',
        tradeBot.helper_private_key,
        signer,
        true
      );
    }

    const resSwap = await swapSell(
      executionId,
      tradeBot.id!,
      tradeBot.name,
      'trade_bot',
      signer,
      tokenDetails,
      tokenBalance,
      privateKey,
      tradeBot.slippage_tolerance,
    );

    await swapRepository.changeStatus(swap.id!, resSwap.status);

    if (resSwap.status !== 1) {
      throw `[SWAP SELL] with token [${tradeBot.token_symbol}] and [${tokenDetails.pool_symbol}] fail`;
    }

    startIdleDestinyFlow(executionId, tradeBot, tokenDetails, signer, privateKey);
  } catch (error) {
    console.log(`[${type}] ${tradeBot.name} ${error}`);

    if (swap) {
      await swapRepository.changeStatus(swap.id!, 2);
    }
  }
}

async function startDestinyFlow(executionId: number, tradeBot: TradeBot, tokenDetails: AcceptedToken, mainGhost: HDNodeWallet) {
  try {
    const resultTokenBalance = await getSelectedTokenBalance2(mainGhost, tokenDetails.pool_address);

    const airdrop: Airdrop = {
      user_id: tradeBot.user_id,
      bot_execution: executionId,
      private_key: mainGhost.privateKey,
      amount: ethers.formatEther(resultTokenBalance),
      token_address: tokenDetails.pool_address,
      token_symbol: tokenDetails.pool_symbol,
      destiny_address: tradeBot.destiny_address,
      delay_to_start: tradeBot.airdrop_time,
      status: 0,
    };

    const airdropRepository = new AirdropRepository();
    const airdropResult = await airdropRepository.create(airdrop);

    const text = `[${type}] ${tradeBot.name} will send tokens to destiny wallet`;
    timerCountdown(tradeBot.airdrop_time, text, true);

    await new BotExecutionRepository().changeActive(executionId, 0);

    await new Promise(resolve => setTimeout(resolve, tradeBot.airdrop_time * 60000));

    const resultPolBalance = await getMaticBalance(mainGhost);

    console.log(`[${type}] ${tradeBot.name} doing [${tokenDetails.pool_symbol}] airdrop...`);

    try {
      await doTransferFlow(
        executionId,
        tradeBot.id!,
        tradeBot.name,
        `trade_bot`,
        tokenDetails.pool_symbol,
        tokenDetails.pool_address,
        tradeBot.helper_private_key,
        mainGhost,
        mainGhost,
        resultTokenBalance,
        false,
        resultPolBalance,
        tradeBot.destiny_address,
        'destiny'
      );

      await airdropRepository.changeStatus(airdropResult.id!, 1);
    } catch (error) {
      await airdropRepository.changeStatus(airdropResult.id!, 2);
      console.log(`[${type}] ${tradeBot.name} ${error}`);
    }

    console.log(`[${type}] ${tradeBot.name} airdrop finished`);
  } catch (error) {
    console.log(`[${type}] ${tradeBot.name} ${error}`);
  }
}

async function startIdleDestinyFlow(executionId: number, tradeBot: TradeBot, tokenDetails: AcceptedToken, signer: Signer, signerPrivateKey: string) {
  try {
    const resultTokenBalance = await getSelectedTokenBalance2(signer, tokenDetails.pool_address);

    const airdrop: Airdrop = {
      user_id: tradeBot.user_id,
      bot_execution: executionId,
      private_key: signerPrivateKey,
      amount: ethers.formatEther(resultTokenBalance),
      token_address: tokenDetails.pool_address,
      token_symbol: tokenDetails.pool_symbol,
      destiny_address: tradeBot.destiny_address,
      delay_to_start: tradeBot.airdrop_time,
      status: 0,
    };

    const airdropRepository = new AirdropRepository();
    const airdropResult = await airdropRepository.create(airdrop);

    const text = `[${type}] ${tradeBot.name} will send tokens to destiny wallet`;
    timerCountdown(tradeBot.airdrop_time, text, true);

    await new BotExecutionRepository().changeActive(executionId, 0);

    await new Promise(resolve => setTimeout(resolve, tradeBot.airdrop_time * 60000));

    console.log(`[${type}] ${tradeBot.name} doing [${tokenDetails.pool_symbol}] airdrop...`);

    try {
      const transferToken = await doTransfer(
        executionId,
        tradeBot.id!,
        tradeBot.name,
        `trade_bot`,
        signer,
        signer,
        '',
        tokenDetails.pool_symbol,
        tokenDetails.pool_address,
        tradeBot.destiny_address,
        resultTokenBalance,
        0,
        'destiny'
      );

      let finalStatus = 2;

      if (transferToken.status == 1) {
        finalStatus = 1;
      }

      await airdropRepository.changeStatus(airdropResult.id!, finalStatus);
    } catch (error) {
      await airdropRepository.changeStatus(airdropResult.id!, 2);
      console.log(`[${type}] ${tradeBot.name} ${error}`);
    }

    console.log(`[${type}] ${tradeBot.name} airdrop finished`);
  } catch (error) {
    console.log(`[${type}] ${tradeBot.name} ${error}`);
  }
}

async function forceStop(tradeBot: TradeBot, tradeBotFlow: TradeBotFlow, executionStatus: number) {
  try {
    await new BotExecutionRepository().changeActive(tradeBotFlow.bot_execution, executionStatus);
    //await new TradeBotRepository().changeActive(tradeBot.uuid, 0);
    //removeFromList(listSalesBots, tradeBot.uuid);
  } catch (error) {
    console.log(`[${type}] ${tradeBot.name} | forceStop error ${error}`);
  }
}