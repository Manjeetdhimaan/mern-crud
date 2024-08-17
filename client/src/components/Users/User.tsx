import { useParams } from "react-router-dom";

import Image from "../UI/Image/Image";
import { IUser } from "../../models/user.model";
import { time } from "../Message/RenderMessageDate";

const User: React.FC<IUser> = ({ fullName, id, imgUrl, onClickFn, lastMessage, userId }) => {

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

  const classes = `cursor-pointer p-4 w-[100%] flex ${String(id) === paramId
    ? "bg-white border-l-4 border-solid border-l-violet-700 -ml-[4px] w-[102%]"
    : ""
    }`;

  const clampClasses = "overflow-hidden text-ellipsis whitespace-nowrap line-clamp-1 block"
  return (
    <div className="w-[100%] pl-[4px] ">
      <a className={classes + " relative"} onClick={() => onClickFn(String(id))}>
        <Image
          src={imgUrl || ''}
          defaultSrc="/vite.svg"
          alt={fullName}
          className="mr-2 inline-block"
        />
        <div className="max-w-[65%]">
          <p className={clampClasses}>{fullName}</p>


          {lastMessage?.lastMessage &&
            <small className={clampClasses + ' flex'}>
              {
                Number(lastMessage?.lastMessageBy) === Number(userId) ?
                  <span className="max-w-[65%]">You </span> :
                  <span className={clampClasses + " max-w-[55%] inline-block"}>{fullName} </span>
              }
              <span>: {lastMessage?.lastMessageType === "text" ? lastMessage?.lastMessage : 'Sent an attachment'}</span>
            </small>}
          <small className="text-[10px] absolute right-2 text-[grey]">{time(new Date(String(lastMessage?.lastMessageCreatedAt)))}</small>
        </div>
      </a>
    </div>
  );
};

export default User;
