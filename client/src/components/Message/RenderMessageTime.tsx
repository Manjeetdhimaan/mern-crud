import { time } from "./RenderMessageDate"

const RenderMessageTime = ({ createdAt, classes }: { createdAt: string, classes?: string }) => {
    return (
        <div className={"float-right text-sm mt-[-15px] mb-[-4px] text-[#d6d6d6] " + classes}> <small>{time(new Date(createdAt))}</small></div>
    )
}

export default RenderMessageTime;