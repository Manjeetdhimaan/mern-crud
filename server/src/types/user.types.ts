import { RowDataPacket } from "mysql2";
import { ITimeStamp } from "./common.types";

declare interface IUser extends RowDataPacket, ITimeStamp {
  id: number;
  email: string;
  password: string;
  fullName: string;
}

declare interface IUserWithoutPassword extends ITimeStamp {
  id: number;
  email: string;
  fullName: string;
  token: string;
}

declare interface ICountRow {
  count: number;
}

export { IUser, IUserWithoutPassword, ICountRow }