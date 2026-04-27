const express = require('express');
const router = express.Router();
const pool = require('../db/connection');
const authMiddleware = require('../middleware/auth.middleware');

// GET /api/profile
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM profile WHERE userId = ?',
      [req.user.id]
    );
    res.json({ success: true, data: rows[0] || null });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/profile
router.put('/', authMiddleware, async (req, res) => {
  try {
    const { bio, github, linkedin, website, skills } = req.body;

    const [existing] = await pool.execute(
      'SELECT id FROM profile WHERE userId = ?',
      [req.user.id]
    );

    if (existing.length > 0) {
      await pool.execute(
        'UPDATE profile SET bio = ?, github = ?, linkedin = ?, website = ?, skills = ? WHERE userId = ?',
        [bio, github, linkedin, website, skills, req.user.id]
      );
    } else {
      await pool.execute(
        'INSERT INTO profile (userId, bio, github, linkedin, website, skills) VALUES (?, ?, ?, ?, ?, ?)',
        [req.user.id, bio, github, linkedin, website, skills]
      );
    }

    res.json({ success: true, message: 'Perfil actualizado' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
