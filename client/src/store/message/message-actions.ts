import { Dispatch } from "@reduxjs/toolkit";

import http from "../../services/http/http.service";
import { getUserEmail } from "../../util/auth";
import { IUser } from "../../models/user.model";
import { messageActions } from "./message-slice";
import { Conversation } from "../../models/conversation.model";
import { messageBaseUrl } from "../../constants/local.constants";

const fetchConversations = (senderId: number): any => {
  return async (dispatch: Dispatch): Promise<void> => {
    const fetchData = async () => {
      const response = await http.get(`${messageBaseUrl}/conversations`, {
        senderId: senderId,
      });

      if (response && response.data && response.data.conversations) {
        const conversations = response.data.conversations;
        const localUserEmail = getUserEmail();
        const updatedConversations: IUser[] = conversations.map(
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
            };
          }
        );
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
    } catch (error) {}
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
    } catch (error) {}
  };
};


export {fetchConversations, fetchMessages, fetchPreviousMessages}
