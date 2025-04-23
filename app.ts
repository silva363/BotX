import express from 'express';
import apiRouter from './src/routes/apiRouter';
import { settings } from './src/utils/settings';
import { SystemService } from './src/services/system/systemService';
import connectToDatabase from './src/utils/mongodb';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', apiRouter);

async function startServer() {
  const port = settings.PORT || 3000;

  // Connect to MongoDB if URI is provided
  if (settings.MONGODB_URI) {
    try {
      await connectToDatabase();
      console.log('Connected to MongoDB');
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
    }
  }

  app.listen(port, () => {
    console.log(`Server running port ${port}`);
  });

  systemInitialize();
}

async function systemInitialize() {
  process.on("uncaughtException", (error) => {
    console.error("uncaughtException error", error);
  });

  process.on("unhandledRejection", (reason, promise) => {
    console.error("unhandledRejection error:", reason);
  });

  try {
    await new Promise(resolve => setTimeout(resolve, 3000));

    const systemService = new SystemService();
    await systemService.verifySeedBots();
    await systemService.verifyTradeBots();
    await systemService.verifyDistributionBots();
    await systemService.verifyVolumeBots();
    await systemService.verifySwaps();
    await systemService.verifyAirdrops();
  } catch (error) {
    console.log('system Initialize error', error);
  }
}

if (process.env.NODE_ENV !== 'test') {
  startServer().catch((err) => {
    console.error('Error starting the server:', err);
  });
}

export default app;