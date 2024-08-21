import React from "react";

import User from "./User";
import { getUserId } from "../../util/auth";
import { IUser } from "../../models/user.model";

const Users: React.FC<{ users: IUser[], children: React.ReactNode, onClickFn: <T>(data?: T) => void, isConversation: boolean }> = ({ users, children, onClickFn, isConversation }) => {
    const loggedInUserId = getUserId();

    // Using event delegation
    const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
        const target = event.target as HTMLElement;
        const userElement = target.closest('[data-user-id]');
        if (userElement) {
            const userId = userElement.getAttribute('data-user-id');
            if (userId) {
                onClickFn(userId);
            }
        }
    };

    return (
        <div className="bg-stone-200 w-[25%] inline-block h-screen" onClick={handleClick}>
            {children}
            {
                users.map(user => (
                    <div key={user.id} data-user-id={user.id}>
                        <User user={user} loggedInUserId={Number(loggedInUserId)} isConversation={isConversation} />
                    </div>
                ))
            }
        </div>
    )
}

export default Users;