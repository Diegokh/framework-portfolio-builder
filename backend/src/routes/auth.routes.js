const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db/connection');
const authMiddleware = require('../middleware/auth.middleware');

// ---------- Validaciones ----------
const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || name.trim().length < 2) {
    return res.status(400).json({ success: false, message: 'El nombre debe tener al menos 2 caracteres' });
  }
  if (!email || !email.includes('@')) {
    return res.status(400).json({ success: false, message: 'Email inválido' });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ success: false, message: 'La contraseña debe tener al menos 6 caracteres' });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email y contraseña son obligatorios' });
  }

  next();
};

// ---------- POST /api/auth/register ----------
router.post('/register', validateRegister, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // ¿Existe ya el email?
    const [existing] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'El email ya está registrado' });
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 12);

    // Insertar usuario
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );

    // Generar JWT
    const token = jwt.sign(
      { id: result.insertId, email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      token,
      user: { id: result.insertId, name, email },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ---------- POST /api/auth/login ----------
router.post('/login', validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
    }

    const user = users[0];

    // Comparar contraseña
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
    }

    // Generar JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ---------- POST /api/auth/change-password ----------
router.post('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios' });
    if (newPassword.length < 6)
      return res.status(400).json({ success: false, message: 'La nueva contraseña debe tener al menos 6 caracteres' });

    const [users] = await pool.execute('SELECT password FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0)
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });

    const isValid = await bcrypt.compare(currentPassword, users[0].password);
    if (!isValid)
      return res.status(401).json({ success: false, message: 'La contraseña actual es incorrecta' });

    const hashed = await bcrypt.hash(newPassword, 12);
    await pool.execute('UPDATE users SET password = ? WHERE id = ?', [hashed, req.user.id]);

    res.json({ success: true, message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ---------- GET /api/auth/me ----------
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const [users] = await pool.execute(
      'SELECT id, name, email, createdAt FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    res.json({ success: true, user: users[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
