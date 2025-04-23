import { Router, Request, Response } from 'express';
import { createValidators, editValidators, onlyUuidValidators, playStopValidators, uuidExecIdValidators, uuidPageExecIdValidators, uuidPageValidators } from '../../validators/distributionBotValidator';
import { DistributionBotController } from '../../controllers/distributionBotController';

const router = Router();

const distributionBotController = new DistributionBotController();

//BOTS
router.post('/create', createValidators, async (req: Request, res: Response) => await distributionBotController.create(req, res));
router.post('/edit', editValidators, async (req: Request, res: Response) => await distributionBotController.edit(req, res));
router.post('/list', async (req: Request, res: Response) => await distributionBotController.list(req, res));
router.post('/list-hidden', async (req: Request, res: Response) => await distributionBotController.listHidden(req, res));
router.post('/find', onlyUuidValidators, async (req: Request, res: Response) => { await distributionBotController.find(req, res) });
router.post('/hide-unhide', onlyUuidValidators, async (req: Request, res: Response) => await distributionBotController.hideUnhide(req, res));
router.post('/play', playStopValidators, async (req: Request, res: Response) => await distributionBotController.play(req, res));
router.post('/stop', playStopValidators, async (req: Request, res: Response) => await distributionBotController.stop(req, res));

//EXECUTIONS
router.post('/executions/list', uuidPageValidators, async (req: Request, res: Response) => await distributionBotController.executions(req, res));
//router.post('/executions/re-run', uuidExecIdValidators, async (req: Request, res: Response) => await distributionBotController.reRun(req, res));

//TRANSACTIONS
router.post('/executions/transactions/list', uuidPageExecIdValidators, async (req: Request, res: Response) => await distributionBotController.transactions(req, res));

export default router;
