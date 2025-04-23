import { settings } from '../utils/settings';

// MySQL repositories
import { UserRepository } from './userRepository';
import { SeedBotRepository } from './seedBotRepository';
import { TradeBotRepository } from './tradeBotRepository';
import { VolumeBotRepository } from './volumeBotRepository';
import { DistributionBotRepository } from './distributionBotRepository';
import { AcceptedTokenRepository } from './acceptedTokenRepository';
import { BotExecutionRepository } from './botExecutionRepository';
import { SwapRepository } from './swapRepository';
import { AirdropRepository } from './airdropRepository';

// MongoDB repositories
import { MongoUserRepository } from './mongodb/userRepository';
import { MongoSeedBotRepository } from './mongodb/seedBotRepository';
import { MongoTradeBotRepository } from './mongodb/tradeBotRepository';
import { MongoVolumeBotRepository } from './mongodb/volumeBotRepository';
import { MongoDistributionBotRepository } from './mongodb/distributionBotRepository';
import { MongoAcceptedTokenRepository } from './mongodb/acceptedTokenRepository';
import { MongoBotExecutionRepository } from './mongodb/botExecutionRepository';
import { MongoSwapRepository } from './mongodb/swapRepository';
import { MongoAirdropRepository } from './mongodb/airdropRepository';

export class RepositoryFactory {
  static createUserRepository() {
    if (settings.MONGODB_URI) {
      return new MongoUserRepository();
    }
    return new UserRepository();
  }

  static createSeedBotRepository() {
    if (settings.MONGODB_URI) {
      return new MongoSeedBotRepository();
    }
    return new SeedBotRepository();
  }

  static createTradeBotRepository() {
    if (settings.MONGODB_URI) {
      return new MongoTradeBotRepository();
    }
    return new TradeBotRepository();
  }

  static createVolumeBotRepository() {
    if (settings.MONGODB_URI) {
      return new MongoVolumeBotRepository();
    }
    return new VolumeBotRepository();
  }

  static createDistributionBotRepository() {
    if (settings.MONGODB_URI) {
      return new MongoDistributionBotRepository();
    }
    return new DistributionBotRepository();
  }

  static createAcceptedTokenRepository() {
    if (settings.MONGODB_URI) {
      return new MongoAcceptedTokenRepository();
    }
    return new AcceptedTokenRepository();
  }

  static createBotExecutionRepository() {
    if (settings.MONGODB_URI) {
      return new MongoBotExecutionRepository();
    }
    return new BotExecutionRepository();
  }

  static createSwapRepository() {
    if (settings.MONGODB_URI) {
      return new MongoSwapRepository();
    }
    return new SwapRepository();
  }

  static createAirdropRepository() {
    if (settings.MONGODB_URI) {
      return new MongoAirdropRepository();
    }
    return new AirdropRepository();
  }
}
