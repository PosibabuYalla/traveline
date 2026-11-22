import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class NotificationController {
  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await prisma.user.findUnique({ where: { id: req.user!.userId }, include: { driver: true } });
      if (!user?.driver) { res.status(404).json({ success: false, error: 'Driver not found' }); return; }
      const notifications = await prisma.notification.findMany({
        where: { driverId: user.driver.id },
        orderBy: { createdAt: 'desc' },
      });
      res.json({ success: true, data: notifications });
    } catch {
      res.status(500).json({ success: false, error: 'Fetch failed' });
    }
  };

  markRead = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await prisma.user.findUnique({ where: { id: req.user!.userId }, include: { driver: true } });
      if (!user?.driver) { res.status(404).json({ success: false, error: 'Driver not found' }); return; }
      const notif = await prisma.notification.findFirst({ where: { id: String(req.params.id), driverId: user.driver.id } });
      if (!notif) { res.status(404).json({ success: false, error: 'Notification not found' }); return; }
      await prisma.notification.update({ where: { id: notif.id }, data: { isRead: true } });
      res.json({ success: true });
    } catch {
      res.status(500).json({ success: false, error: 'Update failed' });
    }
  };

  markAllRead = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await prisma.user.findUnique({ where: { id: req.user!.userId }, include: { driver: true } });
      if (!user?.driver) { res.status(404).json({ success: false, error: 'Driver not found' }); return; }
      await prisma.notification.updateMany({
        where: { driverId: user.driver.id, isRead: false },
        data: { isRead: true },
      });
      res.json({ success: true });
    } catch {
      res.status(500).json({ success: false, error: 'Update failed' });
    }
  };
}
