const express = require('express');
const router = express.Router();
const pool = require('../db/connection');
const authMiddleware = require('../middleware/auth.middleware');

// GET /api/projects — Listar todos los proyectos del usuario
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM projects WHERE userId = ? ORDER BY createdAt DESC',
      [req.user.id]
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/projects/:id — Obtener un proyecto concreto
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM projects WHERE id = ? AND userId = ?',
      [req.params.id, req.user.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Proyecto no encontrado' });
    }
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/projects — Crear un proyecto
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, description, repoUrl, liveUrl, status, startDate, endDate } = req.body;

    // Validación básica
    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, message: 'El nombre es obligatorio' });
    }

    const [result] = await pool.execute(
      `INSERT INTO projects
        (userId, name, description, repoUrl, liveUrl, status, startDate, endDate)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,                       // del token, NUNCA del body
        name,
        description ?? null,
        repoUrl ?? null,
        liveUrl ?? null,
        status ?? 'in_progress',
        startDate ?? null,
        endDate ?? null,
      ]
    );

    res.status(201).json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/projects/:id — Actualizar un proyecto
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { name, description, repoUrl, liveUrl, status, startDate, endDate } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, message: 'El nombre es obligatorio' });
    }

    const [result] = await pool.execute(
      `UPDATE projects
         SET name = ?, description = ?, repoUrl = ?, liveUrl = ?,
             status = ?, startDate = ?, endDate = ?
       WHERE id = ? AND userId = ?`,
      [
        name,
        description ?? null,
        repoUrl ?? null,
        liveUrl ?? null,
        status ?? 'in_progress',
        startDate ?? null,
        endDate ?? null,
        req.params.id,
        req.user.id,                       // asegura que solo modifica los suyos
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Proyecto no encontrado' });
    }

    res.json({ success: true, message: 'Actualizado correctamente' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/projects/:id — Eliminar un proyecto
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const [result] = await pool.execute(
      'DELETE FROM projects WHERE id = ? AND userId = ?',
      [req.params.id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Proyecto no encontrado' });
    }

    res.json({ success: true, message: 'Eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;