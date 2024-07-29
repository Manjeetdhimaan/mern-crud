CREATE TABLE IF NOT EXISTS ConversationParticipants (
    conversationId CHAR(36) NOT NULL,
    startedBy INT NOT NULL,
    recievedBy INT NOT NULL,
    PRIMARY KEY (conversationId, userId),
    FOREIGN KEY (conversationId) REFERENCES Conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (startedBy) REFERENCES Users(id) ON DELETE CASCADE
    FOREIGN KEY (recievedBy) REFERENCES Users(id) ON DELETE CASCADE
);