import express from 'express';
import { settings } from './src/utils/settings';
import cors from 'cors';

const app = express();

// Enable CORS
app.use(cors());
app.use(express.json());

// Add a middleware to log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Mock API responses
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'BotX API is running in demo mode' });
});

// Handle all API routes
app.all('/api/*', (req, res, next) => {
  // If the route is already defined, use that handler
  if (req.route) {
    return next();
  }

  // For any undefined API route, return a success response with mock data
  console.log(`Handling undefined route: ${req.method} ${req.path}`);

  // Default response for any API endpoint
  res.json({
    success: true,
    message: 'Demo API response',
    data: { demo: true }
  });
});

// User authentication endpoints
app.post('/api/user/getSignMessage', (req, res) => {
  res.json({ message: 'Demo sign message for wallet authentication' });
});

app.post('/api/user/get-sign-message', (req, res) => {
  res.json({ message: 'Demo sign message for wallet authentication' });
});

// Handle the specific endpoint that's causing the 404 error
app.get('/undefined/api/ar/getSignMessage', (req, res) => {
  res.json({ message: 'Demo sign message for wallet authentication' });
});

app.post('/undefined/api/ar/getSignMessage', (req, res) => {
  res.json({ message: 'Demo sign message for wallet authentication' });
});

app.post('/api/user/auth', (req, res) => {
  res.json({
    status: true,
    auth_token: 'demo_auth_token',
    user: {
      id: 1,
      uuid: 'demo-user-uuid',
      wallet_address: req.body.address || '0xdemoWalletAddress'
    }
  });
});

// Mock endpoints for seed bots
app.get('/api/seed-bot/list', (req, res) => {
  res.json({
    bots: [
      {
        id: 1,
        uuid: 'demo-seed-bot-1',
        name: 'Demo Seed Bot 1',
        token_name: 'Demo Token',
        token_symbol: 'DEMO',
        token_address: '0xdemoTokenAddress',
        amount: 1.5,
        cycles: 10,
        cycle_delay: 180,
        cycle_ghosts: 15,
        active: false,
        created_at: new Date().toISOString()
      }
    ],
    total: 1
  });
});

// Mock endpoints for trade bots
app.get('/api/trade-bot/list', (req, res) => {
  res.json({
    bots: [
      {
        id: 1,
        uuid: 'demo-trade-bot-1',
        name: 'Demo Trade Bot 1',
        token_name: 'Demo Token',
        token_symbol: 'DEMO',
        token_address: '0xdemoTokenAddress',
        target_price: 0.5,
        min_amount: 0.1,
        max_amount: 1.0,
        min_delay: 60,
        max_delay: 300,
        active: false,
        created_at: new Date().toISOString()
      }
    ],
    total: 1
  });
});

// Mock endpoints for volume bots
app.get('/api/volume-bot/list', (req, res) => {
  res.json({
    bots: [
      {
        id: 1,
        uuid: 'demo-volume-bot-1',
        name: 'Demo Volume Bot 1',
        token_name: 'Demo Token',
        token_symbol: 'DEMO',
        token_address: '0xdemoTokenAddress',
        min_amount: 0.1,
        max_amount: 1.0,
        min_delay: 60,
        max_delay: 300,
        active: false,
        created_at: new Date().toISOString()
      }
    ],
    total: 1
  });
});

// Mock endpoints for distribution bots
app.get('/api/distribution-bot/list', (req, res) => {
  res.json({
    bots: [
      {
        id: 1,
        uuid: 'demo-distribution-bot-1',
        name: 'Demo Distribution Bot 1',
        token_symbol: 'DEMO',
        delay: 300,
        active: false,
        created_at: new Date().toISOString()
      }
    ],
    total: 1
  });
});

// Mock endpoints for accepted tokens
app.get('/api/acceptedTokens/list', (req, res) => {
  res.json({
    tokens: [
      {
        id: 1,
        name: 'Demo Token',
        symbol: 'DEMO',
        address: '0xdemoTokenAddress',
        decimals: 18,
        pool_address: '0xdemoPoolAddress',
        pool_name: 'Demo Pool',
        pool_symbol: 'DEMO-MATIC',
        pool_decimals: 18,
        active: true,
        created_at: new Date().toISOString()
      }
    ],
    total: 1
  });
});

// Start the server
async function startServer() {
  const port = settings.PORT || 3001;

  app.listen(port, () => {
    console.log(`Demo server running on port ${port}`);
    console.log('This is a demo version without database connectivity');
    console.log('Only mock data is available');
  });
}

startServer().catch((err) => {
  console.error('Error starting the demo server:', err);
});
