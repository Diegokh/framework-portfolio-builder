require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
const allowedOrigins = new Set(
  [process.env.FRONTEND_URL].filter(Boolean)
);

const localhostPattern = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

app.use(cors({
  origin(origin, callback) {
    // Permite herramientas sin origin (curl, health checks, same-origin server calls)
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.has(origin) || localhostPattern.test(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`Origen no permitido por CORS: ${origin}`));
  },
}));
app.use(express.json());

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Servidor funcionando' });
});

// Rutas (las descomentaremos en próximas lecciones)
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/users.routes'));
app.use('/api/projects', require('./routes/projects.routes'));
app.use('/api/projects/:projectId/technologies', require('./routes/technologies.routes'));
app.use('/api/projects/:projectId/screenshots', require('./routes/screenshots.routes'));
app.use('/api/screenshots', require('./routes/screenshots-all.routes'));
app.use('/api/stats', require('./routes/stats.routes'));
app.use('/api/profiles', require('./routes/profile.routes'));
app.use('/api/profile', require('./routes/profile.routes'));
app.use('/api/skills', require('./routes/skills.routes'));
app.use('/api/categories', require('./routes/categories.routes'));
app.use('/api/links', require('./routes/links.routes'));
app.use('/api/contact', require('./routes/contact.routes'));
app.use('/api/export', require('./routes/export.routes'));
app.use('/uploads', express.static(require('path').join(__dirname, '../uploads')));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));

module.exports = app;
