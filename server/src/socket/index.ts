import { IncomingMessage, ServerResponse, Server as HttpServer } from "http";
import { Server as SocketServer } from "socket.io";

import DatabaseService from "../services/db.service";
import { MESSAGES } from "../utils/database-tables";
import { ResultSetHeader } from "mysql2";

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

        socket.on('private_message', async ({ body, ownerId, conversationId, messageType }) => {
            console.log('Message recieved: ', body, conversationId);
            const payload = {
                ownerId,
                conversationId,
                messageType,
                body
            }
            const response = await db.insertData(payload, MESSAGES) as ResultSetHeader;
            chatNamseSpace.in(room).emit('private_message', {body, ownerId, conversationId, messageType, id: response.insertId});
        });

        socket.on('disconnect', (reason) => {
            console.log('A user disconnected:, ', reason);
        });
    });


}

