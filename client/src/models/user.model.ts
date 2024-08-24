import { ILastMessage } from "./message.model"

export interface IUser {
    id: number | string,
    receiverId: number,
    name: string,
    imgUrl: string,
    fullName: string,
    createdAt: string,
    updatedAt: string,
    email: string,
    lastMessage?: ILastMessage
    // userId?: number,
    onClickFn: <T>(data?: T) => void
}