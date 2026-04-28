const express = require('express');
const router = express.Router();
const pool = require('../db/connection');
const authMiddleware = require('../middleware/auth.middleware');

// GET /api/projects — Listar todos los proyectos del usuario
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT p.*, c.name AS categoryName, c.color AS categoryColor,
              COUNT(DISTINCT pt.id) AS technologiesCount
       FROM projects p
       LEFT JOIN categories c ON c.id = p.categoryId
       LEFT JOIN project_technologies pt ON pt.projectId = p.id
       WHERE p.userId = ?
       GROUP BY p.id
       ORDER BY p.createdAt DESC`,
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
      `SELECT p.*, c.name AS categoryName, c.color AS categoryColor,
              COUNT(DISTINCT pt.id) AS technologiesCount
       FROM projects p
       LEFT JOIN categories c ON c.id = p.categoryId
       LEFT JOIN project_technologies pt ON pt.projectId = p.id
       WHERE p.id = ? AND p.userId = ?
       GROUP BY p.id`,
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
    const { name, description, repoUrl, liveUrl, status, startDate, endDate, categoryId } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, message: 'El nombre es obligatorio' });
    }

    const [result] = await pool.execute(
      `UPDATE projects
         SET name = ?, description = ?, repoUrl = ?, liveUrl = ?,
             status = ?, startDate = ?, endDate = ?, categoryId = ?
       WHERE id = ? AND userId = ?`,
      [
        name,
        description ?? null,
        repoUrl ?? null,
        liveUrl ?? null,
        status ?? 'in_progress',
        startDate ?? null,
        endDate ?? null,
        categoryId ?? null,
        req.params.id,
        req.user.id,
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

// PATCH /api/projects/:id/cover — Cambiar portada e icono
router.patch('/:id/cover', authMiddleware, async (req, res) => {
  try {
    const fields = [];
    const values = [];
    if ('coverStyle' in req.body) { fields.push('coverStyle = ?'); values.push(req.body.coverStyle ?? null); }
    if ('coverIcon'  in req.body) { fields.push('coverIcon = ?');  values.push(req.body.coverIcon  ?? null); }
    if (fields.length === 0)
      return res.status(400).json({ success: false, message: 'Nada que actualizar' });
    values.push(req.params.id, req.user.id);
    const [result] = await pool.execute(
      `UPDATE projects SET ${fields.join(', ')} WHERE id = ? AND userId = ?`, values
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ success: false, message: 'Proyecto no encontrado' });
    res.json({ success: true });
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