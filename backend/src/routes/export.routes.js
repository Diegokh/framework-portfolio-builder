const express = require('express');
const router = express.Router();
const pool = require('../db/connection');
const authMiddleware = require('../middleware/auth.middleware');

// GET /api/export
router.get('/', authMiddleware, async (req, res) => {
  try {
    const uid = req.user.id;

    const [[userRows], [profileRows], [projectRows], [skillRows], [categoryRows], [linkRows]] = await Promise.all([
      pool.execute('SELECT id, name, email, createdAt FROM users WHERE id = ?', [uid]),
      pool.execute('SELECT * FROM profile WHERE userId = ?', [uid]),
      pool.execute(`
        SELECT p.*, GROUP_CONCAT(t.technology ORDER BY t.technology SEPARATOR ', ') AS technologies
        FROM projects p
        LEFT JOIN project_technologies t ON t.projectId = p.id
        WHERE p.userId = ?
        GROUP BY p.id
        ORDER BY p.createdAt DESC`, [uid]),
      pool.execute('SELECT name, category, level FROM skills WHERE userId = ? ORDER BY category, name', [uid]),
      pool.execute('SELECT name, color, description FROM categories WHERE userId = ?', [uid]),
      pool.execute(`
        SELECT l.title, l.url, l.type, p.name AS project
        FROM links l
        LEFT JOIN projects p ON p.id = l.projectId
        WHERE l.userId = ?`, [uid]),
    ]);

    const payload = {
      exportedAt: new Date().toISOString(),
      user: userRows[0] ?? null,
      profile: profileRows[0] ?? null,
      projects: projectRows,
      skills: skillRows,
      categories: categoryRows,
      links: linkRows,
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="portfolio-export-${Date.now()}.json"`);
    res.json(payload);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
