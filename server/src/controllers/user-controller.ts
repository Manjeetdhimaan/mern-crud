import { Request, Response, NextFunction } from "express";

import UserService from "../services/user-service";
import { failAction, successAction } from "../utils/response";

export default class UserController {
    userService = new UserService();
    userSignup = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const payload = req.body;
            const data = await this.userService.signup(payload.email, payload.password, payload.fullName);
            return res.status(200).json(successAction(data, "Account created"));
        } catch (error) {
            console.log(error);
            return res.status(400).json(failAction(error as string || 'Error while creating account'));
        }
    }

    userLogin = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const payload = req.body;
            const data = await this.userService.login(payload.email, payload.password);
            return res.status(200).json(successAction(data, "User fetched successfully"));
        } catch (error) {
            console.log(error);
            return res.status(400).json(failAction(error as string || 'Error while fetching account'));
        }
    }

    getUsers = async (_: Request, res: Response, next: NextFunction): Promise<Response> => {
        try {
            const data = await this.userService.getUsers();
            return res.status(200).json(successAction({ users: data }, "Users fetched successfully!"));
        } catch (error) {
            console.log(error);
            return res.status(400).json(failAction('Error while fetching users'));
        }
    }
}