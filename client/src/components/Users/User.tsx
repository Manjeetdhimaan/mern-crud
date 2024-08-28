import { useNavigate, useParams } from "react-router-dom";

import Image from "../UI/Image/Image";
import PopupMenu from "../UI/PopupMenu/PopupMenu";
import { useDispatch } from "react-redux";
import { DeleteIcon } from "../UI/Icons/Icons";
import { IUser } from "../../models/user.model";
import { IMenuItem } from "../../models/ui.model";
import { time } from "../Message/RenderMessageDate";
import { getDate, getMediumDate, today } from "../../util/dates";
import { deleteConversation } from "../../store/message/message-actions";
import ConfirmModel from "../UI/Confirm/ConfirmModel";
import { useState } from "react";

const clampClasses = "overflow-hidden text-ellipsis whitespace-nowrap line-clamp-1 block";

const User: React.FC<{ user: IUser, isConversation: boolean, loggedInUserId: number }> = ({ user, isConversation, loggedInUserId }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [deletingConversation, setDeletingConversation] = useState(false);
  const { conversationId: paramId } = useParams();
  const { fullName, id, imgUrl, lastMessage } = user;

  const classes = `cursor-pointer p-4 w-[100%] flex ${String(id) === paramId
    ? "bg-white border-l-4 border-solid border-l-violet-700 -ml-[4px] w-[102%] shadow-2xl"
    : "hover:bg-stone-300 shadow-sm"
    }`;

  // const handleMenuClick = (): void => {
  //   setDeletingConversation(true);
  // }

  const handleDelete = async (cnvsId: string): Promise<void> => {
    await dispatch(deleteConversation(String(cnvsId)));
    if (paramId === String(cnvsId)) {
      navigate(`/messages`);
    }
    setDeletingConversation(false);
  }

  const menuItems: IMenuItem[] = [
    {
      label: "Delete",
      icon: <DeleteIcon />,
      onClick: () => setDeletingConversation(true),
    },
  ];


  return (
    <>
      <ConfirmModel confirmCallback={() => handleDelete(String(user.id))} cancelCallback={() => setDeletingConversation(false)} open={deletingConversation} description={<span>Sure to delete conversation with <strong> {user.fullName}</strong> </span>} />
      <div className="w-[100%] pl-[4px]">

        <div className={classes + " relative group"} >
          <Image
            src={imgUrl || ''}
            defaultSrc="/vite.svg"
            alt={fullName}
            className="mr-2 inline-block"
          />
          <div className="max-w-[65%]">
            <p className={clampClasses} title={fullName}>{fullName}</p>
            {isConversation ?
              lastMessage?.lastMessage &&
              <>
                <small className={clampClasses + ' flex'}>
                  {
                    Number(lastMessage?.lastMessageBy) === Number(loggedInUserId) ?
                      <span className="max-w-[65%]">You </span> :
                      <span title={fullName} className={clampClasses + " max-w-[55%] inline-block"}>{fullName} </span>
                  }
                  <span title={lastMessage?.lastMessageType === "text" ? lastMessage?.lastMessage : 'Sent an attachment'} className={clampClasses}>: {lastMessage?.lastMessageType === "text" ? lastMessage?.lastMessage : 'Sent an attachment'}</span>
                </small>

                {
                  today() !== getDate(String(lastMessage?.lastMessageCreatedAt)) ?
                    <small className="text-[10px] absolute right-2 text-[grey]">
                      {
                        today() - getDate(String(lastMessage?.lastMessageCreatedAt)) === 1 ? "Yesterday" : getMediumDate(new Date(String(lastMessage?.lastMessageCreatedAt)))
                      }
                    </small>
                    :
                    <small className="text-[10px] absolute right-2 text-[grey]">{time(new Date(String(lastMessage?.lastMessageCreatedAt)))}</small>
                }

              </>
              :
              <small className={clampClasses + ' flex'}>
                <span className="max-w-[65%]">{user.email} </span>
              </small>
            }

            {
              isConversation && !lastMessage?.lastMessage && <small className={clampClasses}>No Messages</small>
            }
          </div>
          {
            isConversation &&
            <a onClick={(e) => e.stopPropagation()} className="absolute right-2 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity">
              <PopupMenu payload={{ items: menuItems, data: user.id }} closeOnClick={false} />
            </a>
          }

        </div>
      </div>
    </>
  );
};

export default User;
