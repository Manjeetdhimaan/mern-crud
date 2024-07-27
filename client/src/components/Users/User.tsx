import { IUser } from "../../models/user.model";

const User: React.FC<IUser> = ({ id, name }) => {
    return (
        <div key={id} className="py-2 px-4">
            <img src="sas" alt="" />
            <a href="">
                {name}
            </a>
        </div>
    )
}

export default User;