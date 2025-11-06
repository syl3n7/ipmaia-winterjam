const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { requireAdmin } = require('./auth');

const router = express.Router();

// Configure multer for PDF uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../public');
    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Always save as WinterJam_Rulebook.pdf to replace the existing file
    cb(null, 'WinterJam_Rulebook.pdf');
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

// ==================== PUBLIC ROUTES ====================

// Get current PDF URL (public)
router.get('/pdf-url', (req, res) => {
  res.json({ 
    pdfUrl: '/WinterJam_Rulebook.pdf',
    message: 'PDF URL retrieved successfully'
  });
});

// ==================== ADMIN ROUTES ====================

router.use(requireAdmin);

// Upload/Replace PDF (admin only)
router.post('/admin/upload-pdf', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        error: 'No file uploaded',
        message: 'Nenhum ficheiro foi enviado'
      });
    }

    console.log('📄 PDF uploaded successfully:', req.file.filename);

    res.json({
      message: 'PDF uploaded successfully',
      filename: req.file.filename,
      pdfUrl: `/WinterJam_Rulebook.pdf`,
      size: req.file.size
    });
  } catch (error) {
    console.error('Error uploading PDF:', error);
    res.status(500).json({ 
      error: 'Failed to upload PDF',
      message: 'Erro ao carregar PDF',
      details: error.message
    });
  }
});

// Get current PDF info (admin)
router.get('/admin/pdf-info', async (req, res) => {
  try {
    const pdfPath = path.join(__dirname, '../../public/WinterJam_Rulebook.pdf');
    const stats = await fs.stat(pdfPath);
    
    res.json({
      exists: true,
      filename: 'WinterJam_Rulebook.pdf',
      size: stats.size,
      lastModified: stats.mtime,
      url: '/WinterJam_Rulebook.pdf'
    });
  } catch (error) {
    if (error.code === 'ENOENT') {
      return res.json({
        exists: false,
        message: 'No PDF file found'
      });
    }
    
    console.error('Error getting PDF info:', error);
    res.status(500).json({ 
      error: 'Failed to get PDF info',
      message: 'Erro ao obter informação do PDF'
    });
  }
});

module.exports = router;
