import { useEffect, useRef, useState } from "react";

import http from "../../util/http";
import Users from "../../components/Users/Users";
import MessageHeader from "../../components/Message/MessageHeader";
import RenderMessageContent from "../../components/Message/RenderMessageContent";
import { IUser } from "../../models/user.model";
import { IMessage } from "../../models/message.model";
import { useLoaderData, useParams } from "react-router-dom";
import { Conversation } from "../../models/conversation.model";
import { emitPrivateMsg, emitRoom, offPrivateMsg, onPrivateMsg, socketInit } from "../../sockets/chat-socket";
import { getUserEmail } from "../../util/auth";

const messageBaseUrl = '/messages';

export function Messages() {
    const [conversations, setConversations] = useState<IUser[]>([]);
    const [messages, setMessages] = useState<IMessage[]>([]);
    const [currentMsg, setCurrentMsg] = useState<string>('');
    const [page, setPage] = useState<number>(1);
    const [totalCount, setTotalCount] = useState<number>(0);
    const messageWrapper = useRef<HTMLDivElement>(null);

    const id = useLoaderData();
    const { conversationId } = useParams();

    useEffect(() => {
        onEmitAndFetchMsg();
        setPage(1);
    }, [conversationId]);

    useEffect(() => {
        if (id) {
            fetchCoversations(+id);
        }
        socketInit();

        onPrivateMsg(setMessages);

        return () => {
            offPrivateMsg();
        };
    }, []);


    useEffect(() => {
        fetchPreviousMessages();
    }, [page]);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            onSubmit();
        }
    };

    const onSubmit = () => {
        if (!currentMsg || !currentMsg.trim() || !conversationId || !conversationId?.trim()) {
            return;
        }
        emitPrivateMsg(currentMsg.trim(), Number(id), String(conversationId))
        setCurrentMsg('');
        scrollToBottom();

    }

    const fetchCoversations = async (senderId: number) => {
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
                onEmitAndFetchMsg();
                setConversations(() => updatedConversations);
                return updatedConversations;
            }
        } catch (error) {
            console.log(error);
        }
    }

    const fetchMessages = async () => {
        const response = await http.get(`${messageBaseUrl}/get-messages?conversationId=${conversationId}&page=${page}`);

        if (response && response.data && response.data.messages) {
            setTotalCount(+response.data.totalCount)
            setMessages(() => response.data.messages);
            scrollToBottom();
        }
        else {
            setMessages(() => []);
        }
    }

    const fetchPreviousMessages = async () => {
        const response = await http.get(`${messageBaseUrl}/get-messages?conversationId=${conversationId}&page=${page}`);
        if (response && response.data && response.data.messages) {
            setTotalCount(+response.data.totalCount)
            setMessages((prevMsgs) => {
                return [
                    ...response.data.messages,
                    ...prevMsgs
                ]
            });
        }
        else {
            setMessages(() => []);
        }

    }

    const onEmitAndFetchMsg = async () => {
        if (conversationId) {
            emitRoom(conversationId);
            await fetchMessages();
        }
    }

    const scrollToBottom = () => {
        setTimeout(() => {
            if (messageWrapper.current) {
                const maxScroll = messageWrapper.current.scrollHeight;
                messageWrapper.current.scrollTo({ top: maxScroll, behavior: 'auto' });
            }
        }, 500);
    }

    return (
        <section>
            <MessageHeader />
            <Users users={conversations} isCoversation={true} />
            {
                conversations && conversations.length > 0 ?
                    <div className="p-10 shadow-lg h-screen w-[80%] float-right">
                        <div className="shadow-lg h-4/5 w-2/3 p-6 overflow-auto scrollbar-thin" ref={messageWrapper}>
                            {messages && totalCount > messages.length ? <p className="text-center cursor-pointer" onClick={() => setPage((prevPage) => prevPage + 1)}><a >Load previous messages</a></p> : null}
                            {messages.map((message, index) => (
                                <div key={message.ownerId + message.body + Math.random()} className={Number(id) === message.ownerId ? "text-right my-6" : "my-6"}>
                                    <span className={Number(id) === message.ownerId ? "bg-gray-700 text-cyan-50 px-3 py-1 rounded-xl inline-block max-w-[50%] text-left" : "bg-slate-500 text-cyan-50 px-3 py-1 rounded-xl inline-block max-w-[50%] text-left"}>
                                        <RenderMessageContent content={message.body} index={index} messages={messages} />
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="w-2/3 py-6 h-6 relative">
                            <textarea onKeyDown={handleKeyDown} value={currentMsg} onChange={(e) => setCurrentMsg(e.target.value)} className="bg-red-50 w-[100%] py-4 px-8 pr-[20%] outline-none rounded-3xl resize-none scrollbar-none" rows={1}></textarea>
                            <button disabled={!currentMsg || !currentMsg.trim()} className="absolute right-2 top-[30px] rounded-2xl" onClick={onSubmit}>Send</button>
                        </div>
                    </div> :
                    <div className="shadow-lg h-screen w-[60%] inline-block text-center">
                        <p className="text-center">No messages</p>
                    </div>
            }

        </section>
    )
}