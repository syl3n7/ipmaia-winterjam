const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const rateLimit = require('express-rate-limit');
const Rules = require('../models/Rules');
const { requireAdmin } = require('./auth');

const router = express.Router();

// Rate limiter for PDF uploads - very restrictive
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 uploads per hour
  message: 'Too many upload attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Extract IP without port (handles proxy IPs like "172.68.103.40:10934")
    const ip = req.ip || req.connection.remoteAddress || '0.0.0.0';
    return ip.split(':')[0];
  }
});

// Configure multer for PDF uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/pdfs');
    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp to avoid caching issues
    const timestamp = Date.now();
    const filename = `WinterJam_Rulebook_${timestamp}.pdf`;
    cb(null, filename);
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

// Helper function to extract/parse content from uploaded data
// This will be populated from the frontend or admin panel when uploading
const processRulesContent = (formData) => {
  const sections = {};
  
  // Extract sections from form data
  if (formData.code_of_conduct) sections.code_of_conduct = formData.code_of_conduct;
  if (formData.guidelines) sections.guidelines = formData.guidelines;
  if (formData.prizes) sections.prizes = formData.prizes;
  if (formData.evaluation) sections.evaluation = formData.evaluation;
  if (formData.participation) sections.participation = formData.participation;
  if (formData.schedule) sections.schedule = formData.schedule;
  
  return sections;
};

// ==================== PUBLIC ROUTES ====================

// Get active rules content (public)
router.get('/active', async (req, res) => {
  try {
    const rules = await Rules.getActive();
    
    if (!rules) {
      return res.status(404).json({ 
        error: 'No active rulebook found',
        message: 'Nenhum livro de regras ativo encontrado'
      });
    }
    
    res.json(rules);
  } catch (error) {
    console.error('Error fetching active rules:', error);
    res.status(500).json({ 
      error: 'Failed to fetch rules',
      message: 'Erro ao carregar regras'
    });
  }
});

// Get current PDF URL (public)
router.get('/pdf-url', async (req, res) => {
  try {
    const rules = await Rules.getActive();
    // Return API endpoint URL instead of direct file path
    const apiUrl = process.env.API_URL || 'http://localhost:3001/api';
    const pdfUrl = rules?.pdf_url || `${apiUrl}/rules/download`;
    
    res.json({ 
      pdfUrl: pdfUrl,
      message: 'PDF URL retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching PDF URL:', error);
    const apiUrl = process.env.API_URL || 'http://localhost:3001/api';
    res.json({ 
      pdfUrl: `${apiUrl}/rules/download`,
      message: 'Using default PDF URL'
    });
  }
});

// Download/serve PDF file (public)
router.get('/download', async (req, res) => {
  try {
    const rules = await Rules.getActive();
    
    if (!rules || !rules.pdf_filename) {
      return res.status(404).json({ 
        error: 'PDF not found',
        message: 'Nenhum PDF foi carregado ainda'
      });
    }
    
    const filePath = path.join(__dirname, '../uploads/pdfs', rules.pdf_filename);
    
    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      return res.status(404).json({ 
        error: 'PDF file not found',
        message: 'Ficheiro PDF não encontrado'
      });
    }
    
    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="WinterJam_Rulebook.pdf"');
    
    // Stream the file
    const fileStream = require('fs').createReadStream(filePath);
    fileStream.pipe(res);
    
  } catch (error) {
    console.error('Error serving PDF:', error);
    res.status(500).json({ 
      error: 'Failed to serve PDF',
      message: 'Erro ao carregar o PDF'
    });
  }
});

// ==================== ADMIN ROUTES ====================

router.use(requireAdmin);

// Get all rulebooks (admin)
router.get('/admin/all', async (req, res) => {
  try {
    const rules = await Rules.getAll();
    res.json(rules);
  } catch (error) {
    console.error('Error fetching all rules:', error);
    res.status(500).json({ 
      error: 'Failed to fetch rules',
      message: 'Erro ao carregar regras'
    });
  }
});

// Upload/Replace PDF and update rules content (admin only)
// Security measures:
// - requireAdmin middleware (session + role check)
// - uploadLimiter (5 uploads/hour per IP)
// - Multer file validation (mimetype + size)
// - PDF magic bytes verification
// - Audit logging (user tracking)
router.post('/admin/upload-pdf', uploadLimiter, upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        error: 'No file uploaded',
        message: 'Nenhum ficheiro foi enviado'
      });
    }

    // Additional security validation
    if (req.file.size > 10 * 1024 * 1024) {
      // Delete the uploaded file if it exceeds size
      await fs.unlink(req.file.path).catch(console.error);
      return res.status(400).json({ 
        error: 'File too large',
        message: 'Ficheiro demasiado grande (máximo 10MB)'
      });
    }

    // Verify file is actually a PDF by checking magic bytes
    const fileBuffer = await fs.readFile(req.file.path);
    const isPDF = fileBuffer.length > 4 && 
                  fileBuffer[0] === 0x25 && // %
                  fileBuffer[1] === 0x50 && // P
                  fileBuffer[2] === 0x44 && // D
                  fileBuffer[3] === 0x46;   // F
    
    if (!isPDF) {
      await fs.unlink(req.file.path).catch(console.error);
      return res.status(400).json({ 
        error: 'Invalid file type',
        message: 'O ficheiro não é um PDF válido'
      });
    }

    console.log('📄 PDF uploaded successfully:', req.file.filename);
    console.log('👤 Uploaded by:', req.session.email || req.session.userId);

    // Process the rules content from form data
    const sections = processRulesContent(req.body);
    
    // Generate the API URL for downloading
    const apiUrl = process.env.API_URL || 'http://localhost:3001/api';
    const pdfUrl = `${apiUrl}/rules/download`;
    
    // Create or update rules in database
    let rulesRecord;
    
    try {
      // Try to get active rules
      const activeRules = await Rules.getActive();
      
      if (activeRules) {
        // Delete old PDF file if it exists
        if (activeRules.pdf_filename) {
          const oldFilePath = path.join(__dirname, '../uploads/pdfs', activeRules.pdf_filename);
          await fs.unlink(oldFilePath).catch(console.error);
        }
        
        // Update existing active rules
        rulesRecord = await Rules.update(activeRules.id, {
          pdf_url: pdfUrl,
          pdf_filename: req.file.filename,
          ...sections,
          updated_at: new Date()
        });
        console.log('✅ Updated existing rules record');
      } else {
        // Create new rules record
        rulesRecord = await Rules.create({
          pdf_url: pdfUrl,
          pdf_filename: req.file.filename,
          is_active: true,
          ...sections
        });
        console.log('✅ Created new rules record');
      }
    } catch (dbError) {
      console.error('⚠️ Database error (non-critical):', dbError.message);
      // Continue even if database fails - PDF is uploaded
    }

    res.json({
      message: 'PDF uploaded successfully and rules updated',
      filename: req.file.filename,
      pdfUrl: `/WinterJam_Rulebook.pdf`,
      size: req.file.size,
      rulesUpdated: !!rulesRecord,
      sections: Object.keys(sections)
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

// Update rules content only (without PDF upload)
router.put('/admin/content', async (req, res) => {
  try {
    const sections = processRulesContent(req.body);
    
    const activeRules = await Rules.getActive();
    
    if (!activeRules) {
      return res.status(404).json({ 
        error: 'No active rulebook found',
        message: 'Nenhum livro de regras ativo encontrado'
      });
    }
    
    const updated = await Rules.update(activeRules.id, sections);
    
    res.json({
      message: 'Rules content updated successfully',
      data: updated
    });
  } catch (error) {
    console.error('Error updating rules content:', error);
    res.status(500).json({ 
      error: 'Failed to update rules content',
      message: 'Erro ao atualizar conteúdo das regras'
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

// Set active rulebook (admin)
router.patch('/admin/:id/activate', async (req, res) => {
  try {
    const rules = await Rules.setActive(req.params.id);
    
    if (!rules) {
      return res.status(404).json({ 
        error: 'Rulebook not found',
        message: 'Livro de regras não encontrado'
      });
    }
    
    res.json({
      message: 'Rulebook activated successfully',
      data: rules
    });
  } catch (error) {
    console.error('Error activating rules:', error);
    res.status(500).json({ 
      error: 'Failed to activate rules',
      message: 'Erro ao ativar regras'
    });
  }
});

module.exports = router;
