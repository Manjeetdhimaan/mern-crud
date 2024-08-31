"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emitFileShareMessage = emitFileShareMessage;
const socket_io_1 = require("socket.io");
const db_service_1 = __importDefault(require("../services/db.service"));
const database_tables_1 = require("../utils/database-tables");
const sockets_constants_1 = require("../constants/sockets.constants");
const common_1 = require("../helpers/common");
let chatNamseSpace;
class Socket {
    constructor(server) {
        this.db = new db_service_1.default();
        this.server = server;
        this.io = new socket_io_1.Server(this.server, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"],
            },
        });
        chatNamseSpace = this.io.of("api/v1/chat");
        chatNamseSpace.on(sockets_constants_1.CONNECTION, (socket) => {
            let room = "";
            console.log("User connected with ID: ", socket.id);
            socket.on(sockets_constants_1.JOIN, ({ conversationId }) => {
                if (conversationId) {
                    console.log("User joined room with ID: ", conversationId);
                    room = "room-" + conversationId;
                    socket.join(room);
                }
            });
            // send/receive private message
            socket.on(sockets_constants_1.PRIVATE_MESSAGE, async ({ body, ownerId, conversationId, messageType }) => {
                // console.log("Message recieved: ", body, conversationId);
                const payload = {
                    ownerId,
                    conversationId,
                    messageType,
                    body,
                };
                const response = (await this.db.insertData(payload, database_tables_1.MESSAGES));
                chatNamseSpace.in(room).emit(sockets_constants_1.PRIVATE_MESSAGE, {
                    body,
                    ownerId,
                    conversationId,
                    messageType,
                    createdAt: (0, common_1.getCurrentUTCDate)(),
                    id: response.insertId,
                });
            });
            // edit private message
            socket.on(sockets_constants_1.EDIT_PRIVATE_MESSAGE, async ({ body, messageId, messageType, ownerId, createdAt, conversationId, }) => {
                // console.log("Edited Message recieved: ", body, messageId);
                const response = (await this.db.update(database_tables_1.MESSAGES, { body }, "id", messageId));
                if (response && response.affectedRows) {
                    chatNamseSpace.in(room).emit(sockets_constants_1.EDIT_PRIVATE_MESSAGE, {
                        body,
                        ownerId,
                        conversationId,
                        messageType,
                        id: messageId,
                        createdAt,
                    });
                }
            });
            // delete private message
            socket.on(sockets_constants_1.DELETE_PRIVATE_MESSAGE, async ({ messageId, conversationId }) => {
                const response = (await this.db.permanentDelete(database_tables_1.MESSAGES, "id", messageId));
                if (response && response.affectedRows) {
                    chatNamseSpace.in(room).emit(sockets_constants_1.DELETE_PRIVATE_MESSAGE, {
                        messageId,
                        conversationId,
                    });
                }
            });
            // update last message in conversation
            socket.on(sockets_constants_1.LAST_MESSAGE_CONVERSATION, async ({ conversationId, lastMessage, lastMessageBy, lastMessageType, lastMessageCreatedAt }) => {
                try {
                    const valuesToUpdate = {
                        lastMessage,
                        lastMessageBy,
                        lastMessageType,
                        lastMessageCreatedAt
                    };
                    const response = (await this.db.update(database_tables_1.CONVERSATIONS, valuesToUpdate, "id", conversationId));
                    if (response && response.affectedRows) {
                        chatNamseSpace.in(room).emit(sockets_constants_1.LAST_MESSAGE_CONVERSATION, {
                            conversationId, lastMessage, lastMessageBy, lastMessageType, lastMessageCreatedAt
                        });
                    }
                }
                catch (error) {
                    console.log("Error=>", error);
                }
            });
            socket.on(sockets_constants_1.DISCONNECT, (reason) => {
                console.log(`A user with socket id ${socket.id} disconnected:  ${reason}`);
            });
        });
    }
}
exports.default = Socket;
function emitFileShareMessage(data) {
    chatNamseSpace.in(`room-${data.conversationId}`).emit(sockets_constants_1.PRIVATE_MESSAGE, {
        body: data.body,
        ownerId: data.ownerId,
        conversationId: data.conversationId,
        messageType: data.messageType,
        id: data.id,
        createdAt: data.createdAt
    });
}
