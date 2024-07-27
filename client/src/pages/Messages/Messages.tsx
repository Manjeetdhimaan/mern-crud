import { useEffect, useRef, useState } from "react";
import Users from "../../components/Users/Users";
import { IMessage } from "../../models/message.model";

const MESSAGES: IMessage[] = [
    {
        senderId: 'senderId',
        recieverId: 'recieverId',
        content: 'message 1'
    },
    {
        senderId: 'recieverId',
        recieverId: 'senderId',
        content: 'message 2'
    },
];

const USERS = [
    {
        id: 'senderId',
        name: 'Manjeet Singh',
        imgUrl: ''
    },
    {
        id: 'recieverId',
        name: 'Satyam',
        imgUrl: ''
    },
    {
        id: '2323',
        name: 'Satyam',
        imgUrl: ''
    },
    {
        id: 'sdgf',
        name: 'Satyam',
        imgUrl: ''
    },
    {
        id: 'dfdfcd',
        name: 'Satyam',
        imgUrl: ''
    },

];

export function Messages() {
    const [userId] = useState<string>('senderId');
    const [users] = useState(USERS);
    const [messages, setMessages] = useState<IMessage[]>(MESSAGES);
    const [currentMsg, setCurrentMsg] = useState<string>('');
    const messageWrapper = useRef<HTMLDivElement>(null);

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
        if (!currentMsg || !currentMsg.trim()) {
            return;
        }
        setMessages(prevMsgs => {
            const newMsg = {
                senderId: 'senderId',
                recieverId: 'recieverId',
                content: currentMsg.trim()
            }
            return [
                ...prevMsgs, newMsg
            ];
        });
        setCurrentMsg('');
    }

    return (
        <section>
            <header className="bg-stone-700 w-screen p-6">
                <h2 className="text-xl text-cyan-50">Chat with User</h2>
            </header>
            <Users users={users} />
            {
                messages && messages.length > 0 ?
                    <div className="p-10 shadow-lg h-screen w-[80%] float-right">
                        <div className="shadow-lg h-4/5 w-2/3 p-6 overflow-auto scrollbar-thin" ref={messageWrapper}>
                            {messages.map(message => (
                                <div key={message.senderId + message.content + Math.random()} className={userId === message.senderId ? "text-right my-6" : "my-6"}>
                                    <span className={userId === message.senderId ? "bg-gray-700 text-cyan-50 px-3 py-1 rounded-xl" : "bg-slate-500 text-cyan-50 px-3 py-1 rounded-xl"}>
                                        {message.content}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="w-2/3 py-6 h-6 relative">
                            <textarea onKeyDown={handleKeyDown} value={currentMsg} onChange={(e) => setCurrentMsg(e.target.value)} className="bg-red-50 w-[100%] py-4 px-8 outline-none rounded-3xl resize-none scrollbar-none" rows={1}></textarea>
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