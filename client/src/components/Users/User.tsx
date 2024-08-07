import { useNavigate, useParams } from "react-router-dom";

import http from "../../util/http";
import { getUserId } from "../../util/auth";
import { IUser } from "../../models/user.model";

const messageBaseUrl = '/messages';

const User: React.FC<IUser> = ({ fullName, id, isCoversation }) => {
    const navigate = useNavigate();
    const {conversationId: paramId} = useParams();
 
    const startCoversation = async (recieverId: number): Promise<void> => {
        try {
            const senderId = getUserId();
            const payload = {
                title: 'Sender=' + senderId + ': reciever=' + recieverId,
                startedBy: Number(senderId),
                recievedBy: recieverId
            }
            const response = await http.post(`${messageBaseUrl}/start`, payload);
            console.log(response); // TO DO: navigate to /messages/:conversationID 
        } catch (error) {
            console.log(error);
            // Inform user about the error
        }
    }

    const fetchMessages = async (cnvsId: string): Promise<void> => {
        try {
            if (paramId === cnvsId) {
                return;
            } else {
                navigate(`/messages/${cnvsId}`);
            }

        } catch (error) {
            console.log('Error', error);
            //TO DO: Inform the user about error
        }

    }
    const classes = `cursor-pointer p-4 w-[100%] inline-block ${String(id) === paramId ? 'bg-white border-l-4 border-solid border-l-violet-700 -ml-[4px] w-[102%]': ''}`;
    return (
        <div className="w-[100%] pl-[4px]">
            {/* <img src="sas" alt={fullName} /> */}
            
            <a className={classes + ''} onClick={() => isCoversation ? fetchMessages(String(id)) : startCoversation(Number(id))}>
                {fullName}
            </a>
        </div>
    )
}

export default User;