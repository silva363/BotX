import SeedBot from '../../models/mongodb/SeedBot';
import connectToDatabase from '../../utils/mongodb';

export class MongoSeedBotRepository {
  async findAll(page: number = 1, pageSize: number = 10): Promise<any> {
    try {
      await connectToDatabase();
      const skip = (page - 1) * pageSize;
      const bots = await SeedBot.find()
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(pageSize);
      
      const total = await SeedBot.countDocuments();
      
      return {
        bots,
        total
      };
    } catch (err) {
      console.error('MongoDB error:', err);
      throw err;
    }
  }

  async findByUuid(uuid: string): Promise<any> {
    try {
      await connectToDatabase();
      const bot = await SeedBot.findOne({ uuid });
      return bot;
    } catch (err) {
      console.error('MongoDB error:', err);
      throw err;
    }
  }

  async create(botData: any): Promise<any> {
    try {
      await connectToDatabase();
      const bot = new SeedBot(botData);
      await bot.save();
      return bot;
    } catch (err) {
      console.error('MongoDB error:', err);
      throw err;
    }
  }

  async update(uuid: string, botData: any): Promise<any> {
    try {
      await connectToDatabase();
      const bot = await SeedBot.findOneAndUpdate(
        { uuid },
        { ...botData, updated_at: new Date() },
        { new: true }
      );
      return bot;
    } catch (err) {
      console.error('MongoDB error:', err);
      throw err;
    }
  }

  async delete(uuid: string): Promise<boolean> {
    try {
      await connectToDatabase();
      const result = await SeedBot.deleteOne({ uuid });
      return result.deletedCount > 0;
    } catch (err) {
      console.error('MongoDB error:', err);
      throw err;
    }
  }

  async updateStatus(uuid: string, active: boolean): Promise<any> {
    try {
      await connectToDatabase();
      const bot = await SeedBot.findOneAndUpdate(
        { uuid },
        { active, updated_at: new Date() },
        { new: true }
      );
      return bot;
    } catch (err) {
      console.error('MongoDB error:', err);
      throw err;
    }
  }

  async findActive(): Promise<any[]> {
    try {
      await connectToDatabase();
      const bots = await SeedBot.find({ active: true });
      return bots;
    } catch (err) {
      console.error('MongoDB error:', err);
      throw err;
    }
  }
}
