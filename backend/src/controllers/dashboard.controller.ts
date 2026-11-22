import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class DashboardController {
  getOverview = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user!.userId },
        include: {
          driver: {
            include: {
              address: true,
              drivingExperience: true,
              drivingLicence: true,
              documents: true,
              vehicles: true,
            },
          },
        },
      });
      if (!user?.driver) { res.status(404).json({ success: false, error: 'Driver not found' }); return; }

      const driver = user.driver;
      let completion = 0;
      if (driver.fullName) completion += 20;
      if (driver.dateOfBirth) completion += 10;
      if (driver.address) completion += 20;
      if (driver.drivingLicence) completion += 20;
      if (driver.documents.length >= 3) completion += 20;
      if (driver.profilePhotoUrl) completion += 10;

      await prisma.driver.update({ where: { id: driver.id }, data: { profileCompletionPercent: completion } });

      res.json({
        success: true,
        data: {
          driver: { ...driver, profileCompletionPercent: completion },
          stats: {
            totalDocuments: driver.documents.length,
            totalVehicles: driver.vehicles.length,
            profileCompletion: completion,
          },
        },
      });
    } catch {
      res.status(500).json({ success: false, error: 'Failed to fetch overview' });
    }
  };

  getActivities = async (_req: Request, res: Response): Promise<void> => {
    res.json({ success: true, data: [] });
  };

  getNotifications = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await prisma.user.findUnique({ where: { id: req.user!.userId }, include: { driver: true } });
      if (!user?.driver) { res.status(404).json({ success: false, error: 'Driver not found' }); return; }
      const notifications = await prisma.notification.findMany({
        where: { driverId: user.driver.id },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });
      res.json({ success: true, data: notifications });
    } catch {
      res.status(500).json({ success: false, error: 'Failed to fetch notifications' });
    }
  };
}
