import { useNavigate, useParams } from "react-router-dom";

import http from "../../util/http";
import { getUserId } from "../../util/auth";
import { IUser } from "../../models/user.model";

const messageBaseUrl = '/messages';
let conversationId = '';

const User: React.FC<IUser> = ({ fullName, id, isCoversation }) => {
    const navigate = useNavigate();
    const {conversationId: paramId} = useParams();

    const startCoversation = async (recieverId: number) => {
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

    const fetchMessages = async (cnvsId: string) => {
        try {
            if (conversationId === cnvsId) {
                return;
            } else {
                conversationId = cnvsId;
                navigate(`/messages/${cnvsId}`);
            }

        } catch (error) {
            console.log('Error', error);
            //TO DO: Inform the user about error
        }

    }
    const classes = `cursor-pointer ${String(id) === paramId ? 'underline': ''}`
    return (
        <div className="py-2 px-4">
            {/* <img src="sas" alt={fullName} /> */}
            
            <a className={classes} onClick={() => isCoversation ? fetchMessages(String(id)) : startCoversation(Number(id))}>
                {fullName}
            </a>
        </div>
    )
}

export default User;