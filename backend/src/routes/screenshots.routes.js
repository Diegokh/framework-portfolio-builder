const express = require('express');
const router = express.Router({ mergeParams: true });
const pool = require('../db/connection');
const authMiddleware = require('../middleware/auth.middleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    if (allowed.test(path.extname(file.originalname).toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes (jpeg, png, gif, webp)'));
    }
  },
});

const verifyProjectOwner = async (req, res, next) => {
  const [rows] = await pool.execute(
    'SELECT id FROM projects WHERE id = ? AND userId = ?',
    [req.params.projectId, req.user.id]
  );
  if (rows.length === 0) return res.status(404).json({ success: false, message: 'Proyecto no encontrado' });
  next();
};

// GET /api/projects/:projectId/screenshots
router.get('/', authMiddleware, verifyProjectOwner, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM screenshots WHERE projectId = ? ORDER BY `order` ASC',
      [req.params.projectId]
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/projects/:projectId/screenshots
router.post('/', authMiddleware, verifyProjectOwner, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Imagen requerida' });

    const { caption, order } = req.body;
    const imageUrl = `/uploads/${req.file.filename}`;

    const [result] = await pool.execute(
      'INSERT INTO screenshots (projectId, imageUrl, caption, `order`) VALUES (?, ?, ?, ?)',
      [req.params.projectId, imageUrl, caption || '', order || 0]
    );
    res.status(201).json({ success: true, id: result.insertId, imageUrl });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/projects/:projectId/screenshots/:id
router.delete('/:id', authMiddleware, verifyProjectOwner, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT imageUrl FROM screenshots WHERE id = ? AND projectId = ?',
      [req.params.id, req.params.projectId]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Screenshot no encontrado' });

    const filePath = path.join(__dirname, '../..', rows[0].imageUrl);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await pool.execute('DELETE FROM screenshots WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Screenshot eliminado' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
