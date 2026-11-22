import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class DriverController {
  getMe = async (req: Request, res: Response): Promise<void> => {
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
              vehicles: { include: { documents: true, photos: true } },
            },
          },
        },
      });
      if (!user?.driver) {
        res.status(404).json({ success: false, error: 'Driver not found' });
        return;
      }
      res.json({ success: true, data: user.driver });
    } catch {
      res.status(500).json({ success: false, error: 'Failed to fetch driver' });
    }
  };

  updateMe = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await prisma.user.findUnique({ where: { id: req.user!.userId }, include: { driver: true } });
      if (!user?.driver) { res.status(404).json({ success: false, error: 'Driver not found' }); return; }

      const { fullName, dateOfBirth, gender, mobileNumber, alternateMobile } = req.body;
      const driver = await prisma.driver.update({
        where: { id: user.driver.id },
        data: {
          fullName,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
          gender,
          mobileNumber,
          alternateMobile,
        },
      });
      res.json({ success: true, data: driver });
    } catch {
      res.status(500).json({ success: false, error: 'Update failed' });
    }
  };

  updateStep = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await prisma.user.findUnique({ where: { id: req.user!.userId }, include: { driver: true } });
      if (!user?.driver) { res.status(404).json({ success: false, error: 'Driver not found' }); return; }
      const driverId = user.driver.id;
      const step = parseInt(String(req.params.step));

      if (step === 1) {
        const { fullName, dateOfBirth, gender, mobileNumber, alternateMobile, registrationType, profilePhotoUrl, address } = req.body;
        await prisma.driver.update({
          where: { id: driverId },
          data: {
            fullName,
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
            gender,
            mobileNumber,
            alternateMobile,
            registrationType,
            profilePhotoUrl: profilePhotoUrl || undefined,
          },
        });
        if (address) {
          await prisma.driverAddress.upsert({
            where: { driverId },
            create: { driverId, ...address },
            update: { ...address },
          });
        }
      } else if (step === 2) {
        const { experience, licence, emergencyContact } = req.body;
        if (experience) {
          await prisma.drivingExperience.upsert({
            where: { driverId },
            create: { driverId, ...experience },
            update: { ...experience },
          });
        }
        if (licence) {
          await prisma.drivingLicence.upsert({
            where: { driverId },
            create: {
              driverId,
              ...licence,
              issueDate: new Date(licence.issueDate),
              expiryDate: new Date(licence.expiryDate),
            },
            update: {
              ...licence,
              issueDate: new Date(licence.issueDate),
              expiryDate: new Date(licence.expiryDate),
            },
          });
        }
        if (emergencyContact) {
          await prisma.emergencyContact.upsert({
            where: { driverId },
            create: { driverId, ...emergencyContact },
            update: { ...emergencyContact },
          });
        }
      }

      res.json({ success: true, message: `Step ${step} saved` });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: 'Step update failed' });
    }
  };

  submitRegistration = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await prisma.user.findUnique({ where: { id: req.user!.userId }, include: { driver: true } });
      if (!user?.driver) { res.status(404).json({ success: false, error: 'Driver not found' }); return; }

      const driver = await prisma.driver.update({
        where: { id: user.driver.id },
        data: { verificationStatus: 'SUBMITTED', submittedAt: new Date() },
      });

      await prisma.notification.create({
        data: {
          driverId: driver.id,
          title: 'Registration Submitted',
          message: 'Your registration has been submitted and is under review.',
          type: 'REGISTRATION',
        },
      });

      res.json({
        success: true,
        data: {
          registrationId: driver.registrationId,
          submittedAt: driver.submittedAt,
          verificationStatus: driver.verificationStatus,
        },
      });
    } catch {
      res.status(500).json({ success: false, error: 'Submission failed' });
    }
  };
}
