import { NextFunction, Request, Response } from "express";

import DatabaseService from "../services/db-service";
import { ROLES } from "../utils/database-tables";
import { successAction } from "../utils/response";
import { IRole } from "../types/role.types";
import { Global } from "../types/global";
import { ResultSetHeader } from "mysql2";
declare const global: Global;

export default class RoleController extends DatabaseService {

    constructor() {
        super();
    }

    createRole = async (req: Request, res: Response, next: NextFunction) => {
        const payload = req.body;
        const normalized = payload.name.trim().toLowerCase().split(' ').join('-');
        payload.normalized = normalized;
        payload.grants = JSON.stringify(payload.grants);
        try {
            const data = await this.insertData(payload, ROLES);
            await this.registerRoles(req, res, next);
            return res.status(200).json(successAction(data, "Role created successfully!"));
        } catch (error) {
            return next(error);
        }
    }

    getRoles = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const { page, perPage } = req.query;
            // const fields = '*'
            const data = await this.getAll(ROLES, undefined, (Number(page) || 1), (Number(perPage) || 10)) as IRole[];
            if (!data || data.length <= 0) return res.status(200).json(successAction(null, "No roles found!"));
            global.roles = data;
            return res.status(200).json(successAction({ users: data }, "Roles fetched successfully!"));
        } catch (error) {
            return next(error);
        }
    }

    registerRoles = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const { page, perPage } = req.query;
            // const fields = '*'
            const data = await this.getAll(ROLES, undefined, (Number(page) || 1), (Number(perPage) || 10)) as IRole[];
            if (!data || data.length <= 0) return res.status(200).json(successAction(null, "No roles found!"));
            global.roles = data;
            next();
        } catch (error) {
            console.log('Error in registering roles ==>', error);
            next();
        }
    }

    getRole = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            // const fields = '*';              
            const data = await this.getData(ROLES, "id", req.query.id) as IRole[];
            if (!data || data.length <= 0) return res.status(200).json(successAction(null, "No roles found!"));

            return res.status(200).json(successAction({ users: data }, "Roles fetched successfully!"));
        } catch (error) {
            return next(error);
        }
    }

    permanentDeleteRole = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            // const fields = '*';
            const data = await this.permanentDelete(ROLES, "id", req.params.id) as ResultSetHeader;
            if (!data || !data.affectedRows) return res.status(200).json(successAction(null, "No roles found!"));
            if (data && data.affectedRows) return res.status(200).json(successAction(data, "Role deleted successfully!"));
        } catch (error) {
            return next(error);
        }
    }
}