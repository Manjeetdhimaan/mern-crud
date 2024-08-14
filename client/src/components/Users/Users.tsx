import React from "react";

import User from "./User";
import { IUser } from "../../models/user.model";

const Users: React.FC<{users: IUser[], children: React.ReactNode, onClickFn: <T>(data?: T) => void}> = ({users, children, onClickFn}) => {
    return (
        <div className="bg-stone-200 w-[25%] inline-block h-screen">
            {children}
            {
                users.map(user => (
                    <User key={user.id} {...user} onClickFn={onClickFn} />
                ))
            }
        </div>
    )
}

export default Users;