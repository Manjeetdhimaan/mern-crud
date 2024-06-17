import { Request } from "express";
declare interface ITimeStamp {
    createAt: Date;
    updatedAt: Date;
}

declare interface IRequest extends Request {
    _id?: string;
    _email?: string;
}

export { ITimeStamp, IRequest }