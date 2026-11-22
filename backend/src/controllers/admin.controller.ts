import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';

const prisma = new PrismaClient();

export class AdminController {
  /* ── Auth ── */
  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || user.role !== 'ADMIN') {
        res.status(401).json({ success: false, error: 'Invalid credentials' }); return;
      }
      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) { res.status(401).json({ success: false, error: 'Invalid credentials' }); return; }

      const accessToken = generateAccessToken({ userId: user.id, email: user.email, role: user.role });
      const refreshToken = generateRefreshToken({ userId: user.id });
      const expiresAt = new Date(); expiresAt.setDate(expiresAt.getDate() + 7);
      await prisma.refreshToken.create({ data: { token: refreshToken, userId: user.id, expiresAt } });

      res.json({ success: true, data: { accessToken, refreshToken, user: { id: user.id, email: user.email, role: user.role } } });
    } catch { res.status(500).json({ success: false, error: 'Login failed' }); }
  };

  /* ── Drivers list ── */
  getDrivers = async (req: Request, res: Response): Promise<void> => {
    try {
      const { status, search, page = '1', limit = '20' } = req.query as Record<string, string>;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const where: Record<string, unknown> = {};
      if (status) where.verificationStatus = status;
      if (search) {
        where.OR = [
          { fullName: { contains: search, mode: 'insensitive' } },
          { mobileNumber: { contains: search } },
          { registrationId: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [drivers, total] = await Promise.all([
        prisma.driver.findMany({
          where,
          include: { address: true, documents: true, drivingLicence: true },
          orderBy: { createdAt: 'desc' },
          skip,
          take: parseInt(limit),
        }),
        prisma.driver.count({ where }),
      ]);

      res.json({ success: true, data: { drivers, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) } });
    } catch { res.status(500).json({ success: false, error: 'Failed to fetch drivers' }); }
  };

  /* ── Single driver detail ── */
  getDriver = async (req: Request, res: Response): Promise<void> => {
    try {
      const driver = await prisma.driver.findUnique({
        where: { id: req.params.id },
        include: {
          address: true,
          drivingExperience: true,
          drivingLicence: true,
          emergencyContact: true,
          documents: true,
          vehicles: true,
          user: { select: { email: true, createdAt: true } },
        },
      });
      if (!driver) { res.status(404).json({ success: false, error: 'Driver not found' }); return; }
      res.json({ success: true, data: driver });
    } catch { res.status(500).json({ success: false, error: 'Failed to fetch driver' }); }
  };

  /* ── Update status (approve / reject) ── */
  updateStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { status, rejectionReason } = req.body;
      const allowed = ['UNDER_REVIEW', 'APPROVED', 'REJECTED', 'RESUBMISSION_REQUIRED'];
      if (!allowed.includes(status)) {
        res.status(400).json({ success: false, error: 'Invalid status' }); return;
      }

      const driver = await prisma.driver.update({
        where: { id: req.params.id },
        data: { verificationStatus: status },
      });

      // Update rejection reason on documents if rejected
      if ((status === 'REJECTED' || status === 'RESUBMISSION_REQUIRED') && rejectionReason) {
        await prisma.driverDocument.updateMany({
          where: { driverId: driver.id },
          data: { rejectionReason },
        });
      }

      await prisma.notification.create({
        data: {
          driverId: driver.id,
          title: status === 'APPROVED' ? 'Registration Approved!' : status === 'REJECTED' ? 'Registration Rejected' : 'Registration Update',
          message: status === 'APPROVED'
            ? 'Congratulations! Your registration has been approved. You can now start taking trips.'
            : status === 'REJECTED'
            ? `Your registration was rejected. ${rejectionReason || ''}`
            : `Your registration status has been updated to: ${status}. ${rejectionReason || ''}`,
          type: 'APPROVAL',
        },
      });

      res.json({ success: true, data: driver });
    } catch { res.status(500).json({ success: false, error: 'Failed to update status' }); }
  };

  /* ── Stats overview ── */
  getStats = async (_req: Request, res: Response): Promise<void> => {
    try {
      const [total, submitted, underReview, approved, rejected] = await Promise.all([
        prisma.driver.count(),
        prisma.driver.count({ where: { verificationStatus: 'SUBMITTED' } }),
        prisma.driver.count({ where: { verificationStatus: 'UNDER_REVIEW' } }),
        prisma.driver.count({ where: { verificationStatus: 'APPROVED' } }),
        prisma.driver.count({ where: { verificationStatus: 'REJECTED' } }),
      ]);
      res.json({ success: true, data: { total, submitted, underReview, approved, rejected } });
    } catch { res.status(500).json({ success: false, error: 'Failed to fetch stats' }); }
  };

  /* ── Seed admin user (one-time setup) ── */
  seedAdmin = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password, secret } = req.body;
      const adminSecret = process.env.ADMIN_SETUP_SECRET;
      if (!adminSecret || secret !== adminSecret) {
        res.status(403).json({ success: false, error: 'Invalid setup secret' }); return;
      }
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) { res.status(409).json({ success: false, error: 'User already exists' }); return; }

      const passwordHash = await bcrypt.hash(password, 12);
      const user = await prisma.user.create({ data: { email, passwordHash, role: 'ADMIN' } });
      res.status(201).json({ success: true, data: { id: user.id, email: user.email, role: user.role } });
    } catch { res.status(500).json({ success: false, error: 'Seed failed' }); }
  };
}
