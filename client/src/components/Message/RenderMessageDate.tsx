
import { IMessage } from "../../models/message.model";

const today = new Date().getDate();
const getDateMonth = (date: string): string => {
    const foundDate = new Date(date).getDate();
    const foundMonth = new Date(date).getMonth();
    const foundYear = new Date(date).getFullYear();
    return `${foundDate}-${foundMonth}-${foundYear}`;
}

const getDate = (date: string): number => {
    return new Date(date).getDate();
}

const RenderMessageDate: React.FC<{ message: IMessage, index: number, messages: IMessage[] }> = ({ messages, message, index }) => {
    const date = new Date(message.createdAt);
    return (
        <span>
            {
                ((index === 0 && today !== getDate(messages[index].createdAt) && messages[index - 1]) ||
                    (today !== getDate(messages[index].createdAt) &&
                        messages[index - 1] &&
                        getDateMonth(messages[index].createdAt) !==
                        getDateMonth(messages[index - 1].createdAt))) &&
                <p className="text-center">
                    {(date.getDate()) + '-' + (date.getMonth() + 1) + '-' + (date.getFullYear())}
                </p>
            }
            {
                ((today === getDate(messages[index].createdAt) &&
                    messages[index - 1] &&
                    getDateMonth(messages[index].createdAt) !==
                    getDateMonth(messages[index - 1].createdAt)) ||
                    (today === getDate(messages[index].createdAt) && index == 0))
                && <p className="text-center">Today</p>
            }
        </span>
    );

}

export default RenderMessageDate;