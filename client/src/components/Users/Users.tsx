import React from "react";

import User from "./User";
import { IUser } from "../../models/user.model";

const Users: React.FC<{users: IUser[], children: React.ReactNode}> = ({users, children}) => {
    return (
        <div className="bg-stone-200 w-[20%] inline-block h-screen ">
            {children}
            {
                users.map(user => (
                    <User key={user.id} {...user} />
                ))
            }
        </div>
    )
}

export default Users;