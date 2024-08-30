import { IUser } from "./user.model";

export interface IMessage {
  ownerId: number;
  content: string;
  body: string;
  id: number;
  messageType: string;
  createdAt: string;
}

export interface ILastMessage {
  conversationId: string,
  lastMessageBy: number,
  lastMessage: string,
  lastMessageType: string,
  lastMessageCreatedAt: Date | string
}

export interface IMessageInitialState {
  page: number;
  totalCount: number;
  isLoading: boolean;
  messages: IMessage[];
  conversations: IUser[];
  conversationId: string;
  receiverUser: IUser | null;
  disableLoadPreviosMsg: boolean;
  conversationsMenuOpen: boolean;
  // Share file in messages
  filesBase64: IFileBase64[];
  isSendingMsg: boolean
}

export interface IFileBase64 {
  name: string;
  url: string;
  size: number,
  extenstion: string
}
