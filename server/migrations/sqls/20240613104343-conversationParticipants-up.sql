CREATE TABLE IF NOT EXISTS ConversationParticipants (
    conversationId CHAR(36) NOT NULL,
    userId INT NOT NULL,
    PRIMARY KEY (conversationId, userId),
    FOREIGN KEY (conversationId) REFERENCES Conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
);