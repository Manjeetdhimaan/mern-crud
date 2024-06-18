import express, { NextFunction, Response } from "express";

import UserController from "../controllers/user-controller";
import JwtHelper from "../middlewares/jwt-helper";
import { IRequest } from "../types/common.types";
import { canUser } from "../middlewares/permissions";

const router = express.Router();
const userCtrl = new UserController();
const verifyJwtToken = new JwtHelper().verifyJwtToken as TVerifyToken;

router.get('/get-users', verifyJwtToken, canUser('user:view'), userCtrl.getUsersWithRole);
router.get('/get-user', verifyJwtToken, canUser('user:view'), userCtrl.getUserWithRole);
router.delete('/delete-user/:id', verifyJwtToken, canUser('user:delete'), userCtrl.softDeleteUser);
router.delete('/permanent-delete-user/:id', verifyJwtToken, canUser('user:delete'), userCtrl.permanentDeleteUser);
router.get('/login', userCtrl.userLogin);
router.post('/sign-up', userCtrl.userSignup);

export type TVerifyToken = (req: IRequest, res: Response, next: NextFunction) => Promise<Response | void>;
export default router;