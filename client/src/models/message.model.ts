import { IUser } from "./user.model";

export interface IMessage {
  ownerId: number;
  content: string;
  body: string;
  id: number;
  messageType: string;
  createdAt: string;
}

export interface IMessageInitialState {
  page: number;
  conversationId: string;
  totalCount: number;
  messages: IMessage[];
  conversations: IUser[];
  receiverUser: IUser | null;
  disableLoadPreviosMsg: boolean;
  isLoading: boolean;
  // Share file in messages
  filesBase64: IFileBase64[];
  modelIsOpen: boolean;
}

export interface IFileBase64 {
  name: string;
  url: string;
  size: number,
  extenstion: string
}
