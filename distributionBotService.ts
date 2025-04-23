import { v4 as uuidv4 } from 'uuid';
import { addressIsValid, getSelectedTokenBalance2, getSigner } from '../helpers/ethersHelper';
import { AcceptedTokenRepository } from '../repositories/acceptedTokenRepository';
import { DistributionBotWallet } from '../models/DistributionBotWallet';
import { DistributionBot } from '../models/DistributionBot';
import { DistributionBotRepository } from '../repositories/distributionBotRepository';
import { doTransferBasic } from './transactionService';
import { calcPercent, comparePassword, hashPassword, timerCountdown } from '../helpers/functionsHelper';
import { Signer, ethers } from 'ethers';
import { AcceptedToken } from '../models/AcceptedToken';
import { BotExecutionRepository } from '../repositories/botExecutionRepository';

const listDistributionBots: DistributionBot[] = [];

export class DistributionBotService {
  private distributionBotRepository: DistributionBotRepository;
  private acceptedTokenRepository: AcceptedTokenRepository;
  private botExecutionRepository: BotExecutionRepository;

  constructor() {
    this.distributionBotRepository = new DistributionBotRepository();
    this.acceptedTokenRepository = new AcceptedTokenRepository();
    this.botExecutionRepository = new BotExecutionRepository();
  }

  async create(
    userId: number,
    name: string,
    password: string,
    accountPrivateKey: string,
    delay: number,
    tokenSymbol: string,
    wallets: DistributionBotWallet[],
    friendlyName: string
  ): Promise<void> {
    try {
      const botUuid = uuidv4();
      let totalPercent = 0;

      wallets.forEach((element: DistributionBotWallet) => {
        if (!element.wallet_address || !addressIsValid(element.wallet_address)) {
          throw 'Wallet address is invalid';
        }

        if (!element.name) {
          throw 'Wallet name is required';
        }

        if (!element.percent) {
          throw 'Wallet percent is required';
        }

        element.percent = Number(element.percent.toString().replace(',', '.'));

        element.distribution_bot_uuid = botUuid;
        totalPercent = totalPercent + Number(element.percent);
      });

      if (totalPercent < 99) {
        throw 'Total percentage invalid, is below 99%';
      }

      if (totalPercent > 100) {
        throw 'Total percentage invalid, is above 100%';
      }

      const distributionBot: DistributionBot = {
        uuid: botUuid,
        user_id: userId,
        name: name,
        password: await hashPassword(password),
        account_private_key: accountPrivateKey,
        account_friendly_name: friendlyName,
        token_symbol: tokenSymbol,
        delay: delay,
        active: false
      };

      await this.distributionBotRepository.create(distributionBot, wallets);
    } catch (error) {
      throw error;
    }
  }

  async edit(
    userId: number,
    uuid: string,
    name: string,
    password: string,
    newPassword: string,
    delay: number,
    tokenSymbol: string,
    wallets: DistributionBotWallet[],
    friendlyName: string
  ): Promise<void> {
    try {
      let totalPercent = 0;

      wallets.forEach((element: DistributionBotWallet) => {
        if (!element.wallet_address || !addressIsValid(element.wallet_address)) {
          throw 'Wallet address is invalid';
        }

        if (!element.name) {
          throw 'Wallet name is required';
        }

        if (!element.percent) {
          throw 'Wallet percent is required';
        }

        element.percent = Number(element.percent.toString().replace(',', '.'));

        totalPercent = totalPercent + Number(element.percent);
      });

      if (totalPercent < 99) {
        throw 'Total percentage invalid, is below 99%';
      }

      if (totalPercent > 100) {
        throw 'Total percentage invalid, is above 100%';
      }

      const distributionBotData = await this.distributionBotRepository.find(userId, uuid);

      if (!distributionBotData) {
        throw 'Distribution bot was not found';
      }

      const isEqual = await comparePassword(distributionBotData.password, password);

      if (!isEqual) {
        throw 'Password is wrong';
      }

      let actualPassword = '';

      if (newPassword) {
        actualPassword = await hashPassword(newPassword);
      }

      const distributionBot: DistributionBot = {
        uuid: distributionBotData.uuid,
        user_id: userId,
        name: name,
        password: actualPassword,
        account_private_key: distributionBotData.account_private_key,
        account_friendly_name: friendlyName,
        token_symbol: tokenSymbol,
        delay: delay,
        active: false
      };

      await this.distributionBotRepository.update(distributionBot, wallets);
    } catch (error) {
      throw error;
    }
  }

  async find(userId: number, uuid: string) {
    const distributionBot = await this.distributionBotRepository.find(userId, uuid);

    return distributionBot;
  }

  async list(userId: number) {
    const listDistributionBots = await this.distributionBotRepository.list(userId);

    return listDistributionBots;
  }

  async listHidden(userId: number) {
    const listDistributionBots = await this.distributionBotRepository.listHidden(userId);

    return listDistributionBots;
  }

  async run(userId: number, uuid: string, password: string, canIgnorePassword: boolean = false, isNewExecution: boolean) {
    try {
      const distributionBotData = await this.distributionBotRepository.find(userId, uuid);

      if (!distributionBotData) {
        throw 'Distribution bot was not found';
      }

      if (distributionBotData.is_hidden) {
        console.log('Bot cannot be run because bot is hidden');
        return;
      }

      const isRunning = listDistributionBots.findIndex((listData) => listData.uuid === distributionBotData.uuid);

      if (isRunning != -1) {
        throw 'This bot is already running';
      }

      if (!distributionBotData.wallets || distributionBotData.wallets.length == 0) {
        throw 'This distribution bot do not have wallets';
      }

      const tokenData = await this.acceptedTokenRepository.findBySymbol(distributionBotData.token_symbol);

      if (!tokenData) {
        throw 'This symbol is not setup';
      }

      if (!tokenData.active) {
        throw 'This symbol is not active';
      }

      let isEqual = false;

      if (canIgnorePassword) {
        isEqual = true;
      } else {
        isEqual = await comparePassword(distributionBotData.password, password);
      }

      if (!isEqual) {
        throw 'Password is wrong';
      }

      const executionId = await this.botExecutionRepository.startExecution(distributionBotData.id!, 'distribution_bot', isNewExecution);

      doDistribution(null, distributionBotData, tokenData, executionId);
    } catch (error) {
      throw error;
    }
  }

  async stop(userId: number, uuid: string, password: string, canIgnorePassword: boolean = false): Promise<void> {
    const distributionBotData = await this.distributionBotRepository.find(userId, uuid);

    if (!distributionBotData) {
      throw 'Distribution bot was not found';
    }

    let isEqual = false;

    if (canIgnorePassword) {
      isEqual = true;
    } else {
      isEqual = await comparePassword(distributionBotData.password, password);
    }

    if (!isEqual) {
      throw 'Password is wrong';
    }

    await this.distributionBotRepository.changeActive(distributionBotData.uuid, 0);
    console.log('Distribution bot stopped');

    const index = listDistributionBots.findIndex((listData) => listData.uuid === distributionBotData.uuid);

    if (index !== -1) {
      listDistributionBots.splice(index, 1);
    }
  }

  async hideUnhide(userId: number, uuid: string) {
    const distributionBotData = await this.distributionBotRepository.find(userId, uuid);

    if (!distributionBotData) {
      throw 'Bot was not found';
    }

    let status = 0;

    if (!distributionBotData.is_hidden) {
      status = 1;
    }

    await this.distributionBotRepository.changeHidden(distributionBotData.uuid, status);

    if (status) {
      this.stop(userId, distributionBotData.uuid, '', true);
      return 'hide'
    } else {
      return 'unhide';
    }
  }

  async executions(userId: number, uuid: string, page: number, symbol: string, startDate: string, endDate: string) {
    if (page < 1) {
      page = 1;
    }

    const botData = await this.distributionBotRepository.find(userId, uuid);

    if (!botData) {
      throw 'Distribution bot was not found';
    }

    const executions = await this.botExecutionRepository.list(botData.id!, page, startDate, endDate, 'distribution_bot');
    const details = await this.distributionBotRepository.executionsDetails(botData.uuid, symbol, startDate, endDate);

    return {
      'details': details,
      'executions': executions
    };
  }

  async reRun(botExecutionId: number, userId: number, uuid: string, password: string) {
    try {
      throw 'Em desenvolvimento';

      /*
      const distributionBotData = await this.distributionBotRepository.find(userId, uuid);

      if (!distributionBotData) {
        throw 'Distribution bot was not found';
      }

      if (distributionBotData.is_hidden) {
        console.log('Bot cannot be run because bot is hidden');
        return;
      }

      const isRunning = listDistributionBots.findIndex((listData) => listData.uuid === distributionBotData.uuid);

      if (isRunning != -1) {
        throw 'This bot is already running';
      }

      if (!distributionBotData.wallets || distributionBotData.wallets.length == 0) {
        throw 'This distribution bot do not have wallets';
      }

      const tokenData = await this.acceptedTokenRepository.findBySymbol(distributionBotData.token_symbol);

      if (!tokenData) {
        throw 'This symbol is not setup';
      }

      if (!tokenData.active) {
        throw 'This symbol is not active';
      }

      let isEqual = await comparePassword(distributionBotData.password, password);

      if (!isEqual) {
        throw 'Password is wrong';
      }

      const result = await this.botExecutionRepository.verifyReRun(botExecutionId, distributionBotData.id!, 'distribution_bot');

      if (result.canReRun) {
        const newWalletSigner = await getSigner(result.privateKey);
        const balanceMatic = await getMaticBalance(newWalletSigner);

        const getFeeData = await getGasFeePrices();
        const maticTaxNeed = getFeeData.gasPrice * BigInt(30000) * BigInt((distributionBotData.wallets.length - Number(result.loop)) * 10);

        if (balanceMatic < maticTaxNeed) {
          throw `Distribution bot don't have necessary [POL]`;
        }

        await this.distributionBotRepository.changeActive(distributionBotData.uuid, 1);
        await this.botExecutionRepository.changeActive(botExecutionId, 1);
        console.log(`[Distribution] ${distributionBotData.name}] re-running...`);
        doDistribution(null, distributionBotData, tokenData, botExecutionId);
      } else {
        throw "This seed bot can't re-run";
      }
      */
    } catch (error) {
      throw error;
    }
  }

  async transactions(executionId: number, userId: number, uuid: string, page: number, symbol: string, startDate: string, endDate: string) {
    if (page < 1) {
      page = 1;
    }

    const botData = await this.distributionBotRepository.find(userId, uuid);

    if (!botData) {
      throw 'Distribution bot was not found';
    }

    const transactions = await this.distributionBotRepository.transactions(botData.uuid, executionId, page, symbol, startDate, endDate);
    const details = await this.distributionBotRepository.transactionsDetails(botData.uuid, executionId, symbol, startDate, endDate);

    return {
      'details': details,
      'transactions': transactions
    };
  }
}

async function doDistribution(signer: Signer | null = null, distributionBotData: DistributionBot, tokenData: AcceptedToken, executionId: number) {
  try {
    console.log(`[Distribution] ${distributionBotData.name} starting...`);

    const distributionBotRepository = new DistributionBotRepository();
    const wallets: DistributionBotWallet[] = distributionBotData!.wallets!;

    if (!signer) {
      await distributionBotRepository.changeActive(distributionBotData.uuid, 1);
      listDistributionBots.push(distributionBotData);
    }

    if (!signer) {
      signer = await getSigner(distributionBotData.account_private_key);
    }

    let selectedTokenTotal = await getSelectedTokenBalance2(signer, tokenData.address);
    selectedTokenTotal = selectedTokenTotal * BigInt(95) / BigInt(100);

    const selectedTokenTotalFormated = Number(ethers.formatUnits(selectedTokenTotal, tokenData.decimals));

    if (selectedTokenTotalFormated > 1) {
      for (const element of wallets) {
        const calcAmount = ethers.parseUnits(calcPercent(selectedTokenTotalFormated, element.percent, tokenData.decimals).toString(), tokenData.decimals);

        const transferResult = await doTransferBasic(
          executionId,
          element.id!,
          distributionBotData.name,
          'distribution_bot_wallet',
          signer,
          element.wallet_address,
          calcAmount,
          tokenData
        );

        if (transferResult.status !== 1) {
          console.log(`[Distribution] ${distributionBotData.name} fail`);
        }
      }
    } else {
      console.log(`[Distribution] ${distributionBotData.name} dont have sufficient balance`);
    }

    timerCountdown(distributionBotData.delay, `[Distribution] ${distributionBotData.name} will execute again`, true);

    await new Promise(resolve => setTimeout(resolve, distributionBotData.delay * 60000));

    const isRunning = await distributionBotRepository.isRunning(distributionBotData.uuid);

    if (isRunning) {
      const distributionBotDataRefreshed = await new DistributionBotRepository().find(distributionBotData.user_id, distributionBotData.uuid);

      if (!distributionBotDataRefreshed) {
        const botExecutionRepository = new BotExecutionRepository();
        await botExecutionRepository.changeActive(executionId, 0);
        console.log(`[Distribution] ${distributionBotData.name} was stopped`);
      } else {
        console.log(`[Distribution] ${distributionBotDataRefreshed.name} is starting again`);
        doDistribution(signer, distributionBotDataRefreshed, tokenData, executionId);
      }
    } else {
      const botExecutionRepository = new BotExecutionRepository();
      await botExecutionRepository.changeActive(executionId, 0);
      console.log(`[Distribution] ${distributionBotData.name} was stopped`);
    }
  } catch (error) {
    console.log('doDistribution error', error);
  }
}