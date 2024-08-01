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

export function onPrivateMsg(setMessages: React.Dispatch<React.SetStateAction<IMessage[]>>, messageWrapper: React.RefObject<HTMLDivElement>) {
    socket.on('private_message', (newMessage) => {  
        if (location.pathname.includes(newMessage.conversationId)) {
            console.log(newMessage)
            const message = {
                ...newMessage,
                ownerId: newMessage.ownerId,
                body: newMessage.body,
                id: newMessage.id,
                messageType: newMessage.messageType,
                createdAt: new Date()
            }
            setMessages((prevMessages) => [...prevMessages, message]);
            // or you can show some notification to user that new message recieved
            if (messageWrapper.current) {
                const maxScroll = messageWrapper.current.scrollHeight;
                messageWrapper.current.scrollTo({ top: maxScroll, behavior: 'auto' });
            }
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