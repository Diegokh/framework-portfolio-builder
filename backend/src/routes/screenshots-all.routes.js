const express = require('express');
const router = express.Router();
const pool = require('../db/connection');
const authMiddleware = require('../middleware/auth.middleware');

// GET /api/screenshots — todas las capturas del usuario
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT s.*, p.name AS projectName
       FROM screenshots s
       INNER JOIN projects p ON p.id = s.projectId
       WHERE p.userId = ?
       ORDER BY s.projectId, s.\`order\` ASC`,
      [req.user.id]
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
