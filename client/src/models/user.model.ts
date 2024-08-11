export interface IUser {
    id: number | string,
    receiverId: number,
    name: string,
    imgUrl: string,
    fullName: string,
    createdAt: string,
    updatedAt: string,
    email: string,
    isCoversation: boolean
}