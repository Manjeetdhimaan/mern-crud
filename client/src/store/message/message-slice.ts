import { createSlice } from "@reduxjs/toolkit";
import { Conversation } from "../../models/conversation.model";
import { ILastMessage, IMessage, IMessageInitialState } from "../../models/message.model";
import { getCurrentUTCDate } from "../../util/dates";

const initialState: IMessageInitialState = {
  page: 1,
  conversationId: "",
  totalCount: 0,
  messages: [],
  conversations: [],
  receiverUser: null,
  disableLoadPreviosMsg: false,
  isLoading: false,
  isSendingMsg: false,
  // Share file in messages: Properties
  filesBase64: []
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
      if (action.payload.decreaseCount) {
        state.totalCount = state.totalCount--;
      }
      else {
        state.totalCount = action.payload.totalCount;
      }
    },

    setMessages(state, action) {
      state.messages = action.payload.messages;
    },

    setMessagesOnAdd(state, action) {
      (state.messages as IMessage[]) = [
        ...state.messages,
        action.payload.message,
      ];
    },

    setMessagesWithPrevious(state, action) {
      const previousMessages: IMessage[] = state.messages;
      (state.messages as IMessage[]) = [
        ...action.payload.messages,
        ...previousMessages,
      ];
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

    setConversationsOnDelete(state, action) {
      const filteredConversations = state.conversations.filter(cnvs => cnvs.id !== action.payload.id);
      state.conversations = filteredConversations;
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

    setLoading(state, action) {
      state.isLoading = action.payload;
    },

    setSendingMsg(state, action) {
      state.isSendingMsg = action.payload;
    },

    // Files sharing methods

    setFilesBase64(state, action) {
      state.filesBase64 = [...state.filesBase64, action.payload];
    },

    clearFilesBase64(state, action) {
      state.filesBase64 = action.payload || [];
    },

    setLastMessage(state, action) {
      const { conversationId, lastMessage, lastMessageBy, lastMessageType, lastMessageCreatedAt } = action.payload;
      const conversation = state.conversations.find(cnvs => cnvs.id === conversationId);
      if (conversation) {
        const lastMessageData: ILastMessage = {
          conversationId,
          lastMessage,
          lastMessageBy,
          lastMessageType,
          lastMessageCreatedAt
        }
        conversation.lastMessage = lastMessageData;
        conversation.updatedAt = getCurrentUTCDate().toISOString();
      }
      state.conversations.sort((a, b) => new Date(String(b.lastMessage?.lastMessageCreatedAt)).getTime() - new Date(String(a.lastMessage?.lastMessageCreatedAt)).getTime());
    },
  },
});

export const messageActions = messageSlice.actions;

export default messageSlice;
