import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { dbHelpers } from '../database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and PDF files are allowed.'));
    }
  }
});

// Upload document
router.post('/document', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const { userId, documentType } = req.body;

    if (!userId || !documentType) {
      // Delete uploaded file if validation fails
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, error: 'User ID and document type are required' });
    }

    // Get application
    const application = await dbHelpers.get(
      'SELECT application_id FROM kyc_applications WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
      [userId]
    );

    if (!application) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ success: false, error: 'Application not found' });
    }

    // Check existing document
    const existingDoc = await dbHelpers.get(
      'SELECT * FROM documents WHERE application_id = ? AND document_type = ?',
      [application.application_id, documentType]
    );

    if (existingDoc) {
      // Delete old file if exists
      if (existingDoc.file_path && fs.existsSync(existingDoc.file_path)) {
        fs.unlinkSync(existingDoc.file_path);
      }

      // Update existing document
      await dbHelpers.run(
        `UPDATE documents 
         SET file_path = ?, file_name = ?, file_size = ?, file_type = ?, status = ?, attempts = attempts + 1, updated_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [
          req.file.path,
          req.file.originalname,
          req.file.size,
          req.file.mimetype,
          'uploaded',
          existingDoc.id
        ]
      );

      res.json({
        success: true,
        filePath: req.file.path.replace(/\\/g, '/'),
        fileName: req.file.originalname,
        attempts: existingDoc.attempts + 1
      });
    } else {
      // Create new document
      await dbHelpers.run(
        `INSERT INTO documents (id, application_id, document_type, file_path, file_name, file_size, file_type, status, attempts) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          uuidv4(),
          application.application_id,
          documentType,
          req.file.path,
          req.file.originalname,
          req.file.size,
          req.file.mimetype,
          'uploaded',
          1
        ]
      );

      res.json({
        success: true,
        filePath: req.file.path.replace(/\\/g, '/'),
        fileName: req.file.originalname,
        attempts: 1
      });
    }
  } catch (error) {
    console.error('Document upload error:', error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ success: false, error: 'File upload failed' });
  }
});

// Upload photo (passport photo or selfie)
router.post('/photo', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const { userId, photoType } = req.body; // photoType: 'photo' or 'selfie'

    if (!userId || !photoType) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, error: 'User ID and photo type are required' });
    }

    // Get application
    const application = await dbHelpers.get(
      'SELECT application_id FROM kyc_applications WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
      [userId]
    );

    if (!application) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ success: false, error: 'Application not found' });
    }

    // Check existing photo
    const existingPhoto = await dbHelpers.get(
      'SELECT * FROM photos WHERE application_id = ? AND photo_type = ?',
      [application.application_id, photoType]
    );

    if (existingPhoto) {
      // Delete old file if exists
      if (existingPhoto.file_path && fs.existsSync(existingPhoto.file_path)) {
        fs.unlinkSync(existingPhoto.file_path);
      }

      // Update existing photo
      await dbHelpers.run(
        `UPDATE photos 
         SET file_path = ?, file_name = ?, file_size = ?, file_type = ?, status = ?, attempts = attempts + 1, updated_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [
          req.file.path,
          req.file.originalname,
          req.file.size,
          req.file.mimetype,
          'uploaded',
          existingPhoto.id
        ]
      );

      res.json({
        success: true,
        filePath: req.file.path.replace(/\\/g, '/'),
        fileName: req.file.originalname,
        attempts: existingPhoto.attempts + 1
      });
    } else {
      // Create new photo
      await dbHelpers.run(
        `INSERT INTO photos (id, application_id, photo_type, file_path, file_name, file_size, file_type, status, attempts) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          uuidv4(),
          application.application_id,
          photoType,
          req.file.path,
          req.file.originalname,
          req.file.size,
          req.file.mimetype,
          'uploaded',
          1
        ]
      );

      res.json({
        success: true,
        filePath: req.file.path.replace(/\\/g, '/'),
        fileName: req.file.originalname,
        attempts: 1
      });
    }
  } catch (error) {
    console.error('Photo upload error:', error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ success: false, error: 'File upload failed' });
  }
});

export default router;



