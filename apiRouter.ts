import { Router } from 'express';
import { authGuard } from '../middlewares/authGuard';
import publicRoute from './api/publicRoute';
import tradeBotRoute from './api/tradeBotRoute';
import acceptedTokenRoute from './api/acceptedTokenRoute';
import distributionBotRoute from './api/distributionBotRoute';
import statisticRoute from './api/statisticRoute';
import userRoute from './api/userRoute';
import seedBotRoute from './api/seedBotRoute';
import volumeBotRoute from './api/volumeBotRoute';
import { signedGuard } from '../middlewares/signedGuard';

const router = Router();

router.use('/', publicRoute);
router.use('/user', authGuard, userRoute);
router.use('/accepted-token', authGuard, signedGuard, acceptedTokenRoute);
router.use('/statistic', authGuard, signedGuard, statisticRoute);
router.use('/seed-bot', authGuard, signedGuard, seedBotRoute);
router.use('/trade-bot', authGuard, signedGuard, tradeBotRoute);
router.use('/volume-bot', authGuard, signedGuard, volumeBotRoute);
router.use('/distribution-bot', authGuard, signedGuard, distributionBotRoute);

export default router;
