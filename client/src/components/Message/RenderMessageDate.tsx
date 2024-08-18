
import Hr from "../UI/HorizontalLine";
import { IMessage } from "../../models/message.model";
import { getDate, getFormattedDate, getMediumDate, today } from "../../util/dates";

const RenderMessageDate: React.FC<{ message: IMessage, index: number, messages: IMessage[] }> = ({ messages, message, index }) => {
    const date = new Date(message.createdAt);
    return (
        <span>
            {
                ((index === 0 && today() !== getDate(messages[index].createdAt) && messages[index - 1]) ||
                    (today() !== getDate(messages[index].createdAt) &&
                        messages[index - 1] &&
                        getFormattedDate(messages[index].createdAt) !==
                        getFormattedDate(messages[index - 1].createdAt))) &&
                <div className="text-center py-5">
                    <Hr classes="mb-[-14px]" />
                    <span className="bg-white px-3" >
                        {getMediumDate(date)}
                    </span>
                </div>
            }
            {
                ((today() === getDate(messages[index].createdAt) &&
                    messages[index - 1] &&
                    getFormattedDate(messages[index].createdAt) !==
                    getFormattedDate(messages[index - 1].createdAt)) ||
                    (today() === getDate(messages[index].createdAt) && index === 0))
                &&
                <div className="text-center py-5" >
                    <Hr classes="mb-[-14px]" />
                    <span className="bg-white px-3">Today</span>
                </div>
            }
        </span>
    );

}

export default RenderMessageDate;

export const time = (date: Date): string => {
    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);

    let hours = localDate.getHours();
    const minutes = localDate.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';

    // Convert 24-hour time to 12-hour format
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'

    // Format minutes with leading zero if needed
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;

    const formattedTime = `${hours}:${formattedMinutes} ${ampm}`;
    return formattedTime;
};

