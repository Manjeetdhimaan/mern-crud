import { useNavigate, useParams } from "react-router-dom";

import { baseAPIUrl, token, userId } from "../../constants/local.constants";
import { IUser } from "../../models/user.model";
const messageBaseUrl = baseAPIUrl + '/messages';

let conversationId = '';

const User: React.FC<IUser> = ({ fullName, id, isCoversation }) => {
    const navigate = useNavigate();
    const {conversationId: paramId} = useParams();

    const startCoversation = async (recieverId: number) => {
        try {
            const senderId = localStorage.getItem(userId);
            const payload = {
                title: 'Sender=' + senderId + ': reciever=' + recieverId,
                startedBy: Number(senderId),
                recievedBy: recieverId
            }
            const response = await fetch(`${messageBaseUrl}/start`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem(token)}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            if (!response.ok) {
                console.log('Error while starting conversation');
            }

            const result = await response.json();
            console.log(result); // TO DO: navigate to /messages/:conversationID 
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