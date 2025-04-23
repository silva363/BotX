import { v4 as uuidv4 } from 'uuid';
import { addressIsValid, generateNewWallet, getMaticBalance, getSelectedTokenBalance, getSelectedTokenBalance2, getSigner } from '../helpers/ethersHelper';
import { SeedBot } from '../models/SeedBot';
import { getGasFeePrices } from '../helpers/cryptoHelper';
import { HDNodeWallet, Signer, ethers } from 'ethers';
import { doCycle, doTransferFlow } from './transactionService';
import { perAmount, timerCountdown } from '../helpers/functionsHelper';
import { Transaction } from '../models/Transaction';
import { RepositoryFactory } from '../repositories/repositoryFactory';

export class SeedBotService {
  private seedBotRepository: any;
  private botExecutionRepository: any;
  private acceptedTokenRepository: any;

  constructor() {
    this.seedBotRepository = RepositoryFactory.createSeedBotRepository();
    this.botExecutionRepository = RepositoryFactory.createBotExecutionRepository();
    this.acceptedTokenRepository = RepositoryFactory.createAcceptedTokenRepository();
  }

  async create(
    userId: number,
    name: string,
    helperPrivateKey:string,
    accountPrivateKey: string,
    accountFriendlyName: string,
    destinyAddress: string,
    destinyFriendlyName: string,
    tokenSymbol: string,
    amount: number,
    cycles: number,
    cycleDelay: number,
    cycleGhosts: number,
    airdropTime: number
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

      if (!amount || amount == 0) {
        throw 'Amount is invalid';
      }

      if (!addressIsValid(destinyAddress)) {
        throw 'Destiny address is invalid';
      }

      const tokenData = await this.acceptedTokenRepository.findBySymbol(tokenSymbol);

      if (!tokenData) {
        throw 'This symbol is not setup';
      }

      if (!tokenData.active) {
        throw 'This symbol is inactive';
      }

      const botUuid = uuidv4();

      const seedBot: SeedBot = {
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
        amount: amount,
        cycles: cycles,
        cycle_delay: cycleDelay,
        cycle_ghosts: cycleGhosts,
        airdrop_time: airdropTime,
        active: false
      };

      await this.seedBotRepository.create(seedBot);
    } catch (error) {
      throw error;
    }
  }

  async edit(
    userId: number,
    uuid: string,
    name: string,
    accountPrivateKey: string,
    friendlyName: string,
    destinyAddress: string,
    destinyFriendlyName: string,
    tokenSymbol: string,
    amount: number,
    cycles: number,
    cycleDelay: number,
    cycleGhosts: number,
    airdropTime: number
  ): Promise<void> {
    try {
      if (!cycleGhosts || cycleGhosts < 5) {
        throw 'Cycle ghosts wallets is invalid';
      }

      if (cycleGhosts % 2 === 0) {
        throw 'Cycle ghosts must be impar';
      }

      if (!cycles || cycles == 0) {
        throw 'Cycles is invalid';
      }

      if (!amount || amount == 0) {
        throw 'Amount is invalid';
      }

      if (!addressIsValid(destinyAddress)) {
        throw 'Destiny address is invalid';
      }

      const tokenData = await this.acceptedTokenRepository.findBySymbol(tokenSymbol);

      if (!tokenData) {
        throw 'This symbol is not setup';
      }

      if (!tokenData.active) {
        throw 'This symbol is inactive';
      }

      const seedBotData = await this.seedBotRepository.find(uuid, userId);

      if (!seedBotData) {
        throw 'Seed bot was not found';
      }

      if (seedBotData.active) {
        throw 'You cant udpate seed bot now, because its active';
      }

      seedBotData.name = name;
      seedBotData.account_private_key = accountPrivateKey;
      seedBotData.account_friendly_name = friendlyName;
      seedBotData.destiny_address = destinyAddress;
      seedBotData.destiny_friendly_name = destinyFriendlyName;
      seedBotData.token_name = tokenData.name;
      seedBotData.token_symbol = tokenData.symbol;
      seedBotData.token_address = tokenData.address;
      seedBotData.amount = amount;
      seedBotData.cycles = cycles;
      seedBotData.cycle_ghosts = cycleGhosts;
      seedBotData.cycle_delay = cycleDelay;
      seedBotData.airdrop_time = airdropTime;
      seedBotData.active = false;

      await this.seedBotRepository.update(seedBotData);
    } catch (error) {
      throw error;
    }
  }

  async hideUnhide(userId: number, uuid: string) {
    const botData = await this.seedBotRepository.find(uuid, userId);

    if (!botData) {
      throw 'Seed bot was not found';
    }

    let status = 0;

    if (!botData.is_hidden) {
      status = 1;
    }

    await this.seedBotRepository.changeHidden(botData.uuid, status);

    if (status) {
      return 'hide'
    } else {
      return 'unhide';
    }
  }

  async find(userId: number, uuid: string) {
    const bot = await this.seedBotRepository.find(uuid, userId);

    return bot;
  }

  async list(userId: number) {
    const listBots = await this.seedBotRepository.list(userId);

    return listBots;
  }

  async listHidden(userId: number) {
    const listBots = await this.seedBotRepository.listInactives(userId);

    return listBots;
  }

  async run(userId: number, uuid: string, isNewExecution: boolean) {
    try {
      const seedBotData = await this.seedBotRepository.find(uuid, userId);

      if (!seedBotData) {
        throw 'Seed bot was not found';
      }

      if (seedBotData.active) {
        throw `[Seed] ${seedBotData.name} already running`;
      }

      if (seedBotData.is_hidden) {
        throw `[Seed] ${seedBotData.name} can't run because bot is hidden`;
      }

      if (seedBotData.actual_cycle! > 0 && seedBotData.actual_cycle! < seedBotData.cycles) {
        throw `[Seed] ${seedBotData.name} can't run because actual cycle isn't finished`;
      }

      const signer = await getSigner(seedBotData.account_private_key);
      const balanceMatic = await getMaticBalance(signer);
      const balanceSelectedToken = await getSelectedTokenBalance2(signer, seedBotData.token_address);

      if (balanceSelectedToken < seedBotData.amount) {
        throw `[Seed] ${seedBotData.name} don't have necessary [${seedBotData.token_symbol}], your balance is ${ethers.formatEther(balanceSelectedToken)} and you need ${seedBotData.amount}`;
      }

      const getFeeData = await getGasFeePrices();
      const maticTaxNeed = getFeeData.gasPrice * BigInt(30000) * BigInt(seedBotData.cycle_ghosts * seedBotData.cycles * 10);

      if (balanceMatic < maticTaxNeed) {
        throw `[Seed] ${seedBotData.name} don't have necessary [POL]`;
      }

      const haveExecution = await this.botExecutionRepository.havePendingExecution(seedBotData.id!, 'seed_bot');

      if (haveExecution) {
        throw `[Seed] ${seedBotData.name} is ending internal loop, wait feel minutes`;
      }

      const executionId = await this.botExecutionRepository.startExecution(seedBotData.id!, 'seed_bot', isNewExecution);

      await this.seedBotRepository.changeActive(seedBotData.uuid, 1);
      console.log(`[Seed] ${seedBotData.name} generating ghost wallets...`);

      executeGhostWallets(executionId, signer, seedBotData, maticTaxNeed, ethers.parseEther(seedBotData.amount.toString()), 1);
    } catch (error) {
      throw error;
    }
  }

  async executions(userId: number, uuid: string, page: number, symbol: string, startDate: string, endDate: string) {
    try {
      if (page < 1) {
        page = 1;
      }

      const seedBotData = await this.seedBotRepository.find(uuid, userId);

      if (!seedBotData) {
        throw 'Seed bot was not found';
      }

      const executions = await this.botExecutionRepository.list(seedBotData.id!, page, startDate, endDate, 'seed_bot');
      const details = await this.seedBotRepository.executionsDetails(seedBotData.id!, symbol, startDate, endDate);

      return {
        'details': details,
        'executions': executions
      };
    } catch (error) {
      throw error;
    }
  }

  async reRun(executionId: number, userId: number, uuid: string) {
    try {
      const seedBot = await this.seedBotRepository.find(uuid, userId);

      if (!seedBot) {
        throw '[Seed] bot was not found';
      }

      if (seedBot.is_hidden) {
        throw `[Seed] ${seedBot.name} can't run because bot is hidden`;
      }

      if (seedBot.actual_cycle! == 0) {
        throw `[Seed] ${seedBot.name} can't run because actual cycle is 0`;
      }

      const lastTransactions = await this.botExecutionRepository.reRunGetLastTransactions(executionId, seedBot.id!, seedBot.cycle_ghosts * 5, 'seed_bot');

      if (lastTransactions.length == 0) {
        await this.botExecutionRepository.changeActive(executionId, 0);
        throw `[Seed] ${seedBot.name} can't run because you don't have pending transactions`;
      }

      await this.botExecutionRepository.changeActive(executionId, 1);

      restart(seedBot, executionId, lastTransactions);
    } catch (error) {
      throw error;
    }
  }

  async transactions(executionId: number, userId: number, uuid: string, page: number, symbol: string, startDate: string, endDate: string) {
    if (page < 1) {
      page = 1;
    }

    const seedBotData = await this.seedBotRepository.find(uuid, userId);

    if (!seedBotData) {
      throw 'Seed bot was not found';
    }

    const transactions = await this.seedBotRepository.transactions(seedBotData.id!, executionId, page, symbol, startDate, endDate);
    const details = await this.seedBotRepository.transactionsDetails(seedBotData.id!, executionId, symbol, startDate, endDate);

    return {
      'details': details,
      'transactions': transactions
    };
  }
}

async function executeGhostWallets(
  executionId: number,
  signer: Signer,
  seedBot: SeedBot,
  polAmount: bigint,
  tokenAmount: bigint,
  cycle: number
) {
  try {
    if (cycle <= seedBot.cycles) {
      const seedBotRepository = new SeedBotRepository();
      await seedBotRepository.updateActualCycle(seedBot.id!, cycle);

      if (!signer.provider) {
        throw 'Cant get provider';
      }

      const text = `[Seed] ${seedBot.name} starting cycle ${cycle}/${seedBot.cycles}`;

      if (cycle > 1) {
        timerCountdown(seedBot.cycle_delay, text, false);
        await new Promise(resolve => setTimeout(resolve, seedBot.cycle_delay * 1000));
      }

      let mainGhost: ethers.HDNodeWallet | null = null;
      const listGhosts: ethers.HDNodeWallet[] = [];
      const tokenAmountList = perAmount(tokenAmount, seedBot.cycle_ghosts - 1);
      const polAmountPerAccount = polAmount / BigInt(seedBot.cycle_ghosts - 1)

      console.log(`[Seed] ${seedBot.name} creating ghosts...`);
      for (let index = 0; index < seedBot.cycle_ghosts; index++) {
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

      if (listGhosts.length < (seedBot.cycle_ghosts - 1) || !mainGhost) {
        throw 'create ghosts error';
      }

      console.log(`[Seed] ${seedBot.name} seeding ghosts...`);
      for (let index = 0; index < listGhosts.length; index++) {
        const element: ethers.HDNodeWallet = listGhosts[index];

        await doTransferFlow(
          executionId,
          seedBot.id!,
          seedBot.name,
          `seed_bot`,
          seedBot.token_symbol,
          seedBot.token_address,
          seedBot.helper_private_key,
          signer,
          element,
          tokenAmountList[index],
          false,
          polAmountPerAccount
        );
      }

      console.log(`[Seed] ${seedBot.name} doing cycle ${cycle}...`);

      await doCycle(
        executionId,
        seedBot.id!,
        seedBot.name,
        'seed_bot',
        seedBot.account_private_key,
        seedBot.token_symbol,
        seedBot.token_address,
        mainGhost,
        listGhosts
      );

      const tokenBalance = await getSelectedTokenBalance2(mainGhost, seedBot.token_address);
      const polBalance = await getMaticBalance(mainGhost);

      if (cycle < seedBot.cycles) {
        console.log(`[Seed] ${seedBot.name} cycle ${cycle} successful ended`);
        executeGhostWallets(executionId, mainGhost, seedBot, polBalance, tokenBalance, cycle + 1);
      } else {
        await startLastFlow(executionId, seedBot, polBalance, tokenBalance, mainGhost);
      }
    } else {
      const signerTokenBalance = await getSelectedTokenBalance2(signer, seedBot.token_address);
      const signerPolBalance = await getMaticBalance(signer);

      const mainGhost = await generateNewWallet(signer.provider!);

      if (!mainGhost) {
        throw 'Failed to generate main ghost wallet';
      }

      await doTransferFlow(
        executionId,
        seedBot.id!,
        seedBot.name,
        `seed_bot`,
        seedBot.token_symbol,
        seedBot.token_address,
        seedBot.helper_private_key,
        signer,
        mainGhost,
        signerTokenBalance,
        false,
        signerPolBalance
      );

      const tokenBalance = await getSelectedTokenBalance2(mainGhost, seedBot.token_address);
      const polBalance = await getMaticBalance(mainGhost);

      await startLastFlow(executionId, seedBot, polBalance, tokenBalance, mainGhost);
    }
  } catch (error) {
    console.log(`[Seed] "${seedBot.name}" executeGhostWallets error`, error);
    await forceStop(seedBot, executionId, 2);
    return;
  }
}

async function startLastFlow(executionId: number, seedBot: SeedBot, polBalance: bigint, tokenBalance: bigint, mainGhost: HDNodeWallet) {
  try {
    const seedBotRepository = new SeedBotRepository();
    await seedBotRepository.updateActualCycle(seedBot.id!, seedBot.actual_cycle! + 1);

    console.log(`[Seed] ${seedBot.name} starting last flow`);
    await forceStop(seedBot, executionId, 0);
    await seedBotRepository.updateActualCycle(seedBot.id!, 0);

    const text = `[Seed] ${seedBot.name} will send tokens to destiny wallet`;
    timerCountdown(seedBot.airdrop_time, text, true);
    await new Promise(resolve => setTimeout(resolve, seedBot.airdrop_time * 60000));

    await doTransferFlow(
      executionId,
      seedBot.id!,
      seedBot.name,
      `seed_bot`,
      seedBot.token_symbol,
      seedBot.token_address,
      seedBot.helper_private_key,
      mainGhost,
      mainGhost,
      tokenBalance,
      true,
      polBalance,
      seedBot.destiny_address,
      'destiny'
    );

    console.log(`[Seed] ${seedBot.name} airdrop finished`);
  } catch (error) {
    throw error;
  }
}

async function restart(seedBot: SeedBot, executionId: number, lastTransactions: Transaction[]) {
  try {
    const signer = await getSigner(seedBot.account_private_key);
    const restartSigner = await generateNewWallet(signer.provider!);

    if (!restartSigner) {
      throw `[Seed] ${seedBot.name} create ghost failed`;
    }

    let hasPending = false;

    for (let index = 0; index < lastTransactions.length; index++) {
      const element: Transaction = lastTransactions[index];

      if (element.new_wallet_private_key) {
        const txSigner = await getSigner(element.new_wallet_private_key);
        const pendingTokenBalance = await getSelectedTokenBalance2(txSigner, seedBot.token_address);
        const pendingPolBalance = await getMaticBalance(txSigner);

        if (pendingTokenBalance > BigInt(0) || pendingPolBalance > BigInt(0)) {
          hasPending = true;

          await doTransferFlow(
            executionId,
            seedBot.id!,
            seedBot.name,
            'seed_bot',
            seedBot.token_symbol,
            seedBot.token_address,
            seedBot.helper_private_key,
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
      throw `Does not have pending tokens`;
    }

    await new SeedBotRepository().changeActive(seedBot.uuid, 1);

    const polBalance = await getMaticBalance(restartSigner);
    const tokenBalance = await getSelectedTokenBalance2(restartSigner, seedBot.token_address);

    executeGhostWallets(executionId, restartSigner, seedBot, polBalance, tokenBalance, seedBot.actual_cycle!);
  } catch (error) {
    console.log(`[Seed] "${seedBot.name}" restart error`, error);
    await forceStop(seedBot, executionId, 2);
    return;
  }
}

async function forceStop(seedBot: SeedBot, executionId: number, executionStatus: number) {
  try {
    await new BotExecutionRepository().changeActive(executionId, executionStatus);
    await new SeedBotRepository().changeActive(seedBot.uuid, 0);
  } catch (error) {
    console.log(`[Seed}] ${seedBot.name} | forceStop error ${error}`);
  }
}