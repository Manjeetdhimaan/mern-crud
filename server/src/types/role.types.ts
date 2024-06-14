import { RowDataPacket } from "mysql2";
import { ITimeStamp } from "./common.types";

export interface IRole extends RowDataPacket, ITimeStamp {
    id: number;
    name: string;
    description: string;
    normalized: string;
    grants: string;
}