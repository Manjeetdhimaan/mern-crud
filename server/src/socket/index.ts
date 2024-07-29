import { IncomingMessage, ServerResponse, Server as HttpServer } from "http";
import { Server as SocketServer } from "socket.io";

import DatabaseService from "../services/db.service";
import { MESSAGES } from "../utils/database-tables";

export default function socketServer(server: HttpServer<typeof IncomingMessage, typeof ServerResponse>) {
    const db = new DatabaseService();

    const io = new SocketServer(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
        },
    });
    const chatNamseSpace = io.of('api/v1/chat');

    chatNamseSpace.on('connection', (socket) => {
        let room = '';
        console.log('User connected with ID: ', socket.id);
        socket.on('join', ({ conversationId }) => {
            console.log('User joined room with ID: ', conversationId);
            room = 'room ' + conversationId;
            socket.join(room);
        });

        socket.on('private_message', async ({ content, recieverId, senderId, conversationId }) => {
            console.log('Message recieved: ', content, conversationId);
            const payload = {
                ownerId: senderId,
                conversationId: conversationId,
                messageType: 'text',
                body: content
            }
            chatNamseSpace.in(room).emit('private_message', {content, recieverId, senderId, conversationId});
            await db.insertData(payload, MESSAGES);
        });

        socket.on('disconnect', (reason) => {
            console.log('A user disconnected with ID:, ', reason);
        });
    });


}

