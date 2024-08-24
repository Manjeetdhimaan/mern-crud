import express, { NextFunction, Response } from "express";

import JwtHelper from "../middlewares/jwt-helper";
import extractFile from "../middlewares/file-upload";
import MessageController from "../controllers/messages.controller";
import FileUploadMiddleware from "../middlewares/file-upload";
import { IRequest } from "../types/common.types";

const router = express.Router();
const messageCtrl = new MessageController();
const verifyJwtToken = new JwtHelper().verifyJwtToken as TVerifyToken;
const uploadMiddleware = new FileUploadMiddleware(String(process.env.UPLOAD_FOLDER));

router.post('/start', verifyJwtToken, messageCtrl.startConversation);
router.get('/get-messages', verifyJwtToken, messageCtrl.getMessages);
router.get('/conversations', verifyJwtToken, messageCtrl.getConversations);
// router.put('/update-last-message', verifyJwtToken, messageCtrl.updateLastMessageInConversation);
router.post('/private-message', verifyJwtToken, uploadMiddleware.getMiddleware().single('file'), messageCtrl.privateMessageWithFiles);
router.delete('/delete-conversation/:id', verifyJwtToken, messageCtrl.permanentDeleteConversation);
export type TVerifyToken = (req: IRequest, res: Response, next: NextFunction) => Promise<Response | void>;
export default router;