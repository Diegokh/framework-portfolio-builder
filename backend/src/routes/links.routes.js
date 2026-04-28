const express = require('express');
const router = express.Router();
const pool = require('../db/connection');
const authMiddleware = require('../middleware/auth.middleware');

// GET /api/links/preview?url=...
router.get('/preview', authMiddleware, async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ success: false, message: 'URL requerida' });

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PortfolioBot/1.0)' },
      signal: AbortSignal.timeout(8000),
    });
    const html = await response.text();

    const getMeta = (...props) => {
      for (const prop of props) {
        const m =
          html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${prop}["'][^>]+content=["']([^"']+)["']`, 'i')) ||
          html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${prop}["']`, 'i'));
        if (m?.[1]) return m[1].trim();
      }
      return null;
    };

    const title       = getMeta('og:title', 'twitter:title') || html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() || null;
    const description = getMeta('og:description', 'twitter:description', 'description') || null;
    const image       = getMeta('og:image', 'twitter:image') || null;
    const siteName    = getMeta('og:site_name') || null;

    res.json({ success: true, data: { title, description, image, siteName } });
  } catch {
    res.status(422).json({ success: false, message: 'No se pudo obtener la vista previa' });
  }
});

// GET /api/links
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT l.*, p.name AS projectName
       FROM links l
       LEFT JOIN projects p ON p.id = l.projectId
       WHERE l.userId = ?
       ORDER BY l.projectId, l.createdAt DESC`,
      [req.user.id]
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/links
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, url, type, projectId, previewTitle, previewDescription, previewImage } = req.body;
    if (!title || !title.trim())
      return res.status(400).json({ success: false, message: 'El título es obligatorio' });
    if (!url || !url.trim())
      return res.status(400).json({ success: false, message: 'La URL es obligatoria' });

    const [result] = await pool.execute(
      'INSERT INTO links (userId, projectId, title, url, type, previewTitle, previewDescription, previewImage) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, projectId || null, title.trim(), url.trim(), type || 'other',
       previewTitle || null, previewDescription || null, previewImage || null]
    );
    res.status(201).json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/links/:id
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { title, url, type, projectId, previewTitle, previewDescription, previewImage } = req.body;
    if (!title || !title.trim())
      return res.status(400).json({ success: false, message: 'El título es obligatorio' });
    if (!url || !url.trim())
      return res.status(400).json({ success: false, message: 'La URL es obligatoria' });

    const [result] = await pool.execute(
      'UPDATE links SET title = ?, url = ?, type = ?, projectId = ?, previewTitle = ?, previewDescription = ?, previewImage = ? WHERE id = ? AND userId = ?',
      [title.trim(), url.trim(), type || 'other', projectId || null,
       previewTitle || null, previewDescription || null, previewImage || null,
       req.params.id, req.user.id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ success: false, message: 'Link no encontrado' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/links/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const [result] = await pool.execute(
      'DELETE FROM links WHERE id = ? AND userId = ?',
      [req.params.id, req.user.id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ success: false, message: 'Link no encontrado' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
