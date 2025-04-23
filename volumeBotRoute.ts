import { Router, Request, Response } from 'express';
import { createValidators, editValidators, onlyUuidValidators, uuidPageExecIdValidators, uuidPageValidators } from '../../validators/volumeBotValidator';
import { VolumeBotController } from '../../controllers/volumeBotController';

const router = Router();

const volumeBotController = new VolumeBotController();

//BOTS
router.post('/create', createValidators, async (req: Request, res: Response) => await volumeBotController.create(req, res));
router.post('/edit', editValidators, async (req: Request, res: Response) => await volumeBotController.edit(req, res));
router.post('/list', async (req: Request, res: Response) => await volumeBotController.list(req, res));
router.post('/list-hidden', async (req: Request, res: Response) => await volumeBotController.listHidden(req, res));
router.post('/find', onlyUuidValidators, async (req: Request, res: Response) => { await volumeBotController.find(req, res) });
router.post('/hide-unhide', onlyUuidValidators, async (req: Request, res: Response) => await volumeBotController.hideUnhide(req, res));
router.post('/play', onlyUuidValidators, async (req: Request, res: Response) => await volumeBotController.run(req, res));
router.post('/stop', onlyUuidValidators, async (req: Request, res: Response) => await volumeBotController.stop(req, res));

//EXECUTIONS
router.post('/executions/list', uuidPageValidators, async (req: Request, res: Response) => await volumeBotController.executions(req, res));
//router.post('/executions/re-run', uuidExecIdValidators, async (req: Request, res: Response) => await volumeBotController.reRun(req, res));

//TRANSACTIONS
router.post('/executions/transactions/list', uuidPageExecIdValidators, async (req: Request, res: Response) => await volumeBotController.transactions(req, res));

export default router;
