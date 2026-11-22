import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

export class DocumentController {
  upload = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.file) { res.status(400).json({ success: false, error: 'No file uploaded' }); return; }
      const user = await prisma.user.findUnique({ where: { id: req.user!.userId }, include: { driver: true } });
      if (!user?.driver) { res.status(404).json({ success: false, error: 'Driver not found' }); return; }

      const { documentType, expiryDate } = req.body;
      const doc = await prisma.driverDocument.create({
        data: {
          driverId: user.driver.id,
          documentType: documentType as any,
          fileUrl: `/uploads/${req.file.filename}`,
          fileName: req.file.originalname,
          mimeType: req.file.mimetype,
          fileSize: req.file.size,
          expiryDate: expiryDate ? new Date(expiryDate) : undefined,
        },
      });
      res.status(201).json({ success: true, data: doc });
    } catch {
      res.status(500).json({ success: false, error: 'Upload failed' });
    }
  };

  getMyDocuments = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await prisma.user.findUnique({ where: { id: req.user!.userId }, include: { driver: true } });
      if (!user?.driver) { res.status(404).json({ success: false, error: 'Driver not found' }); return; }
      const docs = await prisma.driverDocument.findMany({
        where: { driverId: user.driver.id },
        orderBy: { uploadedAt: 'desc' },
      });
      res.json({ success: true, data: docs });
    } catch {
      res.status(500).json({ success: false, error: 'Failed to fetch documents' });
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await prisma.user.findUnique({ where: { id: req.user!.userId }, include: { driver: true } });
      if (!user?.driver) { res.status(404).json({ success: false, error: 'Driver not found' }); return; }
      const doc = await prisma.driverDocument.findFirst({ where: { id: String(req.params.id), driverId: user.driver.id } });
      if (!doc) { res.status(404).json({ success: false, error: 'Document not found' }); return; }

      const filename = doc.fileUrl.split('/').pop();
      if (filename) {
        const filePath = `./uploads/${filename}`;
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }

      await prisma.driverDocument.delete({ where: { id: doc.id } });
      res.json({ success: true, message: 'Document deleted' });
    } catch {
      res.status(500).json({ success: false, error: 'Delete failed' });
    }
  };

  saveUrl = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await prisma.user.findUnique({ where: { id: req.user!.userId }, include: { driver: true } });
      if (!user?.driver) { res.status(404).json({ success: false, error: 'Driver not found' }); return; }

      const { documentType, fileUrl, fileName, mimeType, fileSize } = req.body;
      if (!documentType || !fileUrl || !fileName) {
        res.status(400).json({ success: false, error: 'documentType, fileUrl and fileName are required' }); return;
      }

      const existing = await prisma.driverDocument.findFirst({ where: { driverId: user.driver.id, documentType: documentType as any } });
      let doc;
      if (existing) {
        doc = await prisma.driverDocument.update({
          where: { id: existing.id },
          data: { fileUrl, fileName, mimeType: mimeType || 'image/jpeg', fileSize: fileSize || 0, verificationStatus: 'PENDING' },
        });
      } else {
        doc = await prisma.driverDocument.create({
          data: { driverId: user.driver.id, documentType: documentType as any, fileUrl, fileName, mimeType: mimeType || 'image/jpeg', fileSize: fileSize || 0 },
        });
      }
      res.status(201).json({ success: true, data: doc });
    } catch {
      res.status(500).json({ success: false, error: 'Failed to save document URL' });
    }
  };

  resubmit = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.file) { res.status(400).json({ success: false, error: 'No file uploaded' }); return; }
      const user = await prisma.user.findUnique({ where: { id: req.user!.userId }, include: { driver: true } });
      if (!user?.driver) { res.status(404).json({ success: false, error: 'Driver not found' }); return; }
      const doc = await prisma.driverDocument.findFirst({ where: { id: String(req.params.id), driverId: user.driver.id } });
      if (!doc) { res.status(404).json({ success: false, error: 'Document not found' }); return; }

      const updated = await prisma.driverDocument.update({
        where: { id: doc.id },
        data: {
          fileUrl: `/uploads/${req.file.filename}`,
          fileName: req.file.originalname,
          mimeType: req.file.mimetype,
          fileSize: req.file.size,
          verificationStatus: 'PENDING',
          rejectionReason: null,
        },
      });
      res.json({ success: true, data: updated });
    } catch {
      res.status(500).json({ success: false, error: 'Resubmit failed' });
    }
  };
}
