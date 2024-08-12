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
import FileInput from "../../components/UI/FileChange/FileChange";

let counter = 0;

export function Messages() {
  // Local properties
  const [currentMsg, setCurrentMsg] = useState<string>("");
  const [loadingPreviousMsgs, setLoadingPreviousMsgs] =
    useState<boolean>(false);
  const [isEditingMsg, setIsEditingMsg] = useState<boolean>(false);
  const [_, setCurrentEditMsg] = useState<IMessage | null>();
  const messageWrapper = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const textareaWrapperRef = useRef<HTMLDivElement>(null);
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

  const isLoading = useSelector((state: RootState) => state.message.isLoading);

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
      counter = 0;
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

  useEffect(() => {
    if (page > 1) {
      dispatch(fetchPreviousMessages(String(conversationId), page));
    }
  }, [page]);

  useEffect(() => {
    setTimeout(() => {
      if (messageWrapper.current && !loadingPreviousMsgs) {
        const maxScroll = messageWrapper.current.scrollHeight;
        messageWrapper.current.scrollTo({
          top: maxScroll,
          behavior: counter === 0 ? "instant" : "smooth",
        });
        if (counter === 0) {
          counter++;
        }
      }
    });
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

  const handleInput = () => {
    setTimeout(() => {
      if (textareaRef.current && textareaWrapperRef.current) {
        // textareaWrapperRef.current.style.height = "auto";
        // textareaWrapperRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        if (textareaRef.current.scrollHeight > 52) {
          textareaRef.current.style.height = "auto"; // Reset height
          textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`; // Set new height
          textareaWrapperRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
          if (+textareaWrapperRef.current.style.height.slice(0, -2) === 56) {
            textareaWrapperRef.current.style.height = `${60}px`;
          }
          if (+textareaRef.current.style.height.slice(0, -2) >= 80) {
            textareaRef.current.style.height = `${80}px`; // Set new height
          }
          if (+textareaRef.current.style.height.slice(0, -2) === 56) {
            textareaRef.current.style.height = `${54}px`; // Set new height
          }
         
        }
      }
    });
  };

  const handleChangeInput = (event: ChangeEvent<HTMLTextAreaElement>): void => {
    setCurrentMsg(event.target.value);
    handleInput();
  };

  const handleFileChange = (files: FileList | null) => {
    console.log(files);
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
    <section className="relative w-[80%]">
      <MessageHeader user={receiverUser as unknown as IUser} />
      <Users users={conversations}>
        <div className="p-6 flex items-baseline justify-between">
          <h2 className="text-2xl px-4">Conversations</h2>
          <a className="cursor-pointer">
            <PlusIcon stroke={3.5} className="size-4" />
          </a>
        </div>
      </Users>
      {isLoading && (
        <div className="absolute top-[50%] left-[58%] bg-slate-800 text-white px-3 py-1 rounded z-50 flex items-center">
          <div className="size-5 border-4 border-blue-500 border-t-transparent rounded-full animate-spin "></div>

          {/* <p>Loading messages...</p> */}
        </div>
      )}

      {conversationId && conversations.length ? (
        <div
          className="p-10 max-h-[75vh] w-[75%] overflow-x-hidden right-[0] absolute top-[75px] scrollbar-thin"
          ref={messageWrapper}
        >
          <div className="h-4/5 pr-[8%] pl-[2%] overflow-auto scrollbar-thin max-h-[80%]">
            {
              //!isLoading &&
              <>
                <LoadPreviousMessages
                  messages={messages}
                  totalCount={totalCount}
                  onLoadPreviousMsgs={onLoadPreviousMsgs}
                  disableLoadPreviosMsg={disableLoadPreviosMsg}
                />
                <div className="w-[100%] text-center">
                  <p className="text-center">
                    {conversationId &&
                      messages.length <= 0 &&
                      "Send your first message"}
                  </p>
                </div>

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
                        Number(id) === message.ownerId
                          ? "text-right my-6"
                          : "my-6"
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
              </>
            }
          </div>

          {conversationId && (
            <div className="fixed bottom-4 w-[50%] flex mt-[40px]">
              <div
                className={`w-[100%] bg-red-50 rounded-3xl max-h-32 border-2 py-1 h-[60px] flex items-end justify-around ${
                  isEditingMsg && "animate-blink-border"
                }`}
                ref={textareaWrapperRef}
              >
                <div className="ml-[18px] min-h-[38px]">
                  <FileInput
                    onFileChange={handleFileChange}
                    id="file-change-message"
                    icon={<LinkIcon stroke={2} className="size-6" />}
                  />
                </div>

                <textarea
                  placeholder="Message..."
                  onKeyDown={handleKeyDown}
                  value={currentMsg}
                  onChange={handleChangeInput}
                  className={`w-[80%] py-4 pl-2 pr-[10%] h-[54px] max-h-32 outline-none overflow-auto scrollbar-none resize-none bg-transparent
                  }`}
                  ref={textareaRef}
                  rows={1}
                ></textarea>
                {isEditingMsg && (
                  <>
                    <small className="absolute left-[52px] top-0 underline text-red-500 bg-red-50 border-t-2">
                      Editing Message
                    </small>
                    <a
                      className="rounded-2xl cursor-pointer text-red-600 whitespace-nowrap mr-[5px] mb-[12px]"
                      onClick={handleCancelEdit}
                    >
                      Cancel editing
                    </a>
                  </>
                )}
                <button
                  disabled={!currentMsg || !currentMsg.trim()}
                  className="rounded-2xl"
                  onClick={onSubmit}
                >
                  <SendIcon />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className=" max-h-screen w-[75%] inline-block text-center">
          {!isLoading && (
            <p className="text-center">
              {!conversationId ? "Please select a conversation" : "No messages"}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
