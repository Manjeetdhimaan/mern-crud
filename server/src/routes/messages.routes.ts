import express, { NextFunction, Response } from "express";

import JwtHelper from "../middlewares/jwt-helper";
import extractFile from "../middlewares/file-upload";
import MessageController from "../controllers/messages.controller";
import { IRequest } from "../types/common.types";

const router = express.Router();
const messageCtrl = new MessageController();
const verifyJwtToken = new JwtHelper().verifyJwtToken as TVerifyToken;

router.post('/start', verifyJwtToken, messageCtrl.startConversation);
router.get('/get-messages', verifyJwtToken, messageCtrl.getMessages);
router.get('/conversations', verifyJwtToken, messageCtrl.getConversations);
// router.put('/update-last-message', verifyJwtToken, messageCtrl.updateLastMessageInConversation);
router.post('/private-message', verifyJwtToken, extractFile.single('file'), messageCtrl.privateMessageWithFiles);

export type TVerifyToken = (req: IRequest, res: Response, next: NextFunction) => Promise<Response | void>;
export default router;