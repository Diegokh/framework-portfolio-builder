const express = require('express');
const router = express.Router();
const pool = require('../db/connection');
const authMiddleware = require('../middleware/auth.middleware');

// GET /api/skills
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM skills WHERE userId = ? ORDER BY category, name',
      [req.user.id]
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/skills
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, category, level } = req.body;
    if (!name || name.trim().length < 1)
      return res.status(400).json({ success: false, message: 'El nombre es obligatorio' });

    const [result] = await pool.execute(
      'INSERT INTO skills (userId, name, category, level) VALUES (?, ?, ?, ?)',
      [req.user.id, name.trim(), category || 'other', level ?? 3]
    );
    res.status(201).json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/skills/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const [result] = await pool.execute(
      'DELETE FROM skills WHERE id = ? AND userId = ?',
      [req.params.id, req.user.id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ success: false, message: 'Skill no encontrada' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
