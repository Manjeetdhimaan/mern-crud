import { useEffect, useRef, useState } from "react";
// import { io } from "socket.io-client";

import Users from "../../components/Users/Users";
import RenderMessageContent from "../../components/Message/RenderMessageContent";
import { IMessage } from "../../models/message.model";
import MessageHeader from "../../components/Message/MessageHeader";
import { IUser } from "../../models/user.model";
import { useLoaderData, useParams } from "react-router-dom";
import { baseAPIUrl, token, userEmail } from "../../constants/local.constants";
import { emitPrivateMsg, emitRoom, offPrivateMsg, onPrivateMsg, socketInit } from "../../sockets/chat-socket";

// const socket = io(baseAPIUrl + '/chat');
// const userBaseUrl = baseAPIUrl + '/users';
const messageBaseUrl = baseAPIUrl + '/messages';

export function Messages() {
    // const [users, setUsers] = useState<IUser[]>([]);
    const [conversations, setConversations] = useState<IUser[]>([]);
    const [messages, setMessages] = useState<IMessage[]>([]);
    const [currentMsg, setCurrentMsg] = useState<string>('');
    const [recieverId, setRecieverId] = useState<number>(0);
    const messageWrapper = useRef<HTMLDivElement>(null);
    const id = useLoaderData();
    const { conversationId } = useParams();

    useEffect(() => {
        onSetRecieverId(conversations);
    }, [conversationId]);

    useEffect(() => {
        if (id) {
            fetchCoversations(+id);
        }
        socketInit();
        // socket.on('connect', () => {
        //     console.log('Connection Id', socket.id);
        // });
        
        onPrivateMsg(setMessages);
        // socket.on('private_message', (newMessage) => {
        //     setMessages((prevMessages) => [...prevMessages, newMessage]);
        // });

        return () => {
            offPrivateMsg();
            // socket.off('private_message');
        };
        // fetchUsers();
    }, []);

    useEffect(() => {
        if (messageWrapper.current) {
            const maxScroll = messageWrapper.current.scrollHeight;
            messageWrapper.current.scrollTo({ top: maxScroll, behavior: 'auto' });
        }
    }, [messages.length]);

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
        // socket.emit('private_message', { content: currentMsg.trim(), recieverId, senderId: Number(id) });
        emitPrivateMsg(currentMsg.trim(), recieverId, Number(id), String(conversationId))
        setCurrentMsg('');
    }

    // const fetchUsers = async () => {
    //     const response = await fetch(`${userBaseUrl}/get-users`, {
    //         method: 'GET',
    //         headers: {
    //             'Authorization': `Bearer ${localStorage.getItem(token)}`
    //         }
    //     });
    //     if (!response.ok) {
    //         console.log('Error while fetching users');
    //     }

    //     const result = await response.json();
    //     const users: IUser[] = result.data.users;
    //     const filteredUsers = users.filter(user => +user.id !== Number(id));
    //     setUsers(filteredUsers);
    // }

    const fetchCoversations = async (senderId: number) => {
        const response = await fetch(`${messageBaseUrl}/conversations?senderId=${senderId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem(token)}`
            }
        });
        if (!response.ok) {
            console.log('Error while fetching users');
        }

        const result = await response.json();
        const conversations = result.data.conversations;

        const localUser = localStorage.getItem(userEmail);
        const updatedConversations: IUser[] = conversations.map((conversation: any) => {
            const isSameUser = localUser === conversation.startedByEmail
            return {
                id: conversation.conversationId,
                fullName: isSameUser ? conversation.receivedByName : conversation.startedByName,
                email: isSameUser ? conversation.receivedByEmail : conversation.startedByEmail,
                recieverId: isSameUser ? conversation.receivedById : conversation.startedById
            }
        });
        onSetRecieverId(updatedConversations);
        setConversations(() => updatedConversations)
    }

    const fetchMessages = async() => {
        const response = await fetch(`${messageBaseUrl}/get-messages?conversationId=${conversationId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem(token)}`
            }
        });
        if (!response.ok) {
            console.log('Error while fetching messages');
        }

        const result = await response.json();
        if(result.data && result.data.messages) {
            setMessages(() => result.data.messages);
            if (messageWrapper.current) {
                const maxScroll = messageWrapper.current.scrollHeight;
                messageWrapper.current.scrollTo({ top: maxScroll, behavior: 'smooth' });
            }
        }
        else {
            setMessages(() => []);
        }
    }

    const onSetRecieverId = async (conversations: IUser[]) => {
        if (conversationId) {
            const reciever = conversations.find(conversation => {
                return conversation.id === conversationId
            });
            if (reciever) setRecieverId(reciever.recieverId);
            // socket.emit('join', { conversationId: conversationId });
            emitRoom(conversationId);
            await fetchMessages();
        }
    }

    return (
        <section>
            <MessageHeader />
            <Users users={conversations} isCoversation={true} />
            {
                conversations && conversations.length > 0 ?
                    <div className="p-10 shadow-lg h-screen w-[80%] float-right">
                        <div className="shadow-lg h-4/5 w-2/3 p-6 overflow-auto scrollbar-thin" ref={messageWrapper}>
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