CREATE TABLE IF NOT EXISTS UserMeta (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    joinedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    lastRead TIMESTAMP,
    deletedAt TIMESTAMP,
    hasUnread BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
);