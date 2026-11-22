import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class VehicleController {
  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await prisma.user.findUnique({ where: { id: req.user!.userId }, include: { driver: true } });
      if (!user?.driver) { res.status(404).json({ success: false, error: 'Driver not found' }); return; }
      const vehicle = await prisma.vehicle.create({ data: { driverId: user.driver.id, ...req.body } });
      res.status(201).json({ success: true, data: vehicle });
    } catch {
      res.status(500).json({ success: false, error: 'Create failed' });
    }
  };

  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await prisma.user.findUnique({ where: { id: req.user!.userId }, include: { driver: true } });
      if (!user?.driver) { res.status(404).json({ success: false, error: 'Driver not found' }); return; }
      const vehicles = await prisma.vehicle.findMany({
        where: { driverId: user.driver.id },
        include: { documents: true, photos: true },
      });
      res.json({ success: true, data: vehicles });
    } catch {
      res.status(500).json({ success: false, error: 'Fetch failed' });
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await prisma.user.findUnique({ where: { id: req.user!.userId }, include: { driver: true } });
      if (!user?.driver) { res.status(404).json({ success: false, error: 'Driver not found' }); return; }
      const vehicle = await prisma.vehicle.findFirst({
        where: { id: String(req.params.id), driverId: user.driver.id },
        include: { documents: true, photos: true },
      });
      if (!vehicle) { res.status(404).json({ success: false, error: 'Vehicle not found' }); return; }
      res.json({ success: true, data: vehicle });
    } catch {
      res.status(500).json({ success: false, error: 'Fetch failed' });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await prisma.user.findUnique({ where: { id: req.user!.userId }, include: { driver: true } });
      if (!user?.driver) { res.status(404).json({ success: false, error: 'Driver not found' }); return; }
      const vehicle = await prisma.vehicle.findFirst({ where: { id: String(req.params.id), driverId: user.driver.id } });
      if (!vehicle) { res.status(404).json({ success: false, error: 'Vehicle not found' }); return; }
      const updated = await prisma.vehicle.update({ where: { id: vehicle.id }, data: req.body });
      res.json({ success: true, data: updated });
    } catch {
      res.status(500).json({ success: false, error: 'Update failed' });
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await prisma.user.findUnique({ where: { id: req.user!.userId }, include: { driver: true } });
      if (!user?.driver) { res.status(404).json({ success: false, error: 'Driver not found' }); return; }
      const vehicle = await prisma.vehicle.findFirst({ where: { id: String(req.params.id), driverId: user.driver.id } });
      if (!vehicle) { res.status(404).json({ success: false, error: 'Vehicle not found' }); return; }
      await prisma.vehicle.delete({ where: { id: vehicle.id } });
      res.json({ success: true, message: 'Vehicle deleted' });
    } catch {
      res.status(500).json({ success: false, error: 'Delete failed' });
    }
  };
}
