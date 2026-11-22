import { Router } from 'express';
import { DriverController } from '../controllers/driver.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();
const ctrl = new DriverController();

router.use(authenticate);
router.get('/me', ctrl.getMe);
router.put('/me', ctrl.updateMe);
router.put('/registration/step/:step', ctrl.updateStep);
router.post('/registration/submit', ctrl.submitRegistration);

export default router;
