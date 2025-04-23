import { DistributionBotService } from "../distributionBotService";
import { SeedBotService } from "../seedBotService";
import { RepositoryFactory } from "../../repositories/repositoryFactory";
import { BotExecution } from "../../models/BotExecution";
import { AirdropRepository } from "../../repositories/airdropRepository";
import { transferTokenTo } from "../transactionService";
import { Airdrop } from "../../models/Airdrop";
import { getSelectedTokenBalance2, getSigner } from "../../helpers/ethersHelper";
import { timerCountdown } from "../../helpers/functionsHelper";
import { getGasFeePrices } from "../../helpers/cryptoHelper";
import { TradeBotSellService } from "../tradeBotSellService";
import { TradeBotBuyService } from "../tradeBotBuyService";
import { SwapRepository } from "../../repositories/swapRepository";
import { Swap } from "../../models/Swap";

export class SystemService {
  private tradeBotRepository: any;
  private distributionBotRepository: any;
  private seedBotRepository: any;
  private volumeBotRepository: any;

  constructor() {
    this.tradeBotRepository = RepositoryFactory.createTradeBotRepository();
    this.distributionBotRepository = RepositoryFactory.createDistributionBotRepository();
    this.seedBotRepository = RepositoryFactory.createSeedBotRepository();
    this.volumeBotRepository = RepositoryFactory.createVolumeBotRepository();
  }

  async verifySeedBots() {
    try {
      console.log('[Seed] Verifying...');
      await checkBotsExecutions('seed_bot', 'Seed');
      await restartSeedBots(this.seedBotRepository);
    } catch (error) {
      console.log('verifySeedBots error', error);
    }
  }

  async verifyTradeBots() {
    try {
      console.log('[Trade] Verifying...');
      await checkBotsExecutions('trade_bot', 'Trade');
      //await restartPendingTradeBotActives(this.tradeBotRepository);
      await restartTradeBotActives(this.tradeBotRepository);
    } catch (error) {
      console.log('verifyTradeBots error', error);
    }
  }

  async verifyDistributionBots() {
    try {
      console.log('[Distribution] Verifying...');
      await checkBotsExecutions('distribution_bot', 'Distribution');
      await restartDistributionBots(this.distributionBotRepository);
    } catch (error) {
      console.log('verifyDistributionBots error', error);
    }
  }

  async verifyVolumeBots() {
    /*
    try {
      console.log('[Volume] Verifying...');
      await checkBotsExecutions('volume_bot', 'Volume');
      await restartVolumeBotActives(this.volumeBotRepository);
    } catch (error) {
      console.log('verifyVolumeBots error', error);
    }
    */
  }

  async verifySwaps() {
    try {
      console.log('[Swap] Verifying...');
      await doPendingSwaps();
    } catch (error) {
      console.log('verifySwaps error', error);
    }
  }

  async verifyAirdrops() {
    try {
      console.log('[Airdrop] Verifying...');
      await doPendingAirdrops();
    } catch (error) {
      console.log('verifyAirdrops error', error);
    }
  }
}

async function checkBotsExecutions(table: keyof BotExecution, botType: string) {
  try {
    console.log(`[${botType}] checking execution status...`);

    const botExecutionRepository = new BotExecutionRepository();
    const listBots: any = await botExecutionRepository.listBotsInactivesWithExecutionActive(table);

    if (listBots.length > 0) {
      console.log(`[${botType}] have ${listBots.length} execution status to update`);


      for (let index = 0; index < listBots.length; index++) {
        const element = listBots[index];
        const exists = await botExecutionRepository.havePendingExecution(element.id, table);

        if (exists) {
          await botExecutionRepository.changeActive(element.execution_id, 2);
          console.log(`[${botType}] have ${element.name} execution status updated`);
        }
      }
    }

    console.log(`[${botType}] check execution status completed`);
  } catch (error) {
    console.log('checkBotsExecutions error', error);
  }
}

async function restartSeedBots(seedBotRepository: SeedBotRepository) {
  try {
    console.log('[Seed] checking restart...');
    const listBots = await seedBotRepository.listToStart();

    if (listBots.length > 0) {
      console.log(`[Seed] have ${listBots.length} bots to restart`);

      const seedBotService = new SeedBotService();

      for (let index = 0; index < listBots.length; index++) {
        const element: any = listBots[index];

        if (element.execution_id && element.user_id && element.uuid) {
          await seedBotService.reRun(element.execution_id, element.user_id, element.uuid);
        }
      }
    }

    console.log(`[Seed] check restart completed`);
  } catch (error) {
    console.log('restartSeedBots error', error);
  }
}

async function restartTradeBotActives(tradeBotRepository: TradeBotRepository) {
  try {
    console.log(`[Trade] checking actives...`);
    const listBots: any = await tradeBotRepository.listToRestart();

    if (listBots.length > 0) {
      console.log(`[Trade] have ${listBots.length} trade bots to continue`);

      const tradeBotSellService = new TradeBotSellService();
      const tradeBotBuyService = new TradeBotBuyService();
      const tradeBotRepository = new TradeBotRepository();

      for (let index = 0; index < listBots.length; index++) {
        const element = listBots[index];

        if (element.uuid && element.user_id) {
          switch (element.strategy) {
            case 'buy':
              await tradeBotBuyService.run(element.user_id, element.uuid, false, true, 0);
              break;

            case 'sell':
              await tradeBotSellService.run(element.user_id, element.uuid, false, true, 0);
              break;

            default:
              break;
          }
        } else if (element.uuid) {
          console.log(`[Trade] ${element.uuid} has stopped`);
          await tradeBotRepository.changeActive(element.uuid, 0);
        }
      }
    }

    console.log(`[Trade] check actives completed`);
  } catch (error) {
    console.log('restartTradeBotActives error', error);
  }
}

async function restartDistributionBots(distributionBotRepository: DistributionBotRepository) {
  try {
    console.log('[Distribution] checking restart...');
    const listBots = await distributionBotRepository.listToStart();
    const distributionBotService = new DistributionBotService();

    if (listBots.length > 0) {
      console.log(`[Distribution] have ${listBots.length} bots to restart`);

      for (let index = 0; index < listBots.length; index++) {
        const element = listBots[index];

        if (element.active) {
          await distributionBotService.run(element.user_id, element.uuid, '', true, false);
        }
      }
    }

    console.log(`[Distribution] check restart completed`);
  } catch (error) {
    console.log('restartDistributionBots error', error);
  }
}

async function doPendingSwaps() {
  try {
    console.log(`[Swap] checking pending...`);
    const swapRepository = new SwapRepository();
    const list: Swap[] = await swapRepository.listToStart();

    if (list.length > 0) {
      console.log(`[Swap] pending ${list.length}`);

      const tradeBotBuyService = new TradeBotBuyService();
      const tradeBotSellService = new TradeBotSellService();

      for (let index = 0; index < list.length; index++) {
        const element = list[index];

        switch (element.swap_type) {
          case 'buy':
            console.log(`[Swap] ${element.swap_type} restarting...`);

            await tradeBotBuyService.restartSwap(element.bot_execution, element.user_id, element.bot_uuid, element);
            break;

          case 'sell':
            console.log(`[Swap] ${element.swap_type} restarting...`);
            await tradeBotSellService.restartSwap(element.bot_execution, element.user_id, element.bot_uuid, element);
            break;

          default:
            break;
        }
      }
    }

    console.log(`[Swap] check pending completed`);
  } catch (error) {
    console.log('doPendingSwaps error', error);
  }
}

async function doPendingAirdrops() {
  try {
    console.log(`[Airdrop] checking pending...`);
    const airdropRepository = new AirdropRepository();
    const list: Airdrop[] = await airdropRepository.listToStart(0, 0);

    if (list.length > 0) {
      console.log(`[Airdrop] pending ${list.length}`);

      for (let index = 0; index < list.length; index++) {
        const element = list[index];

        timerCountdown(element.delay_to_start, `[Airdrop] id ${element.id!} is sending [${element.token_symbol}] to ${element.destiny_address}`, true);

        setTimeout(async () => {
          const signer = await getSigner(element.private_key);

          let tokenBalance = await getSelectedTokenBalance2(signer, element.token_address);

          if (tokenBalance > BigInt(0)) {
            if (element.token_symbol == 'MATIC' || element.token_symbol == 'POL') {
              const gastFee = await getGasFeePrices();
              tokenBalance = tokenBalance - gastFee.gasPrice * BigInt(30000);

              if (tokenBalance < gastFee.gasPrice * BigInt(30000)) {
                await airdropRepository.changeStatus(element.id!, 1);
                return;
              }
            }

            const result = await transferTokenTo(signer, element.token_address, element.token_symbol, element.destiny_address, tokenBalance, 'transfer');

            if (result.status == 1) {
              await airdropRepository.changeStatus(element.id!, 1);
            }

          } else {
            await airdropRepository.changeStatus(element.id!, 1);
          }
        }, element.delay_to_start * 60000);
      }
    }

    console.log(`[Airdrop] check pending completed`);
  } catch (error) {
    console.log('doPendingAirdrops error', error);
  }
}

