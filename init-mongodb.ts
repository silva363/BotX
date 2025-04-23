import mongoose from 'mongoose';
import User from '../src/models/mongodb/User';
import Bot from '../src/models/mongodb/Bot';
import AcceptedToken from '../src/models/mongodb/AcceptedToken';
import { v4 as uuidv4 } from 'uuid';

// Replace with your MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/botx-db?retryWrites=true&w=majority';

async function initializeDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Bot.deleteMany({});
    await AcceptedToken.deleteMany({});

    // Create a user
    const walletAddress = process.env.WALLET_ADDRESS || '0xYourWalletAddress';
    const user = new User({
      uuid: uuidv4(),
      wallet_address: walletAddress,
      created_at: new Date(),
      updated_at: new Date()
    });
    await user.save();
    console.log('User created:', user);

    // Create accepted tokens
    const tokens = [
      {
        name: 'Polygon',
        symbol: 'MATIC',
        address: '0x0000000000000000000000000000000000001010',
        decimals: 18,
        active: true
      },
      {
        name: 'USD Tether',
        symbol: 'USDT',
        address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
        decimals: 6,
        active: true
      },
      {
        name: 'Wrapped MATIC',
        symbol: 'WMATIC',
        address: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
        decimals: 18,
        active: true
      }
    ];

    for (const token of tokens) {
      const newToken = new AcceptedToken(token);
      await newToken.save();
      console.log('Token created:', newToken);
    }

    // Create sample bots
    const bots = [
      {
        uuid: uuidv4(),
        name: 'Sample Seed Bot',
        type: 'seed',
        token_name: 'USD Tether',
        token_symbol: 'USDT',
        token_address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
        active: false
      },
      {
        uuid: uuidv4(),
        name: 'Sample Trade Bot',
        type: 'trade',
        token_name: 'USD Tether',
        token_symbol: 'USDT',
        token_address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
        active: false
      },
      {
        uuid: uuidv4(),
        name: 'Sample Volume Bot',
        type: 'volume',
        token_name: 'USD Tether',
        token_symbol: 'USDT',
        token_address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
        active: false
      }
    ];

    for (const bot of bots) {
      const newBot = new Bot(bot);
      await newBot.save();
      console.log('Bot created:', newBot);
    }

    console.log('Database initialization complete!');
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    // Close the connection
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the initialization
initializeDatabase();
