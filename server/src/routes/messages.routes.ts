import express, { NextFunction, Response } from "express";

import MessageController from "../controllers/messages.controller";
import JwtHelper from "../middlewares/jwt-helper";
import { IRequest } from "../types/common.types";

const router = express.Router();
const messageCtrl = new MessageController();
const verifyJwtToken = new JwtHelper().verifyJwtToken as TVerifyToken;

router.post('/start', verifyJwtToken, messageCtrl.startConversation);
router.get('/conversations', verifyJwtToken, messageCtrl.getConversations);
router.get('/get-messages', verifyJwtToken, messageCtrl.getMessages);

export type TVerifyToken = (req: IRequest, res: Response, next: NextFunction) => Promise<Response | void>;
export default router;