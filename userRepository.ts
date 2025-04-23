import User from '../../models/mongodb/User';
import connectToDatabase from '../../utils/mongodb';

export class MongoUserRepository {
  async findByWallet(wallet: string): Promise<any> {
    try {
      await connectToDatabase();
      const user = await User.findOne({ wallet_address: wallet });
      return user;
    } catch (err) {
      if (err instanceof Error) {
        console.log('MongoDB error', err.message);
        throw err.message;
      } else {
        console.log('MongoDB error', err);
        throw err;
      }
    }
  }

  async createUser(walletAddress: string): Promise<any> {
    try {
      await connectToDatabase();
      const user = new User({
        wallet_address: walletAddress
      });
      await user.save();
      return user;
    } catch (err) {
      if (err instanceof Error) {
        console.log('MongoDB error', err.message);
        throw err.message;
      } else {
        console.log('MongoDB error', err);
        throw err;
      }
    }
  }
}
