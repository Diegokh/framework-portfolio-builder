const express = require('express');
const router = express.Router();
const pool = require('../db/connection');
const authMiddleware = require('../middleware/auth.middleware');

// GET /api/categories
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT c.*, COUNT(p.id) AS projectCount
       FROM categories c
       LEFT JOIN projects p ON p.categoryId = c.id
       WHERE c.userId = ?
       GROUP BY c.id
       ORDER BY c.name`,
      [req.user.id]
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/categories
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, color, description } = req.body;
    if (!name || name.trim().length < 1)
      return res.status(400).json({ success: false, message: 'El nombre es obligatorio' });

    const [result] = await pool.execute(
      'INSERT INTO categories (userId, name, color, description) VALUES (?, ?, ?, ?)',
      [req.user.id, name.trim(), color || '#06b6d4', description || null]
    );
    res.status(201).json({ success: true, id: result.insertId });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY')
      return res.status(409).json({ success: false, message: 'Ya existe una categoría con ese nombre' });
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/categories/:id
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { name, color, description } = req.body;
    if (!name || name.trim().length < 1)
      return res.status(400).json({ success: false, message: 'El nombre es obligatorio' });

    const [result] = await pool.execute(
      'UPDATE categories SET name = ?, color = ?, description = ? WHERE id = ? AND userId = ?',
      [name.trim(), color || '#06b6d4', description || null, req.params.id, req.user.id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ success: false, message: 'Categoría no encontrada' });
    res.json({ success: true });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY')
      return res.status(409).json({ success: false, message: 'Ya existe una categoría con ese nombre' });
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/categories/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const [result] = await pool.execute(
      'DELETE FROM categories WHERE id = ? AND userId = ?',
      [req.params.id, req.user.id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ success: false, message: 'Categoría no encontrada' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
