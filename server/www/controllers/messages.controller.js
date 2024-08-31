"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_service_1 = __importDefault(require("../services/db.service"));
const messages_services_1 = __importDefault(require("../services/messages.services"));
const response_1 = require("../utils/response");
const generate_unique_id_1 = require("../helpers/generate-unique-id");
const database_tables_1 = require("../utils/database-tables");
const socket_1 = require("../socket");
class MessageController {
    constructor() {
        this.databaseService = new db_service_1.default();
        this.messageService = new messages_services_1.default();
        this.startConversation = async (req, res, next) => {
            try {
                const id = (0, generate_unique_id_1.generateUUID)();
                const payload = {
                    id,
                    title: req.body.title,
                    startedBy: req.body.startedBy,
                    recievedBy: req.body.recievedBy,
                };
                await this.databaseService.insertData(payload, database_tables_1.CONVERSATIONS);
                const fields = "id, title, startedBy, recievedBy, createdAt, updatedAt";
                const data = (await this.messageService.getConversationWithJoinUsers(database_tables_1.CONVERSATIONS, "startedBy", Number(payload.startedBy), "recievedBy", Number(payload.startedBy), fields));
                return res
                    .status(200)
                    .json((0, response_1.successAction)({ conversations: data }, "Conversation statred successfully!"));
            }
            catch (error) {
                return next(error);
            }
        };
        this.getConversations = async (req, res, next) => {
            try {
                const { senderId } = req.query;
                const fields = "id, title, startedBy, recievedBy, createdAt, updatedAt";
                const conversations = (await this.messageService.getConversationWithJoinUsers(database_tables_1.CONVERSATIONS, "startedBy", Number(senderId), "recievedBy", Number(senderId), fields));
                if (!conversations || conversations.length <= 0)
                    return res
                        .status(200)
                        .json((0, response_1.successAction)(null, "No conversations found!"));
                return res
                    .status(200)
                    .json((0, response_1.successAction)({ conversations }, "Conversations fetched successfully!"));
            }
            catch (error) {
                return next(error);
            }
        };
        this.getMessages = async (req, res, next) => {
            try {
                const { conversationId, page, limit } = req.query;
                // this.databaseService.streamData(MESSAGES, 'conversationId', conversationId, res);
                const data = (await this.databaseService.getData(database_tables_1.MESSAGES, "conversationId", conversationId, undefined, Number(page || 1), Number(limit || 20), "DESC"));
                if (!data || data.length <= 0)
                    return res.status(200).json((0, response_1.successAction)(null, "No messages found!"));
                const totalCount = await this.databaseService.getCount(database_tables_1.MESSAGES, "conversationId", conversationId);
                const protocol = req.protocol; // 'http' or 'https'
                const host = req.get("host"); // Hostname + port (if not 80 or 443)
                const url = `${protocol}://${host}/`;
                for (const message of data) {
                    if (message.messageType !== "text") {
                        message.body = url + message.body;
                    }
                }
                return res
                    .status(200)
                    .json((0, response_1.successAction)({ messages: data.reverse(), totalCount }, "Messages fetched successfully!"));
            }
            catch (error) {
                return next(error);
            }
        };
        this.privateMessageWithFiles = async (req, res, next) => {
            try {
                let messageContent = "";
                if (req.file) {
                    messageContent = req.file.path;
                }
                const { ownerId, conversationId, messageType } = req.body;
                const payload = {
                    ownerId,
                    conversationId,
                    messageType,
                    body: messageContent,
                };
                const response = (await this.databaseService.insertData(payload, database_tables_1.MESSAGES));
                const data = (await this.databaseService.getData(database_tables_1.MESSAGES, "id", response.insertId));
                const protocol = req.protocol; // 'http' or 'https'
                const host = req.get("host"); // Hostname + port (if not 80 or 443)
                const url = `${protocol}://${host}/`;
                data[0].body = url + data[0].body;
                (0, socket_1.emitFileShareMessage)(data[0]);
                return res
                    .status(200)
                    .json((0, response_1.successAction)({ message: data[0] }, "Message sent successfully!"));
            }
            catch (error) {
                return next(error);
            }
        };
        this.permanentDeleteConversation = async (req, res, next) => {
            try {
                const { id } = req.params;
                const data = await this.databaseService.permanentDelete(database_tables_1.CONVERSATIONS, "id", id);
                if (data) {
                    if (data.affectedRows > 0) {
                        return res.status(200).json((0, response_1.successAction)(null, "Conversation deleted permanently"));
                    }
                }
                return res.status(404).json((0, response_1.failAction)("No conversation found with this ID"));
            }
            catch (error) {
                console.log(error);
                return next(error);
            }
        };
        // updateLastMessageInConversation = async (
        //   req: Request,
        //   res: Response,
        //   next: NextFunction
        // ): Promise<Response | void> => {
        //   try {
        //     const { conversationId, lastMessageBy, lastMessage, lastMessageType } = req.body;
        //     await this.databaseService.update(CONVERSATIONS, "lastMessage", lastMessage, "id", conversationId, "lastMessageBy", lastMessageBy, "lastMessageType", lastMessageType);
        //     return res
        //       .status(200)
        //       .json(
        //         successAction(
        //           null,
        //           "Last messages updated successfully!"
        //         )
        //       );
        //   } catch (error) {
        //     return next(error);
        //   }
        // }
    }
}
exports.default = MessageController;
