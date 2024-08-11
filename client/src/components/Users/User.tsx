import { useNavigate, useParams } from "react-router-dom";

import { IUser } from "../../models/user.model";
import Image from "../UI/Image/Image";

const User: React.FC<IUser> = ({ fullName, id, email, imgUrl }) => {
  const navigate = useNavigate();
  const { conversationId: paramId } = useParams();

  // const startCoversation = async (receiverId: number): Promise<void> => {
  //     try {
  //         const senderId = getUserId();
  //         const payload = {
  //             title: 'Sender=' + senderId + ': receiver=' + receiverId,
  //             startedBy: Number(senderId),
  //             recievedBy: receiverId
  //         }
  //         const response = await http.post(`${messageBaseUrl}/start`, payload);
  //         console.log(response); // TO DO: navigate to /messages/:conversationID
  //     } catch (error) {
  //         console.log(error);
  //         // Inform user about the error
  //     }
  // }

  const fetchMessages = async (cnvsId: string): Promise<void> => {
    try {
      if (paramId === cnvsId) {
        return;
      } else {
        navigate(`/messages/${cnvsId}`);
      }
    } catch (error) {
      console.log("Error", error);
      //TO DO: Inform the user about error
    }
  };
  const classes = `cursor-pointer p-4 w-[100%] flex ${
    String(id) === paramId
      ? "bg-white border-l-4 border-solid border-l-violet-700 -ml-[4px] w-[102%]"
      : ""
  }`;

  const clampClasses = "overflow-hidden text-ellipsis whitespace-nowrap line-clamp-1 block"
  return (
    <div className="w-[100%] pl-[4px] ">
      <a className={classes + ""} onClick={() => fetchMessages(String(id))}>
        <Image
          src={imgUrl || ''}
          defaultSrc="http://localhost:5173/vite.svg"
          alt={fullName}
          className="mr-2 inline-block"
        />
        <div className="max-w-[65%] ">
          <p className={clampClasses}>{fullName}</p>
          <small className={clampClasses}>{email}</small>
        </div>
      </a>
    </div>
  );
};

export default User;
