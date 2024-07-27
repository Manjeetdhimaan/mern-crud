import React from "react";

import User from "./User";
import { IUser } from "../../models/user.model";

const Users: React.FC<{users: IUser[]}> = ({users}) => {
    return (
        <div className="bg-stone-200 w-[20%] inline-block h-screen p-6">
            <p className="mb-8">
                <h1 className="text-2xl px-4">Users list</h1>
            </p>
            {
                users.map(user => (
                    <User {...user} />
                ))
            }
        </div>
    )
}

export default Users;