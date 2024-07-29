import { io } from "socket.io-client";

import { baseAPIUrl } from "../../constants/local.constants";
import { IMessage } from "../../models/message.model";
const socket = io(baseAPIUrl + '/chat');

export function emitRoom(cnvsId: string) {
    socket.emit('join', { conversationId: cnvsId });
}

export function socketInit() {
    socket.on('connect', () => {
        console.log('Connection Id', socket.id);
    });
}

export function onPrivateMsg(setMessages: React.Dispatch<React.SetStateAction<IMessage[]>>) {
    socket.on('private_message', (newMessage) => {  
        if (location.pathname.includes(newMessage.conversationId)) {
            const message = {
                ...newMessage,
                ownerId: newMessage.senderId,
                body: newMessage.content,

            }
            setMessages((prevMessages) => [...prevMessages, message]);
        }
        else {
            //show notification
        }
    });
}

export function emitPrivateMsg(currentMsg: string, recieverId: number, id: number, conversationId: string) {
    socket.emit('private_message', { content: currentMsg.trim(), recieverId, senderId: Number(id), conversationId });
}

export function offPrivateMsg() {
    socket.off('private_message');
}