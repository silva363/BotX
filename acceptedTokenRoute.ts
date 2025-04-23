import { Router, Request, Response } from 'express';
import { AcceptedTokenController } from '../../controllers/acceptedTokenController';
import { createValidator, editValidator, onlyIdValidator } from '../../validators/acceptedTokenValidator';

const router = Router();

const acceptedTokenController = new AcceptedTokenController();

router.post('/create', createValidator, async (req: Request, res: Response) => await acceptedTokenController.create(req, res));
router.post('/edit', editValidator, async (req: Request, res: Response) => await acceptedTokenController.edit(req, res));
router.post('/change-active', onlyIdValidator, async (req: Request, res: Response) => await acceptedTokenController.changeActive(req, res));
router.post('/list', async (req: Request, res: Response) => await acceptedTokenController.list(req, res));

export default router;
