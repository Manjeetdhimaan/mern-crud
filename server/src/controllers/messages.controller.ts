import { Request, Response, NextFunction } from "express";
import { QueryResult } from "mysql2";

import DatabaseService from "../services/db.service";
import MessageService from "../services/messages.services";
import { successAction } from "../utils/response";
import { CONVERSATIONS, MESSAGES } from "../utils/database-tables";
import { generateUUID } from "../helpers/generate-unique-id";
import { IUser } from "../types/user.types";

export default class UserController {
    private databaseService = new DatabaseService();
    private messageService = new MessageService();

    startConversation = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const id = generateUUID();
            const payload = {
                id,
                title: req.body.title,
                startedBy: req.body.startedBy,
                recievedBy: req.body.recievedBy
            };

            await this.databaseService.insertData(payload, CONVERSATIONS);
            const data = await this.databaseService.getData(CONVERSATIONS, 'startedBy', req.body.startedBy) as QueryResult[];
            return res.status(200).json(successAction(data[0], "Conversation statred successfully!"));

        } catch (error) {
            return next(error);
        }
    }

    getConversations = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const { senderId } = req.query;
            const fields = 'id, title, startedBy, recievedBy, createdAt, updatedAt'
            const conversations = await this.messageService.getConversationWithJoinUsers(CONVERSATIONS, 'startedBy', Number(senderId), 'recievedBy', Number(senderId), fields) as IUser[];
            if (!conversations || conversations.length <= 0) return res.status(200).json(successAction(null, "No conversations found!"));
            return res.status(200).json(successAction({conversations}, "Conversations fetched successfully!"));
        } catch (error) {
            return next(error);
        }
    }

    getMessages = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const { conversationId, page, limit } = req.query;
            const data = await this.databaseService.getData(MESSAGES, 'conversationId', conversationId, undefined, Number(page || 1), Number(limit || 20), 'DESC') as IUser[];
            if (!data || data.length <= 0) return res.status(200).json(successAction(null, "No messages found!"));
            const totalCount = await this.databaseService.getCount(MESSAGES, 'conversationId', conversationId);
            return res.status(200).json(successAction({ messages: data.reverse(), totalCount }, "Messages fetched successfully!"));
        } catch (error) {
            return next(error);
        }
    }

}