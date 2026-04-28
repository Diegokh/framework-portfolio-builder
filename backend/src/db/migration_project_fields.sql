-- Agregar campos de visitas, contactos y contador de tecnologías a la tabla projects
ALTER TABLE projects
ADD COLUMN visits INT DEFAULT 0,
ADD COLUMN contacts INT DEFAULT 0;

-- Crear índice para mejorar búsquedas por visitas y contactos
CREATE INDEX idx_projects_visits ON projects(visits);
CREATE INDEX idx_projects_contacts ON projects(contacts);
