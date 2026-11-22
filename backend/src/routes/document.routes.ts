import { Router } from 'express';
import { DocumentController } from '../controllers/document.controller';
import { authenticate } from '../middlewares/auth.middleware';
import multer from 'multer';
import path from 'path';
import { config } from '../config';

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, config.uploadDir),
  filename: (_req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: config.maxFileSize },
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|pdf/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) cb(null, true);
    else cb(new Error('Only JPG, PNG, and PDF files are allowed'));
  },
});

const router = Router();
const ctrl = new DocumentController();

router.use(authenticate);
router.post('/upload', upload.single('document'), ctrl.upload);
router.post('/save-url', ctrl.saveUrl);
router.get('/me', ctrl.getMyDocuments);
router.delete('/:id', ctrl.delete);
router.post('/:id/resubmit', upload.single('document'), ctrl.resubmit);

export default router;
