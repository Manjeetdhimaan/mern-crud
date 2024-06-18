import Global = NodeJS.Global;

declare namespace NodeJS {
    interface Global {
        roles: IRole[];
    }
}

export interface Global extends Global {
    roles: IRole[]
}