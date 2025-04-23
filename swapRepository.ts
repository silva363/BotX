import Swap from '../../models/mongodb/Swap';
import connectToDatabase from '../../utils/mongodb';

export class MongoSwapRepository {
  async findAll(page: number = 1, pageSize: number = 10): Promise<any> {
    try {
      await connectToDatabase();
      const skip = (page - 1) * pageSize;
      const swaps = await Swap.find()
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(pageSize);
      
      const total = await Swap.countDocuments();
      
      return {
        swaps,
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
      const swap = await Swap.findOne({ uuid });
      return swap;
    } catch (err) {
      console.error('MongoDB error:', err);
      throw err;
    }
  }

  async findByBotUuid(botUuid: string): Promise<any[]> {
    try {
      await connectToDatabase();
      const swaps = await Swap.find({ bot_uuid: botUuid })
        .sort({ created_at: -1 });
      return swaps;
    } catch (err) {
      console.error('MongoDB error:', err);
      throw err;
    }
  }

  async create(swapData: any): Promise<any> {
    try {
      await connectToDatabase();
      const swap = new Swap(swapData);
      await swap.save();
      return swap;
    } catch (err) {
      console.error('MongoDB error:', err);
      throw err;
    }
  }

  async update(uuid: string, swapData: any): Promise<any> {
    try {
      await connectToDatabase();
      const swap = await Swap.findOneAndUpdate(
        { uuid },
        { ...swapData, updated_at: new Date() },
        { new: true }
      );
      return swap;
    } catch (err) {
      console.error('MongoDB error:', err);
      throw err;
    }
  }

  async updateStatus(uuid: string, status: string, txHash?: string): Promise<any> {
    try {
      await connectToDatabase();
      const updateData: any = { 
        status, 
        updated_at: new Date() 
      };
      
      if (txHash) {
        updateData.tx_hash = txHash;
      }
      
      const swap = await Swap.findOneAndUpdate(
        { uuid },
        updateData,
        { new: true }
      );
      return swap;
    } catch (err) {
      console.error('MongoDB error:', err);
      throw err;
    }
  }

  async findPending(): Promise<any[]> {
    try {
      await connectToDatabase();
      const swaps = await Swap.find({ status: 'pending' });
      return swaps;
    } catch (err) {
      console.error('MongoDB error:', err);
      throw err;
    }
  }
}
