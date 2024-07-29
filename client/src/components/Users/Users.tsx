import React from "react";

import User from "./User";
import { IUser } from "../../models/user.model";

const Users: React.FC<{users: IUser[], isCoversation: boolean}> = ({users, isCoversation}) => {
    return (
        <div className="bg-stone-200 w-[20%] inline-block h-screen p-6">
            <div className="mb-8">
                <h1 className="text-2xl px-4">Your conversations</h1>
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