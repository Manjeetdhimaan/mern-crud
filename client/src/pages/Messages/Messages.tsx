import { useDispatch, useSelector } from "react-redux";
import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";

import Users from "../../components/Users/Users";
import PopupMenu from "../../components/UI/PopupMenu/PopupMenu";
import MessageHeader from "../../components/Message/MessageHeader";
import RenderMessageDate from "../../components/Message/RenderMessageDate";
import LoadPreviousMessages from "../../components/Message/LoadPreviousMessages";
import RenderMessageContent from "../../components/Message/RenderMessageContent";
import {
  DeleteIcon,
  EditIcon,
  LinkIcon,
  PlusIcon,
  SendIcon,
} from "../../components/UI/Icons/Icons";
import { IUser } from "../../models/user.model";
import { IMessage } from "../../models/message.model";
import { useLoaderData, useParams } from "react-router-dom";
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
  fetchConversations,
  fetchMessages,
  fetchPreviousMessages,
} from "../../store/message-actions";
import { RootState } from "../../store";
import { messageActions } from "../../store/message-slice";

export function Messages() {
  // Local properties
  const [currentMsg, setCurrentMsg] = useState<string>("");
  const [loadingPreviousMsgs, setLoadingPreviousMsgs] =
    useState<boolean>(false);
  const [isEditingMsg, setIsEditingMsg] = useState<boolean>(false);
  const [_, setCurrentEditMsg] = useState<IMessage | null>();
  const messageWrapper = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { conversationId } = useParams();
  const id = useLoaderData();

  // Redux properties
  const dispatch = useDispatch();
  const conversations = useSelector(
    (state: RootState) => state.message.conversations
  );
  const messages: IMessage[] = useSelector(
    (state: RootState) => state.message.messages
  );
  const page = useSelector((state: RootState) => state.message.page);
  const receiverUser = useSelector(
    (state: RootState) => state.message.receiverUser
  );
  const totalCount = useSelector(
    (state: RootState) => state.message.totalCount
  );
  const disableLoadPreviosMsg = useSelector(
    (state: RootState) => state.message.disableLoadPreviosMsg
  );

  useEffect(() => {
    // Initialize socket.io::
    socketInit();
    onPrivateMsg(dispatch, messageWrapper);
    onEditPrivateMessage(dispatch);
    onDeletePrivateMessage(dispatch);
    return () => {
      offPrivateMsg();
      offEditPrivateMsg();
      offDeletePrivateMsg();
    };
  }, []);

  useEffect(() => {
    dispatch(fetchConversations(Number(id)));
  }, [dispatch]);

  useEffect(() => {
    if (conversationId) {
      dispatch(
        messageActions.setConversationId({
          conversationId: conversationId,
        })
      );
      dispatch(
        messageActions.setReceiverUser({
          conversations: conversations,
        })
      );
      dispatch(fetchMessages(String(conversationId)));
    }
    dispatch(messageActions.setPage({ page: 1 }));
    emitRoom(String(conversationId));
    setLoadingPreviousMsgs(false);
    handleCancelEdit();
    setCurrentMsg("");
  }, [dispatch, conversationId]);

  // useEffect(() => {
  //   const handleScroll = () => {
  //     if (messageWrapper.current) {
  //       // Check if the scroll position is at the top
  //       if (messageWrapper.current.scrollTop === 0) {
  //         console.log("Reached the top of the div!");
  //         // You can call a function here, like loading previous messages
  //           onLoadPreviousMsgs();
  //       }
  //     }
  //   };

  //   const divElement = messageWrapper.current;
  //   if (divElement) {
  //     divElement.addEventListener("scroll", handleScroll);
  //   }

  //   // Cleanup the event listener on unmount
  //   return () => {
  //     if (divElement) {
  //       divElement.removeEventListener("scroll", handleScroll);
  //     }
  //   };
  // }, [messageWrapper.current?.scrollTop]);

  useEffect(() => {
    if (page > 1) {
      dispatch(fetchPreviousMessages(String(conversationId), page));
    }
  }, [page]);

  useEffect(() => {
    if (messageWrapper.current && !loadingPreviousMsgs) {
      const maxScroll = messageWrapper.current.scrollHeight;
      messageWrapper.current.scrollTo({ top: maxScroll, behavior: "auto" });
    }
  }, [messages.length]);

  const onLoadPreviousMsgs = (): void => {
    dispatch(
      messageActions.setPage({
        page: page + 1,
      })
    );
    setLoadingPreviousMsgs(true);
    dispatch(messageActions.setDisableLoadPreviosMsg(true));
  };

  const onEditPrivateMsg = (messageBody: string, messageId: number) => {
    setIsEditingMsg(true);
    const currentMsg = messages.find((msg) => msg.id === messageId);
    if (currentMsg) {
      const currentMessage: IMessage = JSON.parse(JSON.stringify(currentMsg));
      currentMessage.body = messageBody;
      setCurrentEditMsg(() => currentMessage);
      setCurrentMsg(currentMessage.body);
      handleInput();
    } else {
      // show notification
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
      setCurrentEditMsg((prevMsg): IMessage => {
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
    handleInput();
    // setMessageId(0);
  }, [currentMsg, conversationId, id]);

  const handleCancelEdit = (): void => {
    setCurrentEditMsg(() => null);
    setIsEditingMsg(false);
    setCurrentMsg("");
    handleInput();
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
        setLoadingPreviousMsgs(true);
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

  const handleInput = () => {
    setTimeout(() => {
      if (textareaRef.current) {
        if (textareaRef.current.scrollHeight > 56) {
          textareaRef.current.style.height = "auto"; // Reset height
          textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`; // Set new height
        }
      }
    });
  };

  const handleChangeInput = (event: ChangeEvent<HTMLTextAreaElement>): void => {
    setCurrentMsg(event.target.value);
    handleInput();
  };

  const messageClasses = `text-cyan-50 px-3 py-1 rounded-xl inline-block max-w-[50%] text-left`;

  return (
    <section>
      <MessageHeader user={receiverUser as unknown as IUser} />

      <Users users={conversations}>
        <div className="p-6 flex items-baseline justify-between">
          <h2 className="text-2xl px-4">Conversations</h2>
          <a className="cursor-pointer">
            <PlusIcon stroke={3.5} className="size-4" />
          </a>
        </div>
      </Users>

      {conversationId && conversations.length && messages.length > 0 ? (
        <div className="p-10 shadow-lg h-screen w-[80%] float-right relative max-h-[90vh]">
          <div
            className="h-4/5 w-3/4 pr-[8%] pl-[2%] overflow-auto scrollbar-thin max-h-[80%]"
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
                      message={message}
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
            <div className="w-2/3 relative flex mt-[40px]">
              <div className="bottom-[-80px] w-[100%] absolute">
                <label
                  htmlFor="file-change-message"
                  className="cursor-pointer inline-block w-[25px] h-[25px] absolute bottom-[12px] min-h-[38px] left-5 rotate-[-45deg]"
                >
                  <input
                    type="file"
                    className="hidden"
                    id="file-change-message"
                  />
                  <LinkIcon stroke={2} className="size-6" />
                </label>

                <textarea
                  placeholder="Message..."
                  onKeyDown={handleKeyDown}
                  value={currentMsg}
                  onChange={handleChangeInput}
                  className={`bg-red-50 w-[100%] py-4 px-12 pr-[30%] max-h-32 outline-none rounded-3xl scrollbar-none resize-none border-2 ${
                    isEditingMsg && "animate-blink-border"
                  }`}
                  ref={textareaRef}
                  rows={1}
                ></textarea>
                <button
                  disabled={!currentMsg || !currentMsg.trim()}
                  className="absolute right-2 bottom-[12px] rounded-2xl"
                  onClick={onSubmit}
                >
                  <SendIcon />
                </button>
                {isEditingMsg && (
                  <>
                    <small className="absolute left-[6.5%] top-0 underline text-red-500 bg-red-50 border-t-2">Editing Message</small>
                    <a
                      className="absolute right-[12%] bottom-[24px] rounded-2xl cursor-pointer text-red-600"
                      onClick={handleCancelEdit}
                    >
                      Cancel editing
                    </a>
                  </>
                )}
              </div>
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
