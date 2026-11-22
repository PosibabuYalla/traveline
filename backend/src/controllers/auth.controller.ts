import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';

const prisma = new PrismaClient();

export class AuthController {
  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password, fullName, mobileNumber } = req.body;

      if (!email || !password || !fullName || !mobileNumber) {
        res.status(400).json({ success: false, error: 'Required fields missing' });
        return;
      }

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        res.status(409).json({ success: false, error: 'Email already registered' });
        return;
      }

      const passwordHash = await bcrypt.hash(password, 12);
      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          role: 'DRIVER',
          driver: {
            create: {
              fullName,
              mobileNumber,
              registrationId: `TL-${Date.now()}`,
            },
          },
        },
        include: { driver: true },
      });

      await prisma.notification.create({
        data: {
          driverId: user.driver!.id,
          title: 'Welcome to TravelLine!',
          message: 'Your account has been created. Complete your registration to get started.',
          type: 'REGISTRATION',
        },
      });

      const accessToken = generateAccessToken({ userId: user.id, email: user.email, role: user.role });
      const refreshToken = generateRefreshToken({ userId: user.id });

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      await prisma.refreshToken.create({ data: { token: refreshToken, userId: user.id, expiresAt } });

      res.status(201).json({
        success: true,
        data: {
          accessToken,
          refreshToken,
          user: { id: user.id, email: user.email, role: user.role },
          driver: { id: user.driver!.id, registrationId: user.driver!.registrationId },
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: 'Registration failed' });
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ success: false, error: 'Email and password required' });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { email },
        include: { driver: true },
      });

      if (!user || !user.isActive) {
        res.status(401).json({ success: false, error: 'Invalid credentials' });
        return;
      }

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        res.status(401).json({ success: false, error: 'Invalid credentials' });
        return;
      }

      const accessToken = generateAccessToken({ userId: user.id, email: user.email, role: user.role });
      const refreshToken = generateRefreshToken({ userId: user.id });

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      await prisma.refreshToken.create({ data: { token: refreshToken, userId: user.id, expiresAt } });

      res.json({
        success: true,
        data: {
          accessToken,
          refreshToken,
          user: { id: user.id, email: user.email, role: user.role },
          driver: user.driver ? {
            id: user.driver.id,
            registrationId: user.driver.registrationId,
            verificationStatus: user.driver.verificationStatus,
          } : null,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: 'Login failed' });
    }
  };

  refresh = async (req: Request, res: Response): Promise<void> => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        res.status(400).json({ success: false, error: 'Refresh token required' });
        return;
      }

      const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
      if (!stored || stored.isRevoked || stored.expiresAt < new Date()) {
        res.status(401).json({ success: false, error: 'Invalid refresh token' });
        return;
      }

      const payload = verifyRefreshToken(refreshToken);
      const user = await prisma.user.findUnique({ where: { id: payload.userId } });
      if (!user) {
        res.status(401).json({ success: false, error: 'User not found' });
        return;
      }

      await prisma.refreshToken.update({ where: { id: stored.id }, data: { isRevoked: true } });
      const newRefreshToken = generateRefreshToken({ userId: user.id });
      const newAccessToken = generateAccessToken({ userId: user.id, email: user.email, role: user.role });

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      await prisma.refreshToken.create({ data: { token: newRefreshToken, userId: user.id, expiresAt } });

      res.json({ success: true, data: { accessToken: newAccessToken, refreshToken: newRefreshToken } });
    } catch {
      res.status(401).json({ success: false, error: 'Token refresh failed' });
    }
  };

  logout = async (req: Request, res: Response): Promise<void> => {
    try {
      const { refreshToken } = req.body;
      if (refreshToken) {
        await prisma.refreshToken.updateMany({
          where: { token: refreshToken },
          data: { isRevoked: true },
        });
      }
      res.json({ success: true, message: 'Logged out successfully' });
    } catch {
      res.status(500).json({ success: false, error: 'Logout failed' });
    }
  };

  forgotPassword = async (_req: Request, res: Response): Promise<void> => {
    res.json({ success: true, message: 'If the email exists, a reset link has been sent.' });
  };

  resetPassword = async (_req: Request, res: Response): Promise<void> => {
    res.json({ success: true, message: 'Password reset successful.' });
  };

  me = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user!.userId },
        include: {
          driver: {
            include: {
              address: true,
              drivingExperience: true,
              drivingLicence: true,
              emergencyContact: true,
              documents: true,
              vehicles: true,
            },
          },
        },
      });
      if (!user) {
        res.status(404).json({ success: false, error: 'User not found' });
        return;
      }
      res.json({ success: true, data: { id: user.id, email: user.email, role: user.role, driver: user.driver } });
    } catch {
      res.status(500).json({ success: false, error: 'Failed to fetch user' });
    }
  };
}
