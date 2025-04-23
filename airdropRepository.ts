import Airdrop from '../../models/mongodb/Airdrop';
import connectToDatabase from '../../utils/mongodb';

export class MongoAirdropRepository {
  async findAll(page: number = 1, pageSize: number = 10): Promise<any> {
    try {
      await connectToDatabase();
      const skip = (page - 1) * pageSize;
      const airdrops = await Airdrop.find()
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(pageSize);
      
      const total = await Airdrop.countDocuments();
      
      return {
        airdrops,
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
      const airdrop = await Airdrop.findOne({ uuid });
      return airdrop;
    } catch (err) {
      console.error('MongoDB error:', err);
      throw err;
    }
  }

  async findByBotUuid(botUuid: string): Promise<any[]> {
    try {
      await connectToDatabase();
      const airdrops = await Airdrop.find({ bot_uuid: botUuid })
        .sort({ created_at: -1 });
      return airdrops;
    } catch (err) {
      console.error('MongoDB error:', err);
      throw err;
    }
  }

  async create(airdropData: any): Promise<any> {
    try {
      await connectToDatabase();
      const airdrop = new Airdrop(airdropData);
      await airdrop.save();
      return airdrop;
    } catch (err) {
      console.error('MongoDB error:', err);
      throw err;
    }
  }

  async update(uuid: string, airdropData: any): Promise<any> {
    try {
      await connectToDatabase();
      const airdrop = await Airdrop.findOneAndUpdate(
        { uuid },
        { ...airdropData, updated_at: new Date() },
        { new: true }
      );
      return airdrop;
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
      
      const airdrop = await Airdrop.findOneAndUpdate(
        { uuid },
        updateData,
        { new: true }
      );
      return airdrop;
    } catch (err) {
      console.error('MongoDB error:', err);
      throw err;
    }
  }

  async findPending(): Promise<any[]> {
    try {
      await connectToDatabase();
      const airdrops = await Airdrop.find({ status: 'pending' });
      return airdrops;
    } catch (err) {
      console.error('MongoDB error:', err);
      throw err;
    }
  }
}
