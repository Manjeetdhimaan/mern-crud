export interface Conversation {
    id: string,
    fullName: string,
    startedByName: string,
    receivedByName: string,
    email: string,
    receivedByEmail: string,
    startedByEmail: string,
    receiverId: number,
    receivedById: number,
    startedById: number,
    conversationId: string
    lastMessage: string,
    lastMessageBy: number,
    lastMessageType: string
    conversationCreatedAt: string,
    conversationUpdatedAt: string,
    lastMessageCreatedAt: string
}