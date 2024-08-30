
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { ArrowLeftIcon } from "../UI/Icons/Icons";
import { useDispatch } from "react-redux";
import { messageActions } from "../../store/message/message-slice";
import { useNavigate } from "react-router-dom";

const MessageHeader = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector(
        (state: RootState) => state.message.receiverUser
    );

    const handleBackButtonClick = () => {
        dispatch(messageActions.setConversationsMenuOpen(true));
        navigate(`/messages`);
    }
    return (
        <header className="bg-stone-700 w-screen p-6">
            <div className="flex items-center">
                <a className="mr-4" onClick={handleBackButtonClick}><ArrowLeftIcon /></a>
                <h2 className="text-xl text-cyan-50"> {user ? `${user.fullName}` : 'Messages'}</h2>
            </div>
        </header>
    )
}

export default MessageHeader;