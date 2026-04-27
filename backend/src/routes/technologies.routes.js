const express = require('express');
const router = express.Router({ mergeParams: true });
const pool = require('../db/connection');
const authMiddleware = require('../middleware/auth.middleware');

const verifyProjectOwner = async (req, res, next) => {
  const [rows] = await pool.execute(
    'SELECT id FROM projects WHERE id = ? AND userId = ?',
    [req.params.projectId, req.user.id]
  );
  if (rows.length === 0) return res.status(404).json({ success: false, message: 'Proyecto no encontrado' });
  next();
};

// GET /api/projects/:projectId/technologies
router.get('/', authMiddleware, verifyProjectOwner, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM project_technologies WHERE projectId = ? ORDER BY id ASC',
      [req.params.projectId]
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/projects/:projectId/technologies
router.post('/', authMiddleware, verifyProjectOwner, async (req, res) => {
  try {
    const { technology, role } = req.body;
    if (!technology || !role) {
      return res.status(400).json({ success: false, message: 'technology y role son obligatorios' });
    }
    const [result] = await pool.execute(
      'INSERT INTO project_technologies (projectId, technology, role) VALUES (?, ?, ?)',
      [req.params.projectId, technology, role]
    );
    res.status(201).json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/projects/:projectId/technologies/:id
router.delete('/:id', authMiddleware, verifyProjectOwner, async (req, res) => {
  try {
    await pool.execute(
      'DELETE FROM project_technologies WHERE id = ? AND projectId = ?',
      [req.params.id, req.params.projectId]
    );
    res.json({ success: true, message: 'Tecnología eliminada' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
