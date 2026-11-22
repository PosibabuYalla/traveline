import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireAdmin } from '../middlewares/admin.middleware';
import rateLimit from 'express-rate-limit';

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, error: 'Too many admin requests, please try again later.' },
});

const router = Router();
const ctrl = new AdminController();

// One-time setup — seed only works once (controller rejects if admin already exists)
router.post('/seed', adminLimiter, ctrl.seedAdmin);

// Admin login with strict rate limit
router.post('/login', adminLimiter, ctrl.login);

// Protected — admin only
router.use(authenticate, requireAdmin);
router.get('/stats', ctrl.getStats);
router.get('/drivers', ctrl.getDrivers);
router.get('/drivers/:id', ctrl.getDriver);
router.put('/drivers/:id/status', ctrl.updateStatus);

export default router;
