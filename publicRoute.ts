import { settings } from '../../utils/settings';
import { Router, Request, Response } from 'express';

const router = Router();

router.get('/verifyStatus', async (req: Request, res: Response) => {
    res.status(200).json({ message: settings.APP_NAME });
});

export default router;
