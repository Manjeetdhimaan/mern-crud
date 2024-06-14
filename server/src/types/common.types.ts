import { Request } from "express";

export interface ITimeStamp {
    createAt: Date;
    updatedAt: Date;
}

export interface IRequest extends Request {
    _id?: string;
    _email?: string;
    role?: {
        isAdmin: boolean;
        isAgent: boolean;
    }
}