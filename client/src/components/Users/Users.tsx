import React from "react";

import User from "./User";
import { IUser } from "../../models/user.model";

const Users: React.FC<{users: IUser[], isCoversation: boolean}> = ({users, isCoversation = false}) => {
    return (
        <div className="bg-stone-200 w-[20%] inline-block h-screen ">
            <div className="p-6">
                <h2 className="text-xl px-4">Your conversations list</h2>
            </div>
            {
                users.map(user => (
                    <User key={user.id} {...user} isCoversation={isCoversation} />
                ))
            }
        </div>
    )
}

export default Users;