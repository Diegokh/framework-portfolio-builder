const express = require('express');
const router = express.Router();
const pool = require('../db/connection');
const authMiddleware = require('../middleware/auth.middleware');

// POST /api/contact/send/:userId — público, cualquiera puede enviar un mensaje
router.post('/send/:userId', async (req, res) => {
  try {
    const { fromName, fromEmail, body } = req.body;
    if (!fromName || !fromEmail || !body)
      return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios' });

    const [[user]] = await pool.execute('SELECT id FROM users WHERE id = ?', [req.params.userId]);
    if (!user)
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });

    await pool.execute(
      'INSERT INTO messages (userId, fromName, fromEmail, body) VALUES (?, ?, ?, ?)',
      [req.params.userId, fromName.trim(), fromEmail.trim(), body.trim()]
    );
    res.status(201).json({ success: true, message: 'Mensaje enviado' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/contact — bandeja de entrada del usuario autenticado
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM messages WHERE userId = ? ORDER BY createdAt DESC',
      [req.user.id]
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/contact/:id/read — marcar como leído
router.patch('/:id/read', authMiddleware, async (req, res) => {
  try {
    const [result] = await pool.execute(
      'UPDATE messages SET isRead = 1 WHERE id = ? AND userId = ?',
      [req.params.id, req.user.id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ success: false, message: 'Mensaje no encontrado' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/contact/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const [result] = await pool.execute(
      'DELETE FROM messages WHERE id = ? AND userId = ?',
      [req.params.id, req.user.id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ success: false, message: 'Mensaje no encontrado' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
