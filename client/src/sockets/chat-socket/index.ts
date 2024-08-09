import { io } from "socket.io-client";

import { IMessage } from "../../models/message.model";
import { BASE_API_URL } from "../../constants/local.constants";
import {
  CONNECT,
  DELETE_PRIVATE_MESSAGE,
  EDIT_PRIVATE_MESSAGE,
  JOIN,
  PRIVATE_MESSAGE,
} from "../../constants/socket.constants";

const socket = io(BASE_API_URL + "/chat");

export function emitRoom(cnvsId: string): void {
  socket.emit(JOIN, { conversationId: cnvsId });
}

export function socketInit(): void {
  socket.on(CONNECT, () => {
    console.log("Connection Id", socket.id);
  });
}

export function onPrivateMsg(
  setMessages: React.Dispatch<React.SetStateAction<IMessage[]>>,
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
        createdAt: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, message]);
      // or you can show some notification to user that new message recieved
      if (messageWrapper.current) {
        const maxScroll = messageWrapper.current.scrollHeight;
        messageWrapper.current.scrollTo({ top: maxScroll, behavior: "auto" });
      }
    } else {
      //show notification::
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

export function onEditPrivateMessage(
  setMessages: React.Dispatch<React.SetStateAction<IMessage[]>>
): void {
  socket.on(EDIT_PRIVATE_MESSAGE, (newMessage) => {
    if (location.pathname.includes(newMessage.conversationId)) {
      const message = {
        ...newMessage,
        ownerId: newMessage.ownerId,
        body: newMessage.body,
        id: newMessage.id,
        messageType: newMessage.messageType,
        createdAt: new Date(newMessage.createdAt),
      };

      setMessages((prevMessages) => {
        const msgIdx = prevMessages.findIndex((msg) => +msg.id === +message.id);
        if (msgIdx > 0) {
          prevMessages[msgIdx] = message;
          return [...prevMessages];
        }
        return [...prevMessages];
      });
      // or you can show some notification to user that new message recieved
    } else {
      //show notification::
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

export function onDeletePrivateMessage(
  setMessages: React.Dispatch<React.SetStateAction<IMessage[]>>
): void {
  socket.on(DELETE_PRIVATE_MESSAGE, ({ messageId, conversationId }) => {
    if (location.pathname.includes(conversationId)) {
      setMessages((prevMessages) => {
        const updatedMessages = prevMessages.filter(
          (msg) => +msg.id !== +messageId
        );
        return [...updatedMessages];
      });
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
