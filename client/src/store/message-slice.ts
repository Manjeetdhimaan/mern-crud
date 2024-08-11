import { createSlice } from "@reduxjs/toolkit";
import { Conversation } from "../models/conversation.model";
import { IMessage } from "../models/message.model";

const initialState = {
  page: 1,
  conversationId: "",
  totalCount: 0,
  messages: [],
  conversations: [],
  receiverUser: null,
  disableLoadPreviosMsg: false,
};

const messageSlice = createSlice({
  name: "message",
  initialState,
  reducers: {
    setPage(state, action) {
      state.page = action.payload.page;
    },

    setConversationId(state, action) {
      state.conversationId = action.payload.conversationId;
    },

    setTotalCount(state, action) {
      state.totalCount = action.payload.totalCount;
    },

    setMessages(state, action) {
      state.messages = action.payload.messages;
      //   state.totalCount = action.payload.totalCount;
    },

    setMessagesOnAdd(state, action) {
      (state.messages as IMessage[]) = [
        ...state.messages,
        action.payload.message,
      ];
      //   state.totalCount = action.payload.totalCount;
    },

    setMessagesWithPrevious(state, action) {
      const previousMessages: IMessage[] = state.messages;
      (state.messages as IMessage[]) = [
        ...action.payload.messages,
        ...previousMessages,
      ];
      //   state.totalCount = action.payload.totalCount;
    },

    onEditMessage(state, action) {
      const newMessage = action.payload.newMessage;
      const message = {
        ...newMessage,
        ownerId: newMessage.ownerId,
        body: newMessage.body,
        id: newMessage.id,
        messageType: newMessage.messageType,
        createdAt: new Date(newMessage.createdAt).toISOString(),
      };
      const prevMessages: IMessage[] = state.messages;
      const msgIdx = prevMessages.findIndex(
        (msg: IMessage) => +msg.id === +message.id
      );
      if (msgIdx > -1) {
        prevMessages[msgIdx] = message;
        (state.messages as IMessage[]) = [...prevMessages];
      }
    },

    onDeleteMessage(state, action) {
      const messageId = action.payload.messageId;
      const prevMessages: IMessage[] = state.messages;
      const updatedMessages = prevMessages.filter(
        (msg) => +msg.id !== +messageId
      );
      (state.messages as IMessage[]) = [...updatedMessages];
    },

    setConversations(state, action) {
      state.conversations = action.payload.conversations;
      state.totalCount = action.payload.totalCount;
    },

    setReceiverUser(state, action) {
      const currentreceiverUser = action.payload.conversations.find(
        (conversation: Conversation) => conversation.id === state.conversationId
      );
      if (currentreceiverUser) {
        state.receiverUser = currentreceiverUser;
      } else {
        state.receiverUser = null;
      }
    },

    setDisableLoadPreviosMsg(state, action) {
      state.disableLoadPreviosMsg = action.payload;
    },
  },
});

export const messageActions = messageSlice.actions;

export default messageSlice;
