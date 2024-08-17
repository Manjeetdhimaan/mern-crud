import React, { useState } from "react";

import { IMessage } from "../../models/message.model";
import { time } from "./RenderMessageDate";

const RenderMessageContent: React.FC<{ content: string, index: number, message: IMessage }> = ({ content, index, message }) => {
    const [expanded, setExpanded] = useState<boolean[]>(new Array().fill(false));

    const toggleMessage = (index: number): void => {
        setExpanded((prevExpanded) => {
            const newExpanded = [...prevExpanded];
            newExpanded[index] = !newExpanded[index];
            return newExpanded;
        });
    };

    const maxWords = 10;
    const words = content?.split(' ');
    const classes = "text-blue-500 hover:underline focus:outline-none cursor-pointer";

    const timeContent = <div className="float-right text-sm mt-[-15px] mb-[-4px] text-[#d6d6d6]"> <small>{time(new Date(message.createdAt))}</small></div>

    if (words && words.length > maxWords && !expanded[index]) {
        const shortenedContent = words.slice(0, maxWords).join(' ');
        return (
            <>
                <div title={message.createdAt}>
                    {shortenedContent}...{' '}
                    <small>
                        <a
                            onClick={() => toggleMessage(index)}
                            className={classes}
                        >
                            Read more
                        </a>
                    </small>
                </div>
                {timeContent}
            </>
        );
    } else if (expanded[index]) {
        return (
            <>
                <div title={message.createdAt}>
                    {content}{' '}
                    {/* <small>
                    <a
                        onClick={() => toggleMessage(index)}
                        className={classes}
                    >
                        Read less
                    </a>
                </small> */}
                </div>
                {timeContent}

            </>
        );
    } else {
        return <><div className="mr-14">{content}</ div>
            {timeContent}
        </>;
    }
}

export default RenderMessageContent;