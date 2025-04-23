import AcceptedToken from '../../models/mongodb/AcceptedToken';
import connectToDatabase from '../../utils/mongodb';

export class MongoAcceptedTokenRepository {
  async findAll(page: number = 1, pageSize: number = 10): Promise<any> {
    try {
      await connectToDatabase();
      const skip = (page - 1) * pageSize;
      const tokens = await AcceptedToken.find()
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(pageSize);
      
      const total = await AcceptedToken.countDocuments();
      
      return {
        tokens,
        total
      };
    } catch (err) {
      console.error('MongoDB error:', err);
      throw err;
    }
  }

  async findActive(): Promise<any[]> {
    try {
      await connectToDatabase();
      const tokens = await AcceptedToken.find({ active: true });
      return tokens;
    } catch (err) {
      console.error('MongoDB error:', err);
      throw err;
    }
  }

  async findByAddress(address: string): Promise<any> {
    try {
      await connectToDatabase();
      const token = await AcceptedToken.findOne({ address });
      return token;
    } catch (err) {
      console.error('MongoDB error:', err);
      throw err;
    }
  }

  async create(tokenData: any): Promise<any> {
    try {
      await connectToDatabase();
      const token = new AcceptedToken(tokenData);
      await token.save();
      return token;
    } catch (err) {
      console.error('MongoDB error:', err);
      throw err;
    }
  }

  async update(id: string, tokenData: any): Promise<any> {
    try {
      await connectToDatabase();
      const token = await AcceptedToken.findByIdAndUpdate(
        id,
        { ...tokenData, updated_at: new Date() },
        { new: true }
      );
      return token;
    } catch (err) {
      console.error('MongoDB error:', err);
      throw err;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await connectToDatabase();
      const result = await AcceptedToken.findByIdAndDelete(id);
      return !!result;
    } catch (err) {
      console.error('MongoDB error:', err);
      throw err;
    }
  }

  async updateStatus(id: string, active: boolean): Promise<any> {
    try {
      await connectToDatabase();
      const token = await AcceptedToken.findByIdAndUpdate(
        id,
        { active, updated_at: new Date() },
        { new: true }
      );
      return token;
    } catch (err) {
      console.error('MongoDB error:', err);
      throw err;
    }
  }
}
