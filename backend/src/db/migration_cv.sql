-- Columna cvUrl en profile para almacenar el CV del usuario
ALTER TABLE profile
  ADD COLUMN IF NOT EXISTS cvUrl VARCHAR(500) NULL;
