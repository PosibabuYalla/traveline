import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();
const ctrl = new DashboardController();

router.use(authenticate);
router.get('/overview', ctrl.getOverview);
router.get('/activities', ctrl.getActivities);
router.get('/notifications', ctrl.getNotifications);

export default router;
