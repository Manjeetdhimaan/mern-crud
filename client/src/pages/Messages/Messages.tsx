import { useCallback, useEffect, useRef, useState } from "react";

import http from "../../util/http";
import Users from "../../components/Users/Users";
import MessageHeader from "../../components/Message/MessageHeader";
import RenderMessageDate from "../../components/Message/RenderMessageDate";
import RenderMessageContent from "../../components/Message/RenderMessageContent";
import { getUserEmail } from "../../util/auth";
import { IUser } from "../../models/user.model";
import { IMessage } from "../../models/message.model";
import { useLoaderData, useParams } from "react-router-dom";
import { Conversation } from "../../models/conversation.model";
import { emitPrivateMsg, emitRoom, offPrivateMsg, onPrivateMsg, socketInit } from "../../sockets/chat-socket";

const messageBaseUrl = '/messages';

export function Messages() {
    const [page, setPage] = useState<number>(1);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [messages, setMessages] = useState<IMessage[]>([]);
    const [currentMsg, setCurrentMsg] = useState<string>('');
    const [conversations, setConversations] = useState<IUser[]>([]);
    const [recieverUser, setRecieverUser] = useState<IUser | null>();
    const [loadingPreviousMsgs, setLoadingPreviousMsgs] = useState<boolean>(false);
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

        return () => {
            offPrivateMsg();
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
    }, [conversationId]);

    useEffect(() => {
        if (page > 1) {
            fetchPreviousMessages();
        }
    }, [page]);

    useEffect(() => {
        if (messageWrapper.current && !loadingPreviousMsgs) {
            const maxScroll = messageWrapper.current.scrollHeight;
            messageWrapper.current.scrollTo({ top: maxScroll, behavior: 'auto' });
        }
    }, [messages.length]);

    const fetchConversations = async (senderId: number) => {
        try {
            const response = await http.get(`${messageBaseUrl}/conversations?senderId=${senderId}`);
            if (response && response.data && response.data.conversations) {
                const conversations = response.data.conversations;
                const localUserEmail = getUserEmail();
                const updatedConversations: IUser[] = conversations.map((conversation: Conversation) => {
                    const isSameUser = localUserEmail === conversation.startedByEmail;
                    return {
                        id: conversation.conversationId,
                        fullName: isSameUser ? conversation.receivedByName : conversation.startedByName,
                        email: isSameUser ? conversation.receivedByEmail : conversation.startedByEmail,
                        recieverId: isSameUser ? conversation.receivedById : conversation.startedById
                    }
                });
                onEmitRoomAndFetchMsgs();
                setConversations(() => updatedConversations);
                setTotalCount(0);
                onSetRecieverUser(updatedConversations);
                return updatedConversations;
            }
        } catch (error) {
            console.log(error);
        }
    }

    const fetchMessages = async () => {
        const response = await http.get(`${messageBaseUrl}/get-messages?conversationId=${conversationId}&page=${1}`);

        if (response && response.data && response.data.messages) {
            setTotalCount(+response.data.totalCount);
            setMessages(() => [...response.data.messages]);
        }
        else {
            setMessages(() => []);
        }
    }

    const fetchPreviousMessages = async () => {
        const response = await http.get(`${messageBaseUrl}/get-messages?conversationId=${conversationId}&page=${page}`);
        if (response && response.data && response.data.messages) {
            response.data.messages.forEach((message: IMessage, i: number) => {
                // add messages to with settimeout to show scroll animation
                setTimeout(() => {
                    setMessages((prevMsgs) => {
                        return [
                            message,
                            ...prevMsgs
                        ]
                    });
                }, 30 * i);
            })

        }
        else {
            setMessages(() => []);
        }
    }

    // const onLoadPreviousMsgs = () => {
    //     setPage((prevPage) => prevPage + 1);
    //     setLoadingPreviousMsgs(true);
    // }

    const onLoadPreviousMsgs = useCallback(() => {
        setPage((prevPage) => prevPage + 1);
        setLoadingPreviousMsgs(true);
    }, []);

    // const onEmitRoomAndFetchMsgs = async () => {
    //     if (conversationId) {
    //         emitRoom(conversationId);
    //         await fetchMessages();
    //     }
    // }

    const onEmitRoomAndFetchMsgs = useCallback(async () => {
        if (conversationId) {
            emitRoom(conversationId);
            await fetchMessages();
        }
    }, [conversationId, fetchMessages]);

    const onSetRecieverUser = (conversations: IUser[]) => {
        const currentRecieverUser = conversations.find(conversation => conversation.id === conversationId);
        console.log("currentRecieverUser", currentRecieverUser)
        if (currentRecieverUser) {
            setRecieverUser(() => {
                return { ...currentRecieverUser }
            });
        }
        else {
            setRecieverUser(() => {
                return null
            })
        }
    }

    

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            onSubmit();
        }
    };

    // const onSubmit = () => {
    //     if (!currentMsg || !currentMsg.trim() || !conversationId || !conversationId?.trim()) {
    //         return;
    //     }
    //     setLoadingPreviousMsgs(false);
    //     emitPrivateMsg(currentMsg.trim(), Number(id), String(conversationId))
    //     setCurrentMsg('');
    // }

    const onSubmit = useCallback(() => {
        if (!currentMsg.trim() || !conversationId?.trim()) {
            return;
        }
        setLoadingPreviousMsgs(false);
        emitPrivateMsg(currentMsg.trim(), Number(id), String(conversationId));
        setCurrentMsg('');
    }, [currentMsg, conversationId, id]);

    return (
        <section>
            <MessageHeader user={recieverUser as IUser} />
            <Users users={conversations} isCoversation={true} />
            {
                conversationId && conversations.length && messages.length > 0 ?
                    <div className="p-10 shadow-lg h-screen w-[80%] float-right">
                        <div className="shadow-lg h-4/5 w-2/3 p-6 overflow-auto scrollbar-thin" ref={messageWrapper}>
                            {
                                messages.length > 0 &&
                                <>
                                    {totalCount > messages.length ? <p className="text-center cursor-pointer" onClick={onLoadPreviousMsgs}><a >Load previous messages</a></p> : <p className="text-center">Conversation started on {(new Date(messages[0].createdAt).getDate()) + '-' + (new Date(messages[0].createdAt).getMonth() + 1) + '-' + (new Date(messages[0].createdAt).getFullYear())}</p>}
                                </>
                            }

                            {/* Render messages */}
                            {messages.map((message, index) => (
                                <>
                                    {/* Show particular date for messages */}

                                    <RenderMessageDate key={`date-${message.id}`} index={index} message={message} messages={messages} />

                                    <div key={message.id} className={Number(id) === message.ownerId ? "text-right my-6" : "my-6"}>
                                        <span className={Number(id) === message.ownerId ? "bg-gray-700 text-cyan-50 px-3 py-1 rounded-xl inline-block max-w-[50%] text-left" : "bg-slate-500 text-cyan-50 px-3 py-1 rounded-xl inline-block max-w-[50%] text-left"}>
                                            {/* Used this component to show "Show more" button if message is too long */}
                                            <RenderMessageContent key={`content-${message.id}`} content={message.body} index={index} messages={messages} />
                                        </span>
                                    </div>
                                </>
                            ))}
                        </div>

                        {conversationId &&
                            <div className="w-2/3 py-6 h-6 relative">
                                <textarea onKeyDown={handleKeyDown} value={currentMsg} onChange={(e) => setCurrentMsg(e.target.value)} className="bg-red-50 w-[100%] py-4 px-8 pr-[20%] outline-none rounded-3xl resize-none scrollbar-none" rows={1}></textarea>
                                <button disabled={!currentMsg || !currentMsg.trim()} className="absolute right-2 top-[30px] rounded-2xl" onClick={onSubmit}>Send</button>
                            </div>
                        }

                    </div> :
                    <div className="shadow-lg h-screen w-[60%] inline-block text-center">
                        <p className="text-center">{!conversationId ? 'Please select a conversation' : 'No messages'}</p>
                    </div>
            }

        </section>
    )
}