import { useCallback, useEffect, useRef, useState } from "react";

import http from "../../util/http";
import Users from "../../components/Users/Users";
import PopupMenu from "../../components/UI/PopupMenu/PopupMenu";
import MessageHeader from "../../components/Message/MessageHeader";
import RenderMessageDate from "../../components/Message/RenderMessageDate";
import RenderMessageContent from "../../components/Message/RenderMessageContent";
import { getUserEmail } from "../../util/auth";
import { IUser } from "../../models/user.model";
import { IMessage } from "../../models/message.model";
import { useLoaderData, useParams } from "react-router-dom";
import { Conversation } from "../../models/conversation.model";
import {
  emitDeletePrivateMsg,
  emitEditPrivateMsg,
  emitPrivateMsg,
  emitRoom,
  offDeletePrivateMsg,
  offEditPrivateMsg,
  offPrivateMsg,
  onDeletePrivateMessage,
  onEditPrivateMessage,
  onPrivateMsg,
  socketInit,
} from "../../sockets/chat-socket";
import { IMenuItem } from "../../models/ui.model";
import {
  DeleteIcon,
  EditIcon,
  PlusIcon,
  SendIcon,
} from "../../components/UI/Icons/Icons";
import LoadPreviousMessages from "../../components/Message/LoadPreviousMessages";

const messageBaseUrl = "/messages";

export function Messages() {
  const [page, setPage] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [currentMsg, setCurrentMsg] = useState<string>("");
  const [conversations, setConversations] = useState<IUser[]>([]);
  const [recieverUser, setRecieverUser] = useState<IUser | null>();
  const [loadingPreviousMsgs, setLoadingPreviousMsgs] =
    useState<boolean>(false);
    const [disableLoadPreviosMsg, setDisableLoadPreviosMsg] =
    useState<boolean>(false);
  const [isEditingMsg, setIsEditingMsg] = useState<boolean>(false);
  const [_, setCurrentEditMsg] = useState<IMessage | null>();
  const messageWrapper = useRef<HTMLDivElement>(null);

  const { conversationId } = useParams();
  const id = useLoaderData();

  useEffect(() => {
    // Initialize socket.io
    if (id) {
      fetchConversations(+id);
    }
    socketInit();

    onPrivateMsg(setMessages, messageWrapper);
    onEditPrivateMessage(setMessages);
    onDeletePrivateMessage(setMessages);

    return () => {
      offPrivateMsg();
      offEditPrivateMsg();
      offDeletePrivateMsg();
    };
  }, []);

  useEffect(() => {
    // called whenever conversation id changed (which means user has swithced the chat from one use to another)
    setPage(1);
    setTotalCount(0);
    onEmitRoomAndFetchMsgs();
    setLoadingPreviousMsgs(false);
    if (!conversationId) {
      setMessages([]);
    }
    onSetRecieverUser(conversations);
    handleCancelEdit();
    setCurrentMsg("");
  }, [conversationId]);

  useEffect(() => {
    if (page > 1) {
      fetchPreviousMessages();
    }
  }, [page]);

  useEffect(() => {
    if (messageWrapper.current && !loadingPreviousMsgs) {
      const maxScroll = messageWrapper.current.scrollHeight;
      messageWrapper.current.scrollTo({ top: maxScroll, behavior: "auto" });
    }
  }, [messages.length]);

  const fetchConversations = async (
    senderId: number
  ): Promise<IUser[] | undefined> => {
    try {
      const response = await http.get(
        `${messageBaseUrl}/conversations?senderId=${senderId}`
      );
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
              recieverId: isSameUser
                ? conversation.receivedById
                : conversation.startedById,
            };
          }
        );
        onEmitRoomAndFetchMsgs();
        setConversations(() => updatedConversations);
        setTotalCount(0);
        onSetRecieverUser(updatedConversations);
        return updatedConversations;
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchMessages = async (): Promise<void> => {
    const response = await http.get(
      `${messageBaseUrl}/get-messages?conversationId=${conversationId}&page=${1}`
    );

    if (response && response.data && response.data.messages) {
      setTotalCount(+response.data.totalCount);
      setMessages(() => [...response.data.messages]);
    } else {
      setMessages(() => []);
    }
  };

  const fetchPreviousMessages = async (): Promise<void> => {
    const response = await http.get(
      `${messageBaseUrl}/get-messages?conversationId=${conversationId}&page=${page}`
    );
    setDisableLoadPreviosMsg(false);
    if (response && response.data && response.data.messages) {
      response.data.messages.forEach((message: IMessage, i: number) => {
        // add messages with settimeout to show scroll animation
        setTimeout(() => {
          setMessages((prevMsgs) => {
            return [message, ...prevMsgs];
          });
        }, 30 * i);
      });
    } else {
      setMessages(() => []);
    }
  };

  const onLoadPreviousMsgs = useCallback((): void => {
    setPage((prevPage) => prevPage + 1);
    setLoadingPreviousMsgs(true);
    setDisableLoadPreviosMsg(true);
  }, []);

  const onEmitRoomAndFetchMsgs = useCallback(async (): Promise<void> => {
    if (conversationId) {
      emitRoom(conversationId);
      await fetchMessages();
    }
  }, [conversationId, fetchMessages]);

  const onSetRecieverUser = (conversations: IUser[]): void => {
    const currentRecieverUser = conversations.find(
      (conversation) => conversation.id === conversationId
    );
    if (currentRecieverUser) {
      setRecieverUser(() => {
        return { ...currentRecieverUser };
      });
    } else {
      setRecieverUser(() => {
        return null;
      });
    }
  };

  const onEditPrivateMsg = (messageBody: string, messageId: number) => {
    setIsEditingMsg(true);
    const currentMsg = messages.find((msg) => msg.id === messageId);
    if (currentMsg) {
      currentMsg.body = messageBody;
      setCurrentEditMsg(() => currentMsg);
      setCurrentMsg(currentMsg.body);
    } else {
      // show notification or handle error
    }
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ): void => {
    if (event.key === "Enter") {
      event.preventDefault();
      onSubmit();
    }
  };

  const onSubmit = useCallback((): void => {
    if (!currentMsg.trim() || !conversationId?.trim()) {
      return;
    }
    setLoadingPreviousMsgs(false);
    if (isEditingMsg) {
      setCurrentEditMsg((prevMsg) => {
        const newMsg = {
          ...prevMsg,
          body: currentMsg,
        };
        emitEditPrivateMsg(
          newMsg as IMessage,
          Number(id),
          String(conversationId)
        );
        return newMsg as IMessage;
      });

      handleCancelEdit();
    } else {
      emitPrivateMsg(currentMsg.trim(), Number(id), String(conversationId));
    }
    setCurrentMsg("");
    // setMessageId(0);
  }, [currentMsg, conversationId, id]);

  const handleCancelEdit = (): void => {
    setCurrentEditMsg(() => null);
    setIsEditingMsg(false);
    setCurrentMsg("");
  };

  const handleDeleteMsg = (messageId: number): void => {
    // ask for confirmation
    emitDeletePrivateMsg(messageId, String(conversationId));
    handleCancelEdit();
  };

  const handleMenuClick = <T extends unknown>(
    label: string,
    message?: T
  ): void => {
    const msg = message as IMessage;
    switch (label) {
      case "Edit":
        onEditPrivateMsg(msg.body, msg.id);
        break;

      case "Delete":
        handleDeleteMsg(msg.id);
        break;

      default:
        break;
    }
  };

  const menuItems: IMenuItem[] = [
    {
      label: "Edit",
      icon: <EditIcon />,
      onClick: handleMenuClick,
    },
    {
      label: "Delete",
      icon: <DeleteIcon />,
      onClick: handleMenuClick,
    },
  ];

  const messageClasses = `text-cyan-50 px-3 py-1 rounded-xl inline-block max-w-[50%] text-left`;

  return (
    <section>
      {
        (conversationId && messages.length <= 0) && 
        <div className="animate-spin ">
        </div>
      }
      <div className="animate-spin ">
        </div>
      <MessageHeader user={recieverUser as IUser} />
      <Users users={conversations}>
        <div className="p-6 flex items-baseline justify-between">
          <h2 className="text-2xl px-4">Conversations</h2>
          <a className="cursor-pointer">
            <PlusIcon stroke={3.5} className="size-4" />
          </a>
        </div>
      </Users>
      {conversationId && conversations.length && messages.length > 0 ? (
        <div className="p-10 shadow-lg h-screen w-[80%] float-right">
          <div
            className="shadow-lg h-4/5 w-2/3 p-6 overflow-auto scrollbar-thin"
            ref={messageWrapper}
          >
            <LoadPreviousMessages
              messages={messages}
              totalCount={totalCount}
              onLoadPreviousMsgs={onLoadPreviousMsgs}
              disableLoadPreviosMsg={disableLoadPreviosMsg}
            />

            {/* Render messages */}
            {messages.map((message, index) => (
              <div key={`message-wrapper-${message.id}`}>
                {/* Show particular date for messages */}

                <RenderMessageDate
                  key={`date-${message.id}`}
                  index={index}
                  message={message}
                  messages={messages}
                />

                <div
                  key={message.id}
                  className={
                    Number(id) === message.ownerId ? "text-right my-6" : "my-6"
                  }
                >
                  <span
                    className={
                      Number(id) === message.ownerId
                        ? `bg-gray-700 ${messageClasses}`
                        : `bg-slate-500 ${messageClasses}`
                    }
                  >
                    {/* Used this component to show "Show more" button if message is too long */}
                    <RenderMessageContent
                      key={`content-${message.id}`}
                      content={message.body}
                      index={index}
                      messages={messages}
                    />
                  </span>
                  {Number(id) === message.ownerId && (
                    <a className="ml-2">
                      <PopupMenu items={menuItems} data={message} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          {conversationId && (
            <div className="w-2/3 py-6 h-6 relative">
              <textarea
                placeholder="Message..."
                onKeyDown={handleKeyDown}
                value={currentMsg}
                onChange={(e) => setCurrentMsg(e.target.value)}
                className={`bg-red-50 w-[100%] py-4 px-8 pr-[30%] outline-none rounded-3xl resize-none scrollbar-none border-2 ${isEditingMsg && "animate-blink-border"}`}
                rows={1}
              ></textarea>
              <button
                disabled={!currentMsg || !currentMsg.trim()}
                className="absolute right-2 top-[30px] rounded-2xl"
                onClick={onSubmit}
              >
                <SendIcon />
              </button>
              {isEditingMsg && (
                <a
                  className="absolute right-[12%] top-[40px] rounded-2xl cursor-pointer text-red-600"
                  onClick={handleCancelEdit}
                >
                  Cancel editing
                </a>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="shadow-lg h-screen w-[60%] inline-block text-center">
          <p className="text-center">
            {!conversationId ? "Please select a conversation" : "No messages"}
          </p>
        </div>
      )}
    </section>
  );
}
