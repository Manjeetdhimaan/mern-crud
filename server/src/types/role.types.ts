declare interface IRole {
    id: number;
    name: string;
    description: string;
    normalized: string;
    grants: string[];
    isSupport: boolean,
    isAdmin: boolean
}
export { IRole }