const express = require('express');
const router = express.Router();
const pool = require('../db/connection');

// GET /api/users/search?q=nombre - PÚBLICO - Buscar usuarios
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return res.json({ success: true, data: [] });
    }

    const searchQuery = `%${q}%`;

    const [rows] = await pool.execute(
      `SELECT u.id, u.name, u.email, u.createdAt,
              p.bio, p.github, p.linkedin, p.website, p.skills
       FROM users u
       LEFT JOIN profile p ON u.id = p.userId
       WHERE u.name LIKE ?
       ORDER BY u.name ASC
       LIMIT 50`,
      [searchQuery]
    );

    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/users - PÚBLICO - Listar todos los usuarios (con paginación)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const [rows] = await pool.query(
      `SELECT u.id, u.name, u.email, u.createdAt,
              p.bio, p.github, p.linkedin, p.website, p.skills,
              COUNT(pr.id) as projectsCount
       FROM users u
       LEFT JOIN profile p ON u.id = p.userId
       LEFT JOIN projects pr ON u.id = pr.userId AND pr.status = 'published'
       GROUP BY u.id
       ORDER BY u.createdAt DESC
       LIMIT ${limit} OFFSET ${offset}`
    );

    const [countResult] = await pool.execute('SELECT COUNT(*) as total FROM users');
    const total = countResult[0].total;

    res.json({
      success: true,
      data: rows,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/users/:id - PÚBLICO - Obtener usuario con perfil
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT u.id, u.name, u.email, u.createdAt,
              p.bio, p.github, p.linkedin, p.website, p.skills,
              COUNT(pr.id) as projectsCount
       FROM users u
       LEFT JOIN profile p ON u.id = p.userId
       LEFT JOIN projects pr ON u.id = pr.userId AND pr.status = 'published'
       WHERE u.id = ?
       GROUP BY u.id`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
