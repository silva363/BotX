import { Router, Request, Response } from 'express';
import AuthHelper from '../../helpers/authHelper';
import { verifySignPermission } from '../../utils/validation';

const router = Router();
const auth = new AuthHelper();

router.post('/get-sign-message', async (req: Request, res: Response) => {
    res.json(await auth.getSignMessage());
});

router.post('/auth', async (req: Request, res: Response) => {
    const body = req.body;
    res.json(await verifySignPermission(body.address, body.signature, body.message));
})

export default router;
