import { useDispatch, useSelector } from "react-redux";
import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";

import Users from "../../components/Users/Users";
import Spinner from "../../components/UI/Spinner/Spinner";
import PopupMenu from "../../components/UI/PopupMenu/PopupMenu";
import messageService from "../../services/http/message.service";
import FileInput from "../../components/UI/FileChange/FileChange";
import MessageHeader from "../../components/Message/MessageHeader";
import FileShareInMessage from "../../components/Message/FileShare";
import RenderMessageDate from "../../components/Message/RenderMessageDate";
import LoadPreviousMessages from "../../components/Message/LoadPreviousMessages";
import RenderMessageContent from "../../components/Message/RenderMessageContent";
import PreviewFile, { downloadFile } from "../../components/Message/PreviewFile";
import {
  EditIcon,
  LinkIcon,
  PlusIcon,
  SendIcon,
  DeleteIcon,
  DownloadIcon,
} from "../../components/UI/Icons/Icons";
import { IUser } from "../../models/user.model";
import { ILastMessage, IMessage } from "../../models/message.model";
import { useLoaderData, useNavigate, useParams } from "react-router-dom";
import {
  emitDeletePrivateMsg,
  emitEditPrivateMsg,
  emitLastMessageInConversation,
  emitPrivateMsg,
  emitRoom,
  offDeletePrivateMsg,
  offEditPrivateMsg,
  offLastMessageInConversation,
  offPrivateMsg,
  onDeletePrivateMessage,
  onDisconnect,
  onEditPrivateMessage,
  onLastMessageInConversation,
  onPrivateMsg,
  setConversationId,
  socketInit,
} from "../../services/socket/chat-socket";
import { IMenuItem } from "../../models/ui.model";
import {
  fetchConversations,
  fetchMessages,
  fetchPreviousMessages,
} from "../../store/message/message-actions";
import { RootState } from "../../store";
import { messageActions } from "../../store/message/message-slice";
import { maxFileSizeInMB } from "../../constants/files.constants";
import snackbarService from "../../store/ui/snackbar/snackbar-actions";
import RenderMessageTime from "../../components/Message/RenderMessageTime";

let counter = 0;

export function Messages() {
  // Local properties
  const [currentMsg, setCurrentMsg] = useState<string>("");
  const [loadingPreviousMsgs, setLoadingPreviousMsgs] =
    useState<boolean>(false);
  const [isEditingMsg, setIsEditingMsg] = useState<boolean>(false);
  const navigate = useNavigate();
  const [_, setCurrentEditMsg] = useState<IMessage | null>();
  const [files, setFiles] = useState<FileList | null>(null);
  const [isSendingFiles, setIsSendingFiles] = useState(false);

  const messageWrapper = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
  // Files sharing in message: Properties

  useEffect(() => {
    // Initialize socket.io::
    socketInit();
    onPrivateMsg(dispatch, messageWrapper);
    onEditPrivateMessage(dispatch);
    onDeletePrivateMessage(dispatch);
    onLastMessageInConversation(dispatch);
    onDisconnect();

    return () => {
      offPrivateMsg();
      offEditPrivateMsg();
      offDeletePrivateMsg();
      offLastMessageInConversation();
    };
  }, []);

  useEffect(() => {
    dispatch(fetchConversations(Number(id)));
  }, [dispatch, id]);

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
      emitRoom(String(conversationId));
      setConversationId(String(conversationId));
    }
    dispatch(messageActions.setPage({ page: 1 }));
    setLoadingPreviousMsgs(false);
    handleCancelEdit();
    setCurrentMsg("");
    handleClearFileData();
    scrolltoBottom(false);
  }, [dispatch, conversationId]);

  useEffect(() => {
    if (page > 1) {
      dispatch(fetchPreviousMessages(String(conversationId), page));
    }
  }, [page]);

  useEffect(() => {
    scrolltoBottom(true);
  }, [messages.length]);

  const scrolltoBottom = (increaseCounter: boolean) => {
    if (messageWrapper.current && !loadingPreviousMsgs) {
      const maxScroll = messageWrapper.current.scrollHeight;
      messageWrapper.current.scrollTo({
        top: maxScroll,
        behavior: counter === 0 ? "instant" : "smooth",
      });
      if (counter === 0 && increaseCounter) {
        counter++;
      }
    }
  }

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
      emitPrivateMsg(
        currentMsg.trim(),
        Number(id),
        String(conversationId),
        "text"
      );
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

  const navigateToConversation = <T extends unknown>(cnvsId: T): void => {
    if (conversationId === cnvsId) {
      return;
    } else {
      navigate(`/messages/${cnvsId}`);
    }
  };

  const handleInput = () => {
    setTimeout(() => {
      if (textareaRef.current && textareaWrapperRef.current) {
        if (textareaRef.current.scrollHeight > 50) {
          textareaRef.current.style.height = "auto"; // Reset height
          textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`; // Set new height
          if (+textareaRef.current.style.height.slice(0, -2) === 56) {
            textareaRef.current.style.height = `${50}px`; // Set new height
          }
        }
      }
    });
  };

  const handleChangeInput = (event: ChangeEvent<HTMLTextAreaElement>): void => {
    setCurrentMsg(event.target.value);
    handleInput();
  };

  const handleFileChange = (files: FileList | null): void => {
    if (files) {
      setFiles(files);
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileSizeInMB = file.size / (1024 * 1024);

        if (fileSizeInMB >= maxFileSizeInMB) {
          // Display an error message or handle the oversized file as per your requirement
          snackbarService.error(`Maximum Image size can be ${maxFileSizeInMB} MB`);
          console.error(`Maximum Image size can be ${maxFileSizeInMB} MB`);
          if (files.length === 1) {
            handleClearFileData();
            return;
          }
          continue;
        }
        const fileReader = new FileReader();
        fileReader.onloadend = () => {
          const fileName = file.name;
          const lastDotIndex = fileName.lastIndexOf(".");
          const extenstion = fileName.substring(lastDotIndex);
          const fileBase64Data = {
            name: file.name,
            url: fileReader.result as string,
            size: file.size,
            extenstion,
          };
          dispatch(messageActions.setFilesBase64(fileBase64Data));
        };
        if (files[i]) {
          fileReader.readAsDataURL(files[i]);
        }
      }
      dispatch(messageActions.setModelIsOpen(true));
    }
  };

  const handleFileSharing = async () => {
    dispatch(messageActions.setModelIsOpen(false));
    // handle file sharing, create api on backend to handle files
    if (files) {
      setIsSendingFiles(true);
      for await (const file of files) {
        try {
          const formData = new FormData();
          const fileName = file.name;
          const lastDotIndex = fileName.lastIndexOf(".");
          const extenstion = fileName.substring(lastDotIndex);
          formData.append("file", file);
          formData.append("ownerId", String(id));
          formData.append("conversationId", String(conversationId));
          formData.append("messageType", extenstion);
          await messageService.sendMessageWithFiles(formData);
          scrolltoBottom(true);
        } catch (error) {
          // Need to handle api error or failure;
          setIsSendingFiles(false);
          console.log(error);
        }

      }
      setIsSendingFiles(false);
    }

    handleClearFileData();
  };

  const handleClearFileData = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    dispatch(messageActions.clearFilesBase64([]));
    setFiles(null);
    dispatch(messageActions.setModelIsOpen(false));
  };

  const handleDownLoadFile = <T extends unknown>(_: string, message: T) => {
    const fileUrl = (message as IMessage).body;
    downloadFile(fileUrl as string, fileUrl as string);
  }

  const handleDeleteMsg = (messageId: number): void => {
    // ask for confirmation
    emitDeletePrivateMsg(messageId, String(conversationId));
    const lastMessage = messages[messages.length - 2];
    if (lastMessage) {
      const payload: ILastMessage = {
        conversationId: String(conversationId),
        lastMessage: String(lastMessage.body),
        lastMessageBy: Number(lastMessage.ownerId),
        lastMessageType: String(lastMessage.messageType),
        lastMessageCreatedAt: new Date(lastMessage.createdAt)
      }
      emitLastMessageInConversation(payload);
    }
    else {
      const payload: ILastMessage = {
        conversationId: String(conversationId),
        lastMessage: String(""),
        lastMessageBy: Number(id),
        lastMessageType: String("text"),
        lastMessageCreatedAt: new Date()
      }
      emitLastMessageInConversation(payload);
    }

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

  const menuItemsForText: IMenuItem[] = [
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

  const menuItemsForFiles: IMenuItem[] = [
    {
      label: "Download",
      onClick: handleDownLoadFile,
      icon: <DownloadIcon />,
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
      <FileShareInMessage
        handleCancelFileSharing={handleClearFileData}
        handleFileSharing={handleFileSharing}
      />
      <MessageHeader user={receiverUser as unknown as IUser} />

      <Users users={conversations} onClickFn={navigateToConversation}>
        <div className="p-6 flex items-baseline justify-between">
          <h2 className="text-2xl px-4">Conversations</h2>
          <a className="cursor-pointer">
            <PlusIcon stroke={3.5} className="size-4" />
          </a>
        </div>
      </Users>

      {isLoading && (
        <div className="absolute top-[50%] left-[58%] bg-slate-800 text-white px-3 py-1 rounded z-50 flex items-center">
          <Spinner />

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
                            ? `${messageClasses} ${message.messageType === "text" ? "bg-gray-700" : "!text-black"}`
                            : `${messageClasses} ${message.messageType === "text" ? "bg-slate-500" : "!text-black"}`
                        }
                      >
                        {/* Used this component to show "Show more" button if message is too long */}
                        {message.messageType === "text" ? (
                          <RenderMessageContent
                            key={`content-${message.id}`}
                            content={message.body}
                            index={index}
                            message={message}
                          />
                        ) : (
                          // Render files
                          <>
                            <PreviewFile
                              classes="border border-solid p-2 scrollbar-none size-[12rem]"
                              fileUrl={message.body}
                              fileExtenstion={message.messageType}
                              showDownloadLink={Number(message.ownerId) !== Number(id)}
                            />
                            <RenderMessageTime createdAt={message.createdAt} classes="mt-0 text-[#616060]" />
                          </>

                        )}
                      </span>
                      {Number(id) === message.ownerId && (
                        <a className="ml-2">
                          <PopupMenu items={message.messageType === "text" ? menuItemsForText : menuItemsForFiles} data={message} />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </>
            }

          </div>
          {isSendingFiles && (
            <div className="w-[50%] flex justify-end">
              <Spinner />
            </div>
          )}
          {conversationId && (
            <div className="fixed bottom-4 w-[50%] flex mt-[40px]">
              <div
                className={`w-[100%] bg-red-50 rounded-3xl max-h-52 border-2 py-1 flex items-end justify-around ${isEditingMsg && "animate-blink-border"
                  }`}
                ref={textareaWrapperRef}
              >
                <div className="ml-[18px] min-h-[38px]">
                  <FileInput
                    onFileChange={handleFileChange}
                    id="file-change-message"
                    icon={<LinkIcon stroke={2} className="size-6" />}
                    multiple={true}
                    ref={fileInputRef}
                  />
                </div>

                <textarea
                  placeholder="Message..."
                  onKeyDown={handleKeyDown}
                  value={currentMsg}
                  onChange={handleChangeInput}
                  className={`w-[80%] py-3 pl-2 mr-[10%] h-[50px] max-h-32 outline-none overflow-auto scrollbar-none resize-none bg-transparent
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
                      className="rounded-2xl cursor-pointer text-red-600 whitespace-nowrap mr-[6px] mb-[15px]"
                      onClick={handleCancelEdit}
                    >
                      Cancel editing
                    </a>
                  </>
                )}
                <button
                  disabled={!currentMsg || !currentMsg.trim()}
                  className="rounded-2xl mb-[2.5px] mr-2"
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
