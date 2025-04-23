import { Router, Request, Response } from 'express';
import { TradeBotController } from '../../controllers/tradeBotController'
import { create, edit, onlyUuid, onlyId, uuidPageExecId, uuidPage, uuidExecId } from '../../validators/tradeBotValidator';

const router = Router();

const tradeBotController = new TradeBotController();

//BOTS
router.post('/create', create, async (req: Request, res: Response) => await tradeBotController.create(req, res));
router.post('/edit', edit, async (req: Request, res: Response) => await tradeBotController.edit(req, res));
router.post('/list', async (req: Request, res: Response) => await tradeBotController.list(req, res));
router.post('/list-hidden', async (req: Request, res: Response) => await tradeBotController.listHidden(req, res));
router.post('/find', onlyUuid, async (req: Request, res: Response) => { await tradeBotController.find(req, res) });
router.post('/hide-unhide', onlyUuid, async (req: Request, res: Response) => await tradeBotController.hideUnhide(req, res));
router.post('/play-buy', onlyUuid, async (req: Request, res: Response) => await tradeBotController.runBuy(req, res));
router.post('/stop-buy', onlyUuid, async (req: Request, res: Response) => await tradeBotController.stopBuy(req, res));
router.post('/play-sell', onlyUuid, async (req: Request, res: Response) => await tradeBotController.runSell(req, res));
router.post('/stop-sell', onlyUuid, async (req: Request, res: Response) => await tradeBotController.stopSell(req, res));

//QUEUE SWAPS
router.post('/queue-swaps', onlyUuid, async (req: Request, res: Response) => await tradeBotController.queueSwaps(req, res));
//router.post('/queue-swaps/run', onlyUuid, async (req: Request, res: Response) => await tradeBotController.runIdleSwaps(req, res));
//router.post('/queue-swaps/stop', onlyUuid, async (req: Request, res: Response) => await tradeBotController.stopIdleSwaps(req, res));
//router.post('/queue-swaps/refund', onlyUuid, async (req: Request, res: Response) => await tradeBotController.refundIdleSwaps(req, res));

//EXECUTIONS
router.post('/executions/list', uuidPage, async (req: Request, res: Response) => await tradeBotController.executions(req, res));
router.post('/executions/re-run', uuidExecId, async (req: Request, res: Response) => await tradeBotController.reRun(req, res));

//TRANSACTIONS
router.post('/executions/transactions', uuidPageExecId, async (req: Request, res: Response) => await tradeBotController.transactions(req, res));
router.post('/executions/transactions/airdrop', onlyId, async (req: Request, res: Response) => await tradeBotController.doAllAirdrops(req, res));

export default router;
