import { RowDataPacket } from "mysql2";
import { ITimeStamp } from "./common.types";

export interface IUser extends RowDataPacket, ITimeStamp {
  id: number;
  email: string;
  password: string;
  fullName: string;
}

export interface IUserWithoutPassword extends ITimeStamp {
  id: number;
  email: string;
  fullName: string;
  token: string;
}

export interface ICountRow {
  count: number;
}