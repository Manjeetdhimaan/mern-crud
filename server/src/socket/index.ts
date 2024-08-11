import { IncomingMessage, ServerResponse, Server as HttpServer } from "http";
import { Server as SocketServer } from "socket.io";

import DatabaseService from "../services/db.service";
import { MESSAGES } from "../utils/database-tables";
import { ResultSetHeader } from "mysql2";
import {
  CONNECTION,
  DELETE_PRIVATE_MESSAGE,
  DISCONNECT,
  EDIT_PRIVATE_MESSAGE,
  JOIN,
  PRIVATE_MESSAGE,
} from "../constants/sockets.constants";

export default function socketServer(
  server: HttpServer<typeof IncomingMessage, typeof ServerResponse>
) {
  const db = new DatabaseService();

  const io = new SocketServer(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });
  const chatNamseSpace = io.of("api/v1/chat");

  chatNamseSpace.on(CONNECTION, (socket) => {
    let room = "";
    console.log("User connected with ID: ", socket.id);
    socket.on(JOIN, ({ conversationId }) => {
      console.log("User joined room with ID: ", conversationId);
      room = "room " + conversationId;
      socket.join(room);
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
        const response = (await db.insertData(
          payload,
          MESSAGES
        )) as ResultSetHeader;
        chatNamseSpace.in(room).emit(PRIVATE_MESSAGE, {
          body,
          ownerId,
          conversationId,
          messageType,
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
        console.log("Edited Message recieved: ", body, messageId);
        const response = (await db.update(
          MESSAGES,
          "body",
          body,
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
    socket.on(DELETE_PRIVATE_MESSAGE, async ({ messageId, conversationId }) => {
      const response = (await db.permanentDelete(
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
    });

    socket.on(DISCONNECT, (reason) => {
      console.log("A user disconnected:, ", reason);
    });
  });
}
