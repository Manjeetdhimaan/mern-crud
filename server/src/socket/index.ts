import { IncomingMessage, ServerResponse, Server as HttpServer } from "http";
import { Namespace, Server as SocketServer } from "socket.io";

import DatabaseService from "../services/db.service";
import { CONVERSATIONS, MESSAGES } from "../utils/database-tables";
import { ResultSetHeader } from "mysql2";
import {
  CONNECTION,
  DELETE_PRIVATE_MESSAGE,
  DISCONNECT,
  EDIT_PRIVATE_MESSAGE,
  JOIN,
  LAST_MESSAGE_CONVERSATION,
  PRIVATE_MESSAGE,
} from "../constants/sockets.constants";
import { IMessage } from "../types/user.types";
import { getCurrentUTCDate } from "../helpers/common";

let chatNamseSpace: Namespace;

export default class Socket {
  server: HttpServer<typeof IncomingMessage, typeof ServerResponse>;
  db = new DatabaseService();
  io;

  constructor(
    server: HttpServer<typeof IncomingMessage, typeof ServerResponse>
  ) {
    this.server = server;
    this.io = new SocketServer(this.server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });
    chatNamseSpace = this.io.of("api/v1/chat");

    chatNamseSpace.on(CONNECTION, (socket) => {
      let room = "";
      console.log("User connected with ID: ", socket.id);

      socket.on(JOIN, ({ conversationId }) => {
        if (conversationId) {
          console.log("User joined room with ID: ", conversationId);
          room = "room-" + conversationId;
          socket.join(room);
        }
      });

      // send/receive private message
      socket.on(
        PRIVATE_MESSAGE,
        async ({ body, ownerId, conversationId, messageType }) => {
          // console.log("Message recieved: ", body, conversationId);
          const payload = {
            ownerId,
            conversationId,
            messageType,
            body,
          };
          const response = (await this.db.insertData(
            payload,
            MESSAGES
          )) as ResultSetHeader;
          chatNamseSpace.in(room).emit(PRIVATE_MESSAGE, {
            body,
            ownerId,
            conversationId,
            messageType,
            createdAt: getCurrentUTCDate(),
            id: response.insertId,
          });
        }
      );

      // edit private message
      socket.on(
        EDIT_PRIVATE_MESSAGE,
        async ({
          body,
          messageId,
          messageType,
          ownerId,
          createdAt,
          conversationId,
        }) => {
          // console.log("Edited Message recieved: ", body, messageId);
          const response = (await this.db.update(
            MESSAGES,
            { body },
            "id",
            messageId
          )) as ResultSetHeader;
          if (response && response.affectedRows) {
            chatNamseSpace.in(room).emit(EDIT_PRIVATE_MESSAGE, {
              body,
              ownerId,
              conversationId,
              messageType,
              id: messageId,
              createdAt,
            });
          }
        }
      );

      // delete private message
      socket.on(
        DELETE_PRIVATE_MESSAGE,
        async ({ messageId, conversationId }) => {
          const response = (await this.db.permanentDelete(
            MESSAGES,
            "id",
            messageId
          )) as ResultSetHeader;
          if (response && response.affectedRows) {
            chatNamseSpace.in(room).emit(DELETE_PRIVATE_MESSAGE, {
              messageId,
              conversationId,
            });
          }
        }
      );

      // update last message in conversation
      socket.on(
        LAST_MESSAGE_CONVERSATION,
        async ({ conversationId, lastMessage, lastMessageBy, lastMessageType, lastMessageCreatedAt }) => {
          try {
            const valuesToUpdate = {
              lastMessage,
              lastMessageBy,
              lastMessageType,
              lastMessageCreatedAt
            }
            const response = (await this.db.update(CONVERSATIONS, valuesToUpdate, "id", conversationId
            )) as ResultSetHeader;
            if (response && response.affectedRows) {
              chatNamseSpace.in(room).emit(LAST_MESSAGE_CONVERSATION, {
                conversationId, lastMessage, lastMessageBy, lastMessageType, lastMessageCreatedAt
              });
            }
          } catch (error) {
            console.log("Error=>", error);
          }
        }
      );

      socket.on(DISCONNECT, (reason) => {
        console.log(`A user with socket id ${socket.id} disconnected:  ${reason}`);
      });
    });
  }

}

export function emitFileShareMessage(data: IMessage) {
  chatNamseSpace.in(`room-${data.conversationId}`).emit(PRIVATE_MESSAGE, {
    body: data.body,
    ownerId: data.ownerId,
    conversationId: data.conversationId,
    messageType: data.messageType,
    id: data.id,
    createdAt: data.createdAt
  });
}
