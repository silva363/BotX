import express from 'express';
import { settings } from './src/utils/settings';
import connectToDatabase from './src/utils/mongodb';
import cors from 'cors';
import User from './src/models/mongodb/User';
import Bot from './src/models/mongodb/Bot';
import AcceptedToken from './src/models/mongodb/AcceptedToken';
import jwt from 'jsonwebtoken';
import { ethers } from 'ethers';

const app = express();

// Enable CORS
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'BotX API is running with MongoDB' });
});

// Authentication middleware
const authMiddleware = async (req: any, res: any, next: any) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded: any = jwt.verify(token, settings.JWT_SECRET_KEY || '');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// User authentication endpoints
app.post('/api/user/get-sign-message', (req, res) => {
  res.json({ message: 'Welcome to BotX! Please sign this message to authenticate.' });
});

app.post('/api/user/auth', async (req, res) => {
  try {
    const { address, message, signature } = req.body;

    // Verify signature
    const signerAddr = ethers.verifyMessage(message, signature);
    
    if (signerAddr.toLowerCase() !== address.toLowerCase()) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Find or create user
    await connectToDatabase();
    let user = await User.findOne({ wallet_address: address.toLowerCase() });
    
    if (!user) {
      user = new User({
        wallet_address: address.toLowerCase()
      });
      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, wallet: user.wallet_address },
      settings.JWT_SECRET_KEY || '',
      { expiresIn: settings.JWT_EXPIRATION || '1d' }
    );

    res.json({
      status: true,
      auth_token: token,
      user: {
        id: user._id,
        uuid: user.uuid,
        wallet_address: user.wallet_address
      }
    });
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// Protected routes
app.get('/api/seed-bot/list', authMiddleware, async (req, res) => {
  try {
    await connectToDatabase();
    const bots = await Bot.find({ type: 'seed' });
    res.json({
      bots,
      total: bots.length
    });
  } catch (error) {
    console.error('Error fetching seed bots:', error);
    res.status(500).json({ error: 'Failed to fetch seed bots' });
  }
});

app.get('/api/trade-bot/list', authMiddleware, async (req, res) => {
  try {
    await connectToDatabase();
    const bots = await Bot.find({ type: 'trade' });
    res.json({
      bots,
      total: bots.length
    });
  } catch (error) {
    console.error('Error fetching trade bots:', error);
    res.status(500).json({ error: 'Failed to fetch trade bots' });
  }
});

app.get('/api/volume-bot/list', authMiddleware, async (req, res) => {
  try {
    await connectToDatabase();
    const bots = await Bot.find({ type: 'volume' });
    res.json({
      bots,
      total: bots.length
    });
  } catch (error) {
    console.error('Error fetching volume bots:', error);
    res.status(500).json({ error: 'Failed to fetch volume bots' });
  }
});

app.get('/api/distribution-bot/list', authMiddleware, async (req, res) => {
  try {
    await connectToDatabase();
    const bots = await Bot.find({ type: 'distribution' });
    res.json({
      bots,
      total: bots.length
    });
  } catch (error) {
    console.error('Error fetching distribution bots:', error);
    res.status(500).json({ error: 'Failed to fetch distribution bots' });
  }
});

app.get('/api/acceptedTokens/list', authMiddleware, async (req, res) => {
  try {
    await connectToDatabase();
    const tokens = await AcceptedToken.find({ active: true });
    res.json({
      tokens,
      total: tokens.length
    });
  } catch (error) {
    console.error('Error fetching accepted tokens:', error);
    res.status(500).json({ error: 'Failed to fetch accepted tokens' });
  }
});

// Start the server
async function startServer() {
  const port = settings.PORT || 3001;

  // Connect to MongoDB
  if (settings.MONGODB_URI) {
    try {
      await connectToDatabase();
      console.log('Connected to MongoDB');
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
    }
  }

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log('MongoDB backend is active');
  });
}

startServer().catch((err) => {
  console.error('Error starting the server:', err);
});

export default app;
