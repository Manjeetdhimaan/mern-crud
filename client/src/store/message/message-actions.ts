import { Dispatch } from "@reduxjs/toolkit";

import http from "../../services/http/http.service";
import snackbarService from "../ui/snackbar/snackbar-actions";
import { getUserEmail } from "../../util/auth";
import { IUser } from "../../models/user.model";
import { messageActions } from "./message-slice";
import { Conversation } from "../../models/conversation.model";
import { messageBaseUrl } from "../../constants/api.constants";

function getUpdatedConversations(conversations: Conversation[], localUserEmail: string): IUser[] {
  const updatedConversations = conversations.map(
    (conversation: Conversation) => {
      const isSameUser = localUserEmail === conversation.startedByEmail;
      return {
        id: conversation.conversationId,
        fullName: isSameUser
          ? conversation.receivedByName
          : conversation.startedByName,
        email: isSameUser
          ? conversation.receivedByEmail
          : conversation.startedByEmail,
        receiverId: isSameUser
          ? conversation.receivedById
          : conversation.startedById,
        lastMessage: {
          lastMessage: conversation.lastMessage,
          lastMessageBy: conversation.lastMessageBy,
          lastMessageType: conversation.lastMessageType,
          lastMessageCreatedAt: conversation.lastMessageCreatedAt
        },
        createdAt: conversation.conversationCreatedAt,
        updatedAt: conversation.conversationUpdatedAt
      };
    }
  );
  return (updatedConversations as IUser[]).sort((a: IUser, b: IUser) => new Date(String(b.lastMessage?.lastMessageCreatedAt)).getTime() - new Date(String(a.lastMessage?.lastMessageCreatedAt)).getTime());
}

const fetchConversations = (senderId: number): any => {
  return async (dispatch: Dispatch): Promise<void> => {
    const fetchData = async () => {
      const response = await http.get(`${messageBaseUrl}/conversations`, {
        senderId: senderId,
      });

      if (response && response.data && response.data.conversations) {
        const conversations = response.data.conversations;
        const localUserEmail = getUserEmail();
        const updatedConversations = getUpdatedConversations(conversations, String(localUserEmail))
        return updatedConversations;
      } else {
        return [];
      }
    };

    try {
      const conversations = await fetchData();
      dispatch(
        messageActions.setConversations({
          conversations,
          totalCount: 0,
        })
      );
      dispatch(
        messageActions.setReceiverUser({
          conversations,
        })
      );
    } catch (error) { }
  };
};

const fetchMessages = (conversationId: string): any => {
  return async (dispatch: Dispatch): Promise<void> => {
    const fetchData = async () => {
      const response = await http.get(`${messageBaseUrl}/get-messages`, {
        conversationId: conversationId,
        page: 1,
      });

      if (response && response.data && response.data.messages) {
        return {
          totalCount: +response.data.totalCount,
          messages: response.data.messages,
          page: 1,
        };
      } else {
        return null;
      }
    };

    try {
      dispatch(messageActions.setLoading(true));
      const data = await fetchData();
      if (data && data.messages && data.totalCount) {
        dispatch(
          messageActions.setMessages({
            messages: data.messages,
          })
        );
        dispatch(
          messageActions.setTotalCount({
            totalCount: data.totalCount,
          })
        );
        
      } else {
        dispatch(
          messageActions.setMessages({
            messages: [],
          })
        );
        dispatch(
          messageActions.setTotalCount({
            totalCount: 0,
          })
        );
      }
      dispatch(messageActions.setConversationsMenuOpen(false));
    } catch (error) {
    } finally {
      dispatch(messageActions.setLoading(false));
    }
  };
};

const fetchPreviousMessages = (
  conversationId: string,
  page: number
): any => {
  return async (dispatch: Dispatch): Promise<void> => {
    const fetchData = async () => {
      const response = await http.get(`${messageBaseUrl}/get-messages`, {
        conversationId: conversationId,
        page: page,
      });

      dispatch(messageActions.setDisableLoadPreviosMsg(false));
      if (response && response.data && response.data.messages) {
        return response.data.messages;
      } else {
        return [];
      }
    };

    try {
      const messages = await fetchData();
      if (messages && messages.length > 0) {
        dispatch(
          messageActions.setMessagesWithPrevious({
            messages: messages,
          })
        );
      }
    } catch (error) { }
  };
};

const deleteConversation = (cnvsId: string): any => {
  return async (dispatch: Dispatch): Promise<void> => {
    const deleteData = async () => {
      const response = await http.delete(`${messageBaseUrl}/delete-conversation/${cnvsId}`);
      if (response && response.data && response.data.success) {
        return true;
      } else {
        return false;
      }
    };

    try {
      const success = await deleteData();
      if (success) {
        dispatch(messageActions.setConversationsOnDelete({ id: String(cnvsId) }));
      }
      else {
        snackbarService.error("Failed to delete conversation")
      }
    } catch (error) { }
  };
};

export { fetchMessages, fetchPreviousMessages, deleteConversation, getUpdatedConversations, fetchConversations }
