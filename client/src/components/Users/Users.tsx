import React from "react";

import User from "./User";
import { getUserId } from "../../util/auth";
import { IUser } from "../../models/user.model";

const Users: React.FC<{ users: IUser[], conversationsMenuOpen: boolean, children: React.ReactNode, onClickFn: <T>(data?: T) => void, isConversation: boolean, classes?: string }> = ({ users, children, onClickFn, isConversation, classes, conversationsMenuOpen }) => {
    const loggedInUserId = getUserId();

    // Using event delegation
    const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
        const target = event.target as HTMLElement;
        const idElement = target.closest('[data-id]');
        if (idElement) {
            const userOrCnvsId = idElement.getAttribute('data-id');
            if (userOrCnvsId) {
                onClickFn(userOrCnvsId);
            }
        }
    };

    return (
        // ${sideBarIsOpen ? "translate-x-0" : "translate-x-[-100%]"}
        <div className={`bg-stone-200 w-full relative z-10 transition-transform ${conversationsMenuOpen ? "translate-x-0" : "translate-x-[-100%]"} w-[25%] sm:w-[40%] lg:w-[25%] sm:translate-x-0 sm:inline-block h-screen overflow-auto scrollbar-thin ${classes}`} onClick={handleClick}>
            {children}
            {
                users.map(user => (
                    <div key={user.id} data-id={user.id}>
                        <User user={user} loggedInUserId={Number(loggedInUserId)} isConversation={isConversation} />
                    </div>
                ))
            }
            <p className="text-center mt-4">
                {
                    !users || users.length <= 0 &&
                    (
                        isConversation ? "No conversations" : "No users found"
                    )
                }
            </p>

        </div>
    )
}

export default Users;