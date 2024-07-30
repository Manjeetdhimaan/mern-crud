import { io } from "socket.io-client";

import { IMessage } from "../../models/message.model";
import { baseAPIUrl } from "../../constants/local.constants";

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
                ownerId: newMessage.ownerId,
                body: newMessage.body,
                id: newMessage.id,
                messageType: newMessage.messageType
            }
            setMessages((prevMessages) => [...prevMessages, message]);
        }
        else {
            //show notification
        }
    });
}

export function emitPrivateMsg(currentMsg: string, ownerId: number, conversationId: string, messageType = 'text') {
    socket.emit('private_message', { body: currentMsg.trim(), ownerId: Number(ownerId), conversationId, messageType });
}

export function offPrivateMsg() {
    socket.off('private_message');
}