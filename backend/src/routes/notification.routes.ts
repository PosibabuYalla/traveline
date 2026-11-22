import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();
const ctrl = new NotificationController();

router.use(authenticate);
router.get('/', ctrl.getAll);
router.put('/:id/read', ctrl.markRead);
router.put('/read-all', ctrl.markAllRead);

export default router;
