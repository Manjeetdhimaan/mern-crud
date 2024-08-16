import { io } from "socket.io-client";
import { Dispatch } from "@reduxjs/toolkit";

import { IMessage } from "../../../models/message.model";
import { BASE_API_URL } from "../../../constants/local.constants";
import {
  CONNECT,
  DELETE_PRIVATE_MESSAGE,
  DISCONNECT,
  EDIT_PRIVATE_MESSAGE,
  JOIN,
  PRIVATE_MESSAGE,
} from "../../../constants/socket.constants";
import { messageActions } from "../../../store/message-slice";

const socket = io(BASE_API_URL + "/chat");

let conversationId: string = "";

export function setConversationId(cnvsId: string) {
  conversationId = cnvsId;
}

export function onDisconnect() {
  socket.on(DISCONNECT, (reason) => {
    console.log("A user disconnected:, ", reason);
    let timer;
    if (socket.disconnected) {
      timer = setTimeout(() => {
        console.log('Trying to reconnect...')
        socketInit();
        if (conversationId) emitRoom(conversationId);
      }, 5000);
    } else {
      if (timer) clearTimeout(timer);
    }
  });
}

export function emitRoom(cnvsId: string): void {
  if(cnvsId) socket.emit(JOIN, { conversationId: cnvsId });
}

export function socketInit(): void {
  socket.on(CONNECT, () => {
    console.log("Connection Id", socket.id);
  });
}

export function onPrivateMsg(
  dispatch: Dispatch,
  messageWrapper: React.RefObject<HTMLDivElement>
): void {
  socket.on(PRIVATE_MESSAGE, (newMessage) => {
    if (location.pathname.includes(newMessage.conversationId)) {
      const message = {
        ...newMessage,
        ownerId: newMessage.ownerId,
        body: newMessage.body,
        id: newMessage.id,
        messageType: newMessage.messageType,
        createdAt: new Date().toISOString(),
      };
      dispatch(
        messageActions.setMessagesOnAdd({
          message: message,
        })
      );
      if (messageWrapper.current) {
        const maxScroll = messageWrapper.current.scrollHeight;
        messageWrapper.current.scrollTo({ top: maxScroll, behavior: "auto" });
      }
    } else {
      //show notification::
      new Notification(`New message from ${newMessage.fullName}`, {
        body: newMessage.body,
      });
    }
  });
}

export function emitPrivateMsg(
  currentMsg: string,
  ownerId: number,
  conversationId: string,
  messageType = "text"
): void {
  socket.emit(PRIVATE_MESSAGE, {
    body: currentMsg.trim(),
    ownerId: Number(ownerId),
    conversationId,
    messageType,
  });
}

export function onEditPrivateMessage(dispatch: Dispatch): void {
  socket.on(EDIT_PRIVATE_MESSAGE, (newMessage) => {
    if (location.pathname.includes(newMessage.conversationId)) {
      dispatch(
        messageActions.onEditMessage({
          newMessage,
        })
      );
    }
  });
}

export function emitEditPrivateMsg(
  currentMsg: IMessage,
  ownerId: number,
  conversationId: string,
  messageType = "text"
): void {
  socket.emit(EDIT_PRIVATE_MESSAGE, {
    body: currentMsg.body.trim(),
    messageId: currentMsg.id,
    ownerId,
    conversationId,
    createdAt: currentMsg.createdAt,
    messageType,
  });
}

export function onDeletePrivateMessage(dispatch: Dispatch): void {
  socket.on(DELETE_PRIVATE_MESSAGE, ({ messageId, conversationId }) => {
    if (location.pathname.includes(conversationId)) {
      dispatch(
        messageActions.onDeleteMessage({
          messageId,
        })
      );
    } else {
      //show notification::
    }
  });
}

export function emitDeletePrivateMsg(
  messageId: number,
  conversationId: string
): void {
  socket.emit(DELETE_PRIVATE_MESSAGE, {
    messageId,
    conversationId,
  });
}

export function offPrivateMsg(): void {
  socket.off(PRIVATE_MESSAGE);
}

export function offEditPrivateMsg(): void {
  socket.off(EDIT_PRIVATE_MESSAGE);
}

export function offDeletePrivateMsg(): void {
  socket.off(DELETE_PRIVATE_MESSAGE);
}
