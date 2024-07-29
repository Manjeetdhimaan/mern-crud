export interface IUser {
    id: number | string,
    recieverId: number,
    name: string,
    imgUrl: string,
    fullName: string,
    createdAt: string,
    updatedAt: string,
    email: string,
    isCoversation: boolean
}