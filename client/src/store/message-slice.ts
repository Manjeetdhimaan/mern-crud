import { createSlice } from "@reduxjs/toolkit";
import { Conversation } from "../models/conversation.model";
import { IMessage } from "../models/message.model";

// const [page, setPage] = useState<number>(1);
// const [totalCount, setTotalCount] = useState<number>(0);
// const [messages, setMessages] = useState<IMessage[]>([]);
// const [currentMsg, setCurrentMsg] = useState<string>("");
// const [conversations, setConversations] = useState<IUser[]>([]);
// const [receiverUser, setreceiverUser] = useState<IUser | null>();
// const [loadingPreviousMsgs, setLoadingPreviousMsgs] =
//   useState<boolean>(false);
//   const [disableLoadPreviosMsg, setDisableLoadPreviosMsg] =
//   useState<boolean>(false);
// const [isEditingMsg, setIsEditingMsg] = useState<boolean>(false);
// const [_, setCurrentEditMsg] = useState<IMessage | null>();
const initialState = {
  page: 1,
  conversationId: "",
  totalCount: 0,
  messages: [],
  currentMsg: "",
  conversations: [],
  receiverUser: null,
  loadingPreviousMsgs: false,
  disableLoadPreviosMsg: false,
  isEditingMsg: false,
  currentEditingMsg: null,
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

      const prevMessages: IMessage[] = state.messages;
      const msgIdx = prevMessages.findIndex(
        (msg: IMessage) => +msg.id === +newMessage.id
      );
      if (msgIdx > 0) {
        prevMessages[msgIdx] = newMessage;
        (state.messages as IMessage[]) = [...prevMessages];
      } else {
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
    setCurrentMsg(state, action) {
      state.currentMsg = action.payload.currentMsg;
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
    setLoadingPreviousMsgs(state, action) {
      state.loadingPreviousMsgs = action.payload.loadingPreviousMsgs;
    },
    setDisableLoadPreviosMsg(state, action) {
      state.disableLoadPreviosMsg = action.payload;
    },
    setEditingMsg(state, action) {
      state.isEditingMsg = action.payload.isEditingMsg;
    },
    setCurrentEditingMsg(state, action) {
      state.currentEditingMsg = action.payload.currentEditingMsg;
    },
  },
});

export const messageActions = messageSlice.actions;

export default messageSlice;
