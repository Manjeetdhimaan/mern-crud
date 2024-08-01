
import { IUser } from "../../models/user.model";

const MessageHeader: React.FC<{ user: IUser }> = ({ user }) => {

    return (
        <header className="bg-stone-700 w-screen p-6">
            <h2 className="text-xl text-cyan-50"> {user ? `Chat with ${user.fullName}` : 'Messages'}</h2>
        </header>
    )
}

export default MessageHeader;