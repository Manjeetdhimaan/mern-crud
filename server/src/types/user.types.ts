import { ITimeStamp } from "./common.types";
import { IRole } from "./role.types";

declare interface IUser extends ITimeStamp {
  id: number;
  email: string;
  password: string;
  fullName: string;
  token: string;
  isDeleted: boolean;
  role: IRole
}
declare interface IUserWithRole extends ITimeStamp {
  id: number;
  email: string;
  password: string;
  fullName: string;
  token: string;
  isDeleted: boolean;
  role: IRole;
  roleId?: number;
  roleName?: string;
  roleNormalized?: string;
  roleDescription?: string;
  roleGrants?: string[];
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

export { IUser, IUserWithoutPassword, ICountRow, IUserWithRole }