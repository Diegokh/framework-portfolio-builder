-- Tabla de categorías (por usuario)
CREATE TABLE IF NOT EXISTS categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  color VARCHAR(20) NOT NULL DEFAULT '#06b6d4',
  description TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_category (userId, name)
);

-- Columna categoryId en projects (NULL = sin categoría)
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS categoryId INT NULL,
  ADD FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE SET NULL;
