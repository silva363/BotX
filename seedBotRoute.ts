import { Router, Request, Response } from 'express';
import { SeedBotController } from '../../controllers/seedBotController'
import { createValidators, editValidators, onlyUuidValidators, uuidExecIdValidators, uuidPageExecIdValidators, uuidPageValidators } from '../../validators/seedBotValidator';

const router = Router();

const seedBotController = new SeedBotController();

//BOTS
router.post('/create', createValidators, async (req: Request, res: Response) => await seedBotController.create(req, res));
router.post('/edit', editValidators, async (req: Request, res: Response) => await seedBotController.edit(req, res));
router.post('/list', async (req: Request, res: Response) => await seedBotController.list(req, res));
router.post('/list-hidden', async (req: Request, res: Response) => await seedBotController.listHidden(req, res));
router.post('/find', onlyUuidValidators, async (req: Request, res: Response) =>{ await seedBotController.find(req, res)});
router.post('/hide-unhide', onlyUuidValidators, async (req: Request, res: Response) => await seedBotController.hideUnhide(req, res));
router.post('/play', onlyUuidValidators, async (req: Request, res: Response) => await seedBotController.run(req, res));

//EXECUTIONS
router.post('/executions/list', uuidPageValidators, async (req: Request, res: Response) => await seedBotController.executions(req, res));
router.post('/executions/re-run', uuidExecIdValidators, async (req: Request, res: Response) => await seedBotController.reRun(req, res));

//TRANSACTIONS
router.post('/executions/transactions/list', uuidPageExecIdValidators, async (req: Request, res: Response) => await seedBotController.transactions(req, res));

export default router;
