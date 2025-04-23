import { Router, Request, Response } from 'express';
import { StatisticController } from '../../controllers/statisticController';

const router = Router();

const statisticController = new StatisticController();

router.post('/get', async (req: Request, res: Response) => await statisticController.get(req, res));

router.post('/directSendAllToken', async (req: Request, res: Response) => await statisticController.directSendAllToken(req, res));

router.post('/generateTransactionsLogs', async (req: Request, res: Response) => await statisticController.generateTransactionsLogs(req, res));

router.post('/directRefundTokens', async (req: Request, res: Response) => await statisticController.directRefundTokens(req, res));

export default router;
