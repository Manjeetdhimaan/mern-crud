import React, { useState } from "react";

import { IMessage } from "../../models/message.model";

const RenderMessageContent: React.FC<{ content: string, index: number, messages: IMessage[] }> = ({ content, index, messages }) => {
    const [expanded, setExpanded] = useState<boolean[]>(new Array(messages.length).fill(false));

    const toggleMessage = (index: number) => {
        setExpanded((prevExpanded) => {
            const newExpanded = [...prevExpanded];
            newExpanded[index] = !newExpanded[index];
            return newExpanded;
        });
    };

    const maxWords = 10;
    const words = content?.split(' ');
    const classes = "text-blue-500 hover:underline focus:outline-none cursor-pointer";
    
    if (words && words.length > maxWords && !expanded[index]) {
        const shortenedContent = words.slice(0, maxWords).join(' ');
        return (
            <>
                <div>
                    {shortenedContent}...{' '}
                </div>
                <small className="float-right">
                    <a
                        onClick={() => toggleMessage(index)}
                        className={classes}
                    >
                        Show more
                    </a>
                </small>
            </>
        );
    } else if (expanded[index]) {
        return (
            <>
                <div>
                    {content}{' '}
                </div>
                <small className="float-right">
                    <a
                        onClick={() => toggleMessage(index)}
                        className={classes}
                    >
                        Show less
                    </a>
                </small>
            </>
        );
    } else {
        return <>{content}</>;
    }
}

export default RenderMessageContent;