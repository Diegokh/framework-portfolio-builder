const express = require('express');
const router = express.Router();
const pool = require('../db/connection');
const authMiddleware = require('../middleware/auth.middleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const cvStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const unique = `cv-${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const uploadCv = multer({
  storage: cvStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /pdf|doc|docx/;
    if (allowed.test(path.extname(file.originalname).toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos PDF, DOC o DOCX'));
    }
  },
});

// GET /api/profiles/public/:userId (PÚBLICO)
router.get('/public/:userId', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, userId, bio, github, linkedin, website, skills, cvUrl, updatedAt FROM profile WHERE userId = ?',
      [req.params.userId]
    );
    res.json({ success: true, data: rows[0] || null });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

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

// POST /api/profile/cv
router.post('/cv', authMiddleware, uploadCv.single('cv'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Archivo CV requerido' });

    // Borrar CV anterior si existe
    const [rows] = await pool.execute(
      'SELECT cvUrl FROM profile WHERE userId = ?',
      [req.user.id]
    );
    if (rows[0]?.cvUrl) {
      const oldPath = path.join(__dirname, '../..', rows[0].cvUrl);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    const cvUrl = `/uploads/${req.file.filename}`;

    const [existing] = await pool.execute(
      'SELECT id FROM profile WHERE userId = ?',
      [req.user.id]
    );

    if (existing.length > 0) {
      await pool.execute(
        'UPDATE profile SET cvUrl = ? WHERE userId = ?',
        [cvUrl, req.user.id]
      );
    } else {
      await pool.execute(
        'INSERT INTO profile (userId, cvUrl) VALUES (?, ?)',
        [req.user.id, cvUrl]
      );
    }

    res.json({ success: true, cvUrl });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/profile/cv
router.delete('/cv', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT cvUrl FROM profile WHERE userId = ?',
      [req.user.id]
    );

    if (!rows[0]?.cvUrl) {
      return res.status(404).json({ success: false, message: 'No hay CV subido' });
    }

    const filePath = path.join(__dirname, '../..', rows[0].cvUrl);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await pool.execute(
      'UPDATE profile SET cvUrl = NULL WHERE userId = ?',
      [req.user.id]
    );

    res.json({ success: true, message: 'CV eliminado' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
