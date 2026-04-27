const express = require('express');
const router = express.Router();
const pool = require('../db/connection');
const authMiddleware = require('../middleware/auth.middleware');

// GET /api/stats — Métricas del dashboard del usuario autenticado
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const [[{ total }]] = await pool.execute(
      'SELECT COUNT(*) AS total FROM projects WHERE userId = ?',
      [userId]
    );

    const [byStatus] = await pool.execute(
      'SELECT status, COUNT(*) AS count FROM projects WHERE userId = ? GROUP BY status',
      [userId]
    );

    const [recent] = await pool.execute(
      'SELECT id, name, status, createdAt FROM projects WHERE userId = ? ORDER BY createdAt DESC LIMIT 5',
      [userId]
    );

    res.json({
      success: true,
      data: { total, byStatus, recent },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
