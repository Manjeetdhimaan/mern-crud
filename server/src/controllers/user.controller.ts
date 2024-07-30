import bcrypt from "bcryptjs";
import { Request, Response, NextFunction } from "express";
import { ResultSetHeader } from "mysql2";

import DatabaseService from "../services/db.service";
import UserService from "../services/user.service";
import JwtHelper from "../middlewares/jwt-helper";
import { failAction, successAction } from "../utils/response";
import { IRequest } from "../types/common.types";
import { IUser, IUserWithRole } from "../types/user.types";
import { USERS } from "../utils/database-tables";
import { IRole } from "../types/role.types";

export default class UserController {
    private databaseService = new DatabaseService();
    private userService = new UserService();
    private jwtHelper = new JwtHelper();

    private getUpdatedUserWithRole = (user: IUserWithRole): IUserWithRole => {
        const userWithRole: IUserWithRole = {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            password: user.password,
            isDeleted: user.isDeleted,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            role: {
                id: Number(user.roleId),
                name: String(user.roleName),
                normalized: String(user.roleNormalized),
                description: String(user.roleDescription),
                grants: user.roleGrants || [],
                isSupport: false,
                isAdmin: false,
            },
            token: ""
        };
        const isAdmin = userWithRole.role.grants.includes('admin:*');
        const isSupport = userWithRole.role.grants.includes('support:*');
        userWithRole.role.isAdmin = isAdmin;
        userWithRole.role.isSupport = isSupport;
        return userWithRole;

    }

    userSignup = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const payload = req.body;
            if (await this.userService.doesUserExist(payload.email)) {
                return res.status(422).json(failAction("Account with this email exists already, Please try again with different one."));
            }
            if (!payload.password || !payload.password.trim()) {
                return res.status(422).json(failAction("Password is required."));
            }
            payload.password = await bcrypt.hash(payload.password, 10);
            const data = await this.databaseService.insertData(payload, USERS);
            return res.status(200).json(successAction(data, "Account created successfully!"));

        } catch (error) {
            return next(error);
        }
    }

    userLogin = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const { email, password } = req.body;
            // const { getDeleted } = req.query;
            // const data = await this.databaseService.getData(USERS, "email", email) as IUser[];
            // const data = await this.userService.getUsersWithRole(undefined, email, getDeleted === "true" ? true : false) as IUser[];
            const data = await this.databaseService.getData(USERS, 'email', email) as IUser[];
            if (data && data.length > 0) {
                const user = data[0];
                if (user && await bcrypt.compare(password, user.password)) {
                    // const userWithRole = this.getUpdatedUserWithRole(user);
                    user.token = await this.jwtHelper.generateJwt(user.id, user.email);
                    const { password, ...userWithoutPassword } = user;
                    return res.status(200).json(successAction(userWithoutPassword, "User fetched successfully"));
                }
            }

            return res.status(404).json(failAction("Incorrect email or password"));
        } catch (error) {
            console.log(error);
            return next(error);
        }
    }

    //! Not in use for now
    getUsers = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const { page, perPage, getDeleted } = req.query;
            const fields = 'id, fullName, email, createdAt, updatedAt, isDeleted'
            // const fields = '*'
            const data = await this.databaseService.getAll(USERS, fields, (Number(page) || 1), (Number(perPage) || 10), undefined, getDeleted === "true" ? true : false) as IUser[];
            // const modifiedData = (data as { [key: string]: string }[]).map((ob) => {
            //     const { password, ...rest } = ob;
            //     return rest;
            // })
            if (!data || data.length <= 0) return res.status(200).json(successAction(null, "No users found!"));
            return res.status(200).json(successAction({ users: data }, "Users fetched successfully!"));
        } catch (error) {
            return next(error);
        }
    }

    //! Not in use for now
    getUser = async (req: IRequest, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const id = req.query.id || req._id; //* if sending id through query, it will find user with that id otherwise it will return the logged in user through token
            const { getDeleted } = req.query;
            const fields = 'id, fullName, email, createdAt, updatedAt, isDeleted, roleId';
            const data = await this.databaseService.getData(USERS, 'id', Number(id), fields, undefined, undefined, undefined, getDeleted === "true" ? true : false) as IUser[];
            if (data && data.length > 0) {
                // const { password, ...rest } = data[0];
                return res.status(200).json(successAction({ user: data[0] }, "User fetched successfully!"));
            }
            return res.status(200).json(successAction(null, "No user found"));
        } catch (error) {
            console.log(error);
            return next(error);
        }
    }

    getUserWithRole = async (req: IRequest, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const id = req.query.id || req._id; //* if sending id through query, it will find user with that id otherwise it will return the logged in user through token
            const { getDeleted } = req.query;
            // const fields = 'id, fullName, email, createdAt, updatedAt, isDeleted, roleId'
            const data = await this.userService.getUsersWithRole(Number(id), undefined, getDeleted === "true" ? true : false) as IUser[];
            if (data && data.length > 0) {
                // const { password, ...rest } = data[0];
                const user = data[0];
                const userWithRole = this.getUpdatedUserWithRole(user);
                const { password, ...userWithoutPassword } = userWithRole;
                return res.status(200).json(successAction({ user: userWithoutPassword }, "User fetched successfully!"));
            }
            return res.status(200).json(successAction(null, "No user found"));
        } catch (error) {
            console.log(error);
            return next(error);
        }
    }

    getUsersWithRole = async (req: IRequest, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const { getDeleted } = req.query;
            // const fields = 'id, fullName, email, createdAt, updatedAt, isDeleted, roleId'
            const data = await this.userService.getUsersWithRole(undefined, undefined, getDeleted === "true" ? true : false) as IUser[];
            if (data && data.length > 0) {
                // const { password, ...rest } = data[0];
                const users = data.map(user => {
                    const userWithRole = this.getUpdatedUserWithRole(user);
                    const { password, ...userWithoutPassword } = userWithRole;
                    return userWithoutPassword;
                });
                return res.status(200).json(successAction({ user: users }, "User fetched successfully!"));
            }
            return res.status(200).json(successAction(null, "No user found"));
        } catch (error) {
            console.log(error);
            return next(error);
        }
    }

    softDeleteUser = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const { id } = req.params;
            const data = await this.databaseService.softDelete(USERS, "id", Number(id)) as ResultSetHeader;
            if (data) {
                if (data && data.affectedRows > 0) {
                    return res.status(200).json(successAction(null, "User deleted successfully"));
                }
            }
            return res.status(404).json(failAction("No user found with this ID"));
        } catch (error) {
            console.log(error);
            return next(error);
        }
    }

    permanentDeleteUser = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const { id } = req.params;
            const data = await this.databaseService.permanentDelete(USERS, "id", Number(id)) as ResultSetHeader;
            if (data) {
                if (data.affectedRows > 0) {
                    return res.status(200).json(successAction(null, "User deleted permanently"));
                }
            }
            return res.status(404).json(failAction("No user found with this ID"));
        } catch (error) {
            console.log(error);
            return next(error);
        }
    }
}