import express, { NextFunction, Response } from "express";

import UserController from "../controllers/user.controller";
import JwtHelper from "../middlewares/jwt-helper";
import { IRequest } from "../types/common.types";
import { canUser } from "../middlewares/permissions";

const router = express.Router();
const userCtrl = new UserController();
const verifyJwtToken = new JwtHelper().verifyJwtToken as TVerifyToken;
//  canUser('user:view')
router.get('/get-users', verifyJwtToken, userCtrl.getUsers);
router.get('/get-user', verifyJwtToken, userCtrl.getUserWithRole);
router.delete('/delete-user/:id', verifyJwtToken, canUser('user:delete'), userCtrl.softDeleteUser);
router.delete('/permanent-delete-user/:id', verifyJwtToken, canUser('user:delete'), userCtrl.permanentDeleteUser);
router.post('/login', userCtrl.userLogin);
router.post('/sign-up', userCtrl.userSignup);

export type TVerifyToken = (req: IRequest, res: Response, next: NextFunction) => Promise<Response | void>;
export default router;