const express = require('express');
const Rules = require('../models/Rules');
const { requireAdmin } = require('./auth');

const router = express.Router();

// ==================== PUBLIC ROUTES ====================

// Get active rulebook (public)
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

// Get specific rulebook by ID (admin)
router.get('/admin/:id', async (req, res) => {
  try {
    const rules = await Rules.getById(req.params.id);
    
    if (!rules) {
      return res.status(404).json({ 
        error: 'Rulebook not found',
        message: 'Livro de regras não encontrado'
      });
    }
    
    res.json(rules);
  } catch (error) {
    console.error('Error fetching rules:', error);
    res.status(500).json({ 
      error: 'Failed to fetch rules',
      message: 'Erro ao carregar regras'
    });
  }
});

// Create new rulebook (admin)
router.post('/admin', async (req, res) => {
  try {
    const rules = await Rules.create(req.body);
    res.status(201).json({
      message: 'Rulebook created successfully',
      data: rules
    });
  } catch (error) {
    console.error('Error creating rules:', error);
    res.status(500).json({ 
      error: 'Failed to create rules',
      message: 'Erro ao criar regras'
    });
  }
});

// Update rulebook (admin)
router.put('/admin/:id', async (req, res) => {
  try {
    const rules = await Rules.update(req.params.id, req.body);
    
    if (!rules) {
      return res.status(404).json({ 
        error: 'Rulebook not found',
        message: 'Livro de regras não encontrado'
      });
    }
    
    res.json({
      message: 'Rulebook updated successfully',
      data: rules
    });
  } catch (error) {
    console.error('Error updating rules:', error);
    res.status(500).json({ 
      error: 'Failed to update rules',
      message: 'Erro ao atualizar regras'
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

// Delete rulebook (admin)
router.delete('/admin/:id', async (req, res) => {
  try {
    const rules = await Rules.delete(req.params.id);
    
    if (!rules) {
      return res.status(404).json({ 
        error: 'Rulebook not found',
        message: 'Livro de regras não encontrado'
      });
    }
    
    res.json({
      message: 'Rulebook deleted successfully',
      data: rules
    });
  } catch (error) {
    console.error('Error deleting rules:', error);
    res.status(500).json({ 
      error: 'Failed to delete rules',
      message: 'Erro ao eliminar regras'
    });
  }
});

module.exports = router;
