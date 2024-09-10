import { useDispatch, useSelector } from "react-redux";
import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";

import Users from "../../components/Users/Users";
import useDebounce from "../../hooks/useDebounce";
import Spinner from "../../components/UI/Spinner/Spinner";
import httpService from "../../services/http/http.service";
import PopupMenu from "../../components/UI/PopupMenu/PopupMenu";
import messageService from "../../services/http/message.service";
import FileInput from "../../components/UI/FileChange/FileChange";
import MessageHeader from "../../components/Message/MessageHeader";
import FileShareInMessage from "../../components/Message/FileShare";
import snackbarService from "../../store/ui/snackbar/snackbar-actions";
import RenderMessageTime from "../../components/Message/RenderMessageTime";
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
  CrossIcon,
} from "../../components/UI/Icons/Icons";
import { RootState } from "../../store";
import { ILastMessage, IMessage } from "../../models/message.model";
import { useNavigate, useParams } from "react-router-dom";
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
  getUpdatedConversations,
} from "../../store/message/message-actions";
import { IUser } from "../../models/user.model";
import { getCurrentUTCDate } from "../../util/dates";
import { getUserEmail, getUserId } from "../../util/auth";
import { fetchUsers } from "../../store/user/user-actions";
import { messageBaseUrl } from "../../constants/api.constants";
import { maxFileSizeInMB } from "../../constants/files.constants";
import { messageActions } from "../../store/message/message-slice";
import { commonUIActions } from "../../store/ui/common/common-reducer";
import VoiceRecorder from "../../components/Message/VoiceRecorder";

let counterForScroll = 0;
let prevKey = "";

export function Messages() {
  // Local properties
  const navigate = useNavigate();
  const [currentMsg, setCurrentMsg] = useState<string>("");
  const [loadingPreviousMsgs, setLoadingPreviousMsgs] =
    useState<boolean>(false);
  const [isEditingMsg, setIsEditingMsg] = useState<boolean>(false);
  const [_, setCurrentEditMsg] = useState<IMessage | null>();
  const [files, setFiles] = useState<FileList | null>(null);
  const [searchUsers, setSearchUsers] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const messageWrapper = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const textareaWrapperRef = useRef<HTMLDivElement>(null);

  const { conversationId } = useParams();
  const loggedInUserId = getUserId();

  // const [conversations, setConversations] = useState<IUser[]>(useLoaderData() as IUser[]);
  const conversations = useSelector((state: RootState) => state.message.conversations);
  const debouncedFetchUsers = useDebounce((query: string) => dispatch(fetchUsers(query)), 500);
  // Redux properties
  const dispatch = useDispatch();
  const messages: IMessage[] = useSelector(
    (state: RootState) => state.message.messages
  );
  const page = useSelector((state: RootState) => state.message.page);

  const totalCount = useSelector(
    (state: RootState) => state.message.totalCount
  );
  const disableLoadPreviosMsg = useSelector(
    (state: RootState) => state.message.disableLoadPreviosMsg
  );
  const conversationsMenuOpen = useSelector((state: RootState) => state.message.conversationsMenuOpen)

  let users = useSelector(
    (state: RootState) => state.user.users
  );

  users = users.filter((user: IUser) => +user.id !== Number(loggedInUserId) && !conversations.find(cnvs => Number(cnvs.receiverId) === +user.id)), [users.length, searchQuery];

  const isLoading = useSelector((state: RootState) => state.message.isLoading);
  const isSendingMsg = useSelector((state: RootState) => state.message.isSendingMsg);

  useEffect(() => {
    // Initialize socket.io::
    socketInit();
    onPrivateMsg(dispatch, messageWrapper);
    onEditPrivateMessage(dispatch);
    onDeletePrivateMessage(dispatch);

    // onDisconnect();
    if (conversationId) {
      dispatch(messageActions.setConversationsMenuOpen(false));
    }
    return () => {
      // disconnect();
      offPrivateMsg();
      offEditPrivateMsg();
      offDeletePrivateMsg();
      offLastMessageInConversation();
      dispatch(messageActions.setConversationsMenuOpen(true));
    };
  }, []);

  useEffect(() => {
    onLastMessageInConversation(conversations, dispatch);
  }, [conversations.length]);

  useEffect(() => {
    dispatch(fetchConversations(Number(loggedInUserId)));
  }, [dispatch, loggedInUserId]);

  useEffect(() => {
    if (textareaRef.current) textareaRef.current.focus();
  }, [textareaRef.current]);

  useEffect(() => {
    if (conversationId) {
      counterForScroll = 0;
      dispatch(fetchMessages(String(conversationId)));
      emitRoom(String(conversationId));
    }

    dispatch(
      messageActions.setConversationId({
        conversationId: conversationId,
      })
    );

    setConversationId(String(conversationId));

    dispatch(
      messageActions.setReceiverUser({
        conversations: conversations,
      })
    );
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

  const scrolltoBottom = (increaseCounter: boolean): void => {
    if (messageWrapper.current && !loadingPreviousMsgs) {
      const maxScroll = messageWrapper.current.scrollHeight;
      messageWrapper.current.scrollTo({
        top: maxScroll,
        behavior: counterForScroll === 0 ? "instant" : "smooth",
      });
      if (counterForScroll === 0 && increaseCounter) {
        counterForScroll++;
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

  const onEditPrivateMsg = (messageBody: string, messageId: number): void => {
    setIsEditingMsg(true);
    const currentMsg = messages.find((msg) => msg.id === messageId);
    if (currentMsg) {
      const currentMessage: IMessage = JSON.parse(JSON.stringify(currentMsg));
      currentMessage.body = messageBody;
      setCurrentEditMsg(() => currentMessage);
      setCurrentMsg(currentMessage.body);
      handleInput();
    } else {
      // show notification::optional
    }
  };


  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ): void => {
    if (prevKey !== "Shift" && event.key === "Enter") {
      event.preventDefault();
      onSubmit();
    }
  };

  const onSubmit = useCallback((): void => {
    if (!currentMsg.trim() || !conversationId?.trim()) {
      return;
    }
    dispatch(messageActions.setSendingMsg(true));
    setLoadingPreviousMsgs(false);
    if (isEditingMsg) {
      setCurrentEditMsg((prevMsg): IMessage => {
        const newMsg = {
          ...prevMsg,
          body: currentMsg,
        };
        emitEditPrivateMsg(
          newMsg as IMessage,
          Number(loggedInUserId),
          String(conversationId)
        );
        const newMsgIdx = messages.findIndex(msg => +msg.id === Number(newMsg.id));
        if (newMsgIdx === messages.length - 1) {
          const payload: ILastMessage = {
            conversationId: String(conversationId),
            lastMessageBy: Number(newMsg.ownerId),
            lastMessage: newMsg.body,
            lastMessageType: String(newMsg.messageType),
            lastMessageCreatedAt: new Date(String(newMsg.createdAt))
          }
          emitLastMessageInConversation(payload);
        }
        return newMsg as IMessage;
      });

      handleCancelEdit();
    } else {
      emitPrivateMsg(
        currentMsg.trim(),
        Number(loggedInUserId),
        String(conversationId),
        "text"
      );

      dispatch(messageActions.setTotalCount({ totalCount: totalCount + 1 }))
    }
    setCurrentMsg("");
    handleInput();
    // setMessageId(0);
  }, [currentMsg, conversationId, loggedInUserId]);

  const handleInput = (): void => {
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

  const handleChangeInput = (event: ChangeEvent<HTMLTextAreaElement>): void => {
    setCurrentMsg(event.target.value);
    handleInput();
  };

  const handleFileChange = (files: FileList | null): void => {
    if (files) {
      setFiles(files);
      for (const file of files) {
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
        if (file) {
          fileReader.readAsDataURL(file);
        }
      }
      dispatch(commonUIActions.setModelIsOpen(true));
    }
  };

  const handleFileSharing = async (): Promise<void> => {
    dispatch(commonUIActions.setModelIsOpen(false));
    // handle file sharing, create api on backend to handle files
    if (files) {
      dispatch(messageActions.setSendingMsg(true));
      for await (const file of files) {
        try {
          const fileName = file.name;
          const lastDotIndex = fileName.lastIndexOf(".");
          const extenstion = fileName.substring(lastDotIndex);
          const formData = new FormData();
          formData.append("file", file);
          formData.append("messageType", extenstion);
          formData.append("ownerId", String(loggedInUserId));
          formData.append("conversationId", String(conversationId));
          await messageService.sendMessageWithFiles(formData);
          scrolltoBottom(true);
        } catch (error) {
          // Need to handle api error or failure;
          dispatch(messageActions.setSendingMsg(false));
          console.log(error);
        }
      }
      dispatch(messageActions.setSendingMsg(false));
    }
    handleClearFileData();
  };

  const handleClearFileData = (): void => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setFiles(null);
    dispatch(messageActions.clearFilesBase64([]));
    dispatch(commonUIActions.setModelIsOpen(false));
  };

  const handleDownLoadFile = <T extends unknown>(_: string, message: T): void => {
    const fileUrl = (message as IMessage).body;
    downloadFile(fileUrl as string, fileUrl as string);
  }

  const handleDeleteMsg = (messageId: number): void => {
    // ask for confirmation
    emitDeletePrivateMsg(messageId, String(conversationId));
    dispatch(messageActions.setSendingMsg(true));
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
        lastMessageBy: Number(loggedInUserId),
        lastMessageType: String("text"),
        lastMessageCreatedAt: getCurrentUTCDate() // sending UTC ( Universal time )
      }
      emitLastMessageInConversation(payload);
    }
    if (messages.length < 20 && totalCount <= messages.length) {
      onLoadPreviousMsgs();
    }
    dispatch(messageActions.setTotalCount({ totalCount: totalCount - 1 }));
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

  const toggleSearchUsers = async (): Promise<void> => {
    setSearchUsers((prev) => {
      if (!prev) {
        dispatch(fetchUsers(searchQuery));
        setSearchQuery("");
      }
      return !prev;
    });
  }

  const startCoversation = async <T extends unknown>(receiverId: T): Promise<void> => {
    try {
      const senderId = Number(loggedInUserId);
      const payload = {
        title: 'Sender=' + senderId + ': receiver=' + receiverId,
        startedBy: Number(senderId),
        recievedBy: receiverId
      }
      const response = await httpService.post(`${messageBaseUrl}/start`, payload);
      const conversations = response.data.conversations;
      const cnvsId = conversations[conversations.length - 1].conversationId
      const localUserEmail = String(getUserEmail())
      const updatedConversations = getUpdatedConversations(conversations, localUserEmail);
      dispatch(
        messageActions.setConversations({
          conversations: updatedConversations,
          totalCount: 0,
        })
      );
      dispatch(
        messageActions.setReceiverUser({
          conversations: updatedConversations,
        })
      );
      navigate(`/messages/${cnvsId}`);
      setSearchUsers(false);
      snackbarService.success('User added!');
    } catch (error) {
      console.log(error);
      // Inform user about the error
    }
  }

  const fetchUsersWithQuery = (event: ChangeEvent<HTMLInputElement>): void => {
    setSearchQuery(event.target.value);
    debouncedFetchUsers(event.target.value);
  }

  const onClearSearchQuery = (): void => {
    setSearchQuery("");
    debouncedFetchUsers("");
  }

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

  const messageClasses = `text-cyan-50 px-3 py-1 rounded-xl inline-block max-w-[50%] text-left overflow-hidden`;

  return (
    <section className="relative lg:max-w-[80%]">

      <FileShareInMessage
        handleCancelFileSharing={handleClearFileData}
        handleFileSharing={handleFileSharing}
      />
      <MessageHeader />
      <div>
        <Users conversationsMenuOpen={conversationsMenuOpen} isConversation={searchUsers ? false : true} users={searchUsers ? users : conversations} onClickFn={searchUsers ? startCoversation : navigateToConversation}>
          <div className={`px-6 py-3 mb-1 flex justify-between !w-[100%] sticky top-0 bg-stone-200 z-50 shadow-sm ${searchUsers ? "items-center" : "items-baseline"}`}>
            <h2 className="text-2xl px-4">Conversations</h2>
            <a className="cursor-pointer z-50" onClick={toggleSearchUsers}>
              {
                searchUsers ? <span className="font-normal">Cancel</span>
                  : <PlusIcon stroke={3.5} className="size-4" />
              }
            </a>
          </div>
          <div className="text-center">
            {
              searchUsers &&
              <div className="relative">
                <input type="text" value={searchQuery} onChange={fetchUsersWithQuery} className="w-[90%] rounded-xl outline-none pl-4 pr-8 h-6 font-normal text-sm" placeholder="Search..." />
                {
                  searchQuery &&
                  <a className="absolute right-5 top-[5px]" onClick={onClearSearchQuery}>
                    <CrossIcon className="size-4" stroke="1.5" />
                  </a>
                }
              </div>
            }
          </div>
        </Users>
      </div>


      {isLoading && (
        <div className="absolute top-[50%] left-[58%] bg-slate-800 text-white px-3 py-1 rounded z-50 flex items-center">
          <Spinner />

          {/* <p>Loading messages...</p> */}
        </div>
      )}
      {conversationId && conversations.length ? (
        <div
          className="p-4 pb-28 max-h-[70vh] min-h-[70vh] w-[100%] overflow-x-hidden right-[0] absolute top-[75px] scrollbar-thin lg:p-10 sm:w-[60%] md:pb-24 lg:w-[75%]"
          ref={messageWrapper}
        >
          <div className="h-4/5 lg:pr-[8%] pl-[2%] scrollbar-thin max-h-[80%]">
            {
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
                        Number(loggedInUserId) === message.ownerId
                          ? "text-right my-6"
                          : "my-6"
                      }
                    >
                      <span
                        className={
                          Number(loggedInUserId) === message.ownerId
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
                              showDownloadLink={Number(message.ownerId) !== Number(loggedInUserId)}
                            />
                            <RenderMessageTime createdAt={message.createdAt} classes="mt-0 text-[#616060]" />
                          </>

                        )}
                      </span>
                      {Number(loggedInUserId) === message.ownerId && (
                        <a className="ml-2">
                          <PopupMenu payload={{ items: message.messageType === "text" ? menuItemsForText : menuItemsForFiles, data: message }} closeOnClick={false} >
                            {/* <div>Menu Item</div> */}
                          </PopupMenu>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </>
            }

          </div>
          {isSendingMsg && (
            <div className="w-[50%] flex justify-end">
              <Spinner />
            </div>
          )}
          {conversationId && (
            <div className="fixed bottom-4 w-[92%] sm:w-[50%] flex mt-[40px]">
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
                  // disabled={!currentMsg || !currentMsg.trim()}
                  className="rounded-2xl mb-[2.5px] mr-2"
                  onClick={onSubmit}
                >
                  {!currentMsg || !currentMsg.trim() ? <VoiceRecorder /> : <SendIcon />}
                </button>
              </div>

            </div>
          )}
        </div>
      ) : (
        <div className="max-h-screen inline-block text-center">
          {!isLoading && (
            <div className="text-center absolute top-[20%] right-0 w-[80%]">
              {!conversationId ? "Please select a conversation" : "No messages"}
            </div>
          )}

        </div>
      )}

    </section>
  );
}

export async function loader(): Promise<IUser[] | []> {
  const loggedInUserId = getUserId();

  const response = await httpService.get(`${messageBaseUrl}/conversations`, {
    senderId: Number(loggedInUserId),
  });

  if (response && response.data && response.data.conversations) {
    const conversations = response.data.conversations;
    const localUserEmail = getUserEmail();
    const updatedConversations = getUpdatedConversations(conversations, String(localUserEmail))
    return updatedConversations;
  } else {
    return [];
  };
}