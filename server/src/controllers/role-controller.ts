import { NextFunction, Request, Response } from "express";

import DatabaseService from "../services/db-service";
import { ROLES } from "../utils/database-tables";
import { successAction } from "../utils/response";
import { IRole } from "../types/role.types";
import { IRequest } from "../types/common.types";

export default class RoleController {
    private databaseService = new DatabaseService();

    createRole = async (req: Request, res: Response, next: NextFunction) => {
        const payload = req.body;
        const normalized = payload.name.trim().toLowerCase().split(' ').join('-');
        payload.normalized = normalized;
        payload.grants = JSON.stringify(payload.grants);
        try {
            const data = await this.databaseService.insertData(payload, ROLES);
            return res.status(200).json(successAction(data, "Role created successfully!"));
        } catch (error) {
            return next(error);
        }
    }

    getRoles = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const { page, perPage } = req.query;
            // const fields = '*'
            const data = await this.databaseService.getAll(ROLES, undefined, (Number(page) || 1), (Number(perPage) || 10)) as IRole[];
            if (!data || data.length <= 0) return res.status(200).json(successAction(null, "No roles found!"));

            return res.status(200).json(successAction({ users: data }, "Roles fetched successfully!"));
        } catch (error) {
            return next(error);
        }
    }

    getRole = async (req: IRequest, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            // const { isAdmin, isAgent } = req.role;
            // const fields = '*'
            const data = await this.databaseService.getData(ROLES, "id", req.query.id) as IRole[];
            if (!data || data.length <= 0) return res.status(200).json(successAction(null, "No roles found!"));

            return res.status(200).json(successAction({ users: data }, "Roles fetched successfully!"));
        } catch (error) {
            return next(error);
        }
    }
}