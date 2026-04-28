CREATE TABLE IF NOT EXISTS links (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  projectId INT NULL,
  title VARCHAR(150) NOT NULL,
  url TEXT NOT NULL,
  type ENUM('repo', 'demo', 'article', 'video', 'docs', 'certificate', 'other') NOT NULL DEFAULT 'other',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE SET NULL
);
