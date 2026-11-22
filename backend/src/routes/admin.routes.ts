import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireAdmin } from '../middlewares/admin.middleware';

const router = Router();
const ctrl = new AdminController();

// Public — setup & login
router.post('/seed', ctrl.seedAdmin);
router.post('/login', ctrl.login);

// Protected — admin only
router.use(authenticate, requireAdmin);
router.get('/stats', ctrl.getStats);
router.get('/drivers', ctrl.getDrivers);
router.get('/drivers/:id', ctrl.getDriver);
router.put('/drivers/:id/status', ctrl.updateStatus);

export default router;
