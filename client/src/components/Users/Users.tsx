import React from "react";

import User from "./User";
import { getUserId } from "../../util/auth";
import { IUser } from "../../models/user.model";

const Users: React.FC<{users: IUser[], children: React.ReactNode, onClickFn: <T>(data?: T) => void}> = ({users, children, onClickFn}) => {
   const userId = getUserId();

    return (
        <div className="bg-stone-200 w-[25%] inline-block h-screen">
            {children}
            {
                users.map(user => (
                    <User key={user.id} {...user} userId={Number(userId)} onClickFn={onClickFn} />
                ))
            }
        </div>
    )
}

export default Users;