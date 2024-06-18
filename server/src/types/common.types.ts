import { Request } from "express";
import { IRole } from "./role.types";
declare interface ITimeStamp {
    createdAt: Date;
    updatedAt: Date;
}

declare interface IRequest extends Request {
    _id?: string;
    _email?: string;
    _userRole?: IRole
}

export { ITimeStamp, IRequest };