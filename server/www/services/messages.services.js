"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../config/db"));
class MessageService {
    // common api service to get single( or can be multiple ) data dynamically from table.
    async getConversationWithJoinUsers(table, whereKey, whereValue, orWhereKey, orWhereValue, fields = "*", getDeleted) {
        return new Promise(async function (resolve, reject) {
            try {
                // const extractedValue = typeof whereValue === 'string' ? `'${whereValue}'` : whereValue;
                const query = `
                SELECT 
                    c.id AS conversationId,
                    c.title,
                    c.createdAt AS conversationCreatedAt,
                    c.updatedAt AS conversationUpdatedAt,
                    c.lastMessageBy AS lastMessageBy,
                    c.lastMessage AS lastMessage,
                    c.lastMessageType AS lastMessageType,
                    c.lastMessageCreatedAt AS lastMessageCreatedAt,
                    su.id AS startedById,
                    su.fullName AS startedByName,
                    su.email AS startedByEmail,
                    su.isDeleted AS startedByIsDeleted,
                    su.createdAt AS startedByCreatedAt,
                    su.updatedAt AS startedByUpdatedAt,
                    ru.id AS receivedById,
                    ru.fullName AS receivedByName,
                    ru.email AS receivedByEmail,
                    ru.isDeleted AS receivedByIsDeleted,
                    ru.createdAt AS receivedByCreatedAt,
                    ru.updatedAt AS receivedByUpdatedAt
                FROM 
                    Conversations c
                JOIN 
                    Users su ON c.startedBy = su.id
                JOIN 
                    Users ru ON c.recievedBy = ru.id
                WHERE 
                    su.id = ${whereValue} or ru.id = ${orWhereValue};
                `;
                // let query = `SELECT ${fields} FROM ${table} WHERE ${whereKey} = ${extractedValue} OR ${orWhereKey} = ${extractedValue}`;
                // if (getDeleted === false) query = `SELECT ${fields} FROM ${table} WHERE ${whereKey} = ${extractedValue} OR ${orWhereKey} = ${extractedValue} AND isDeleted = ${false}`;
                // if (getDeleted === true) query = `SELECT ${fields} FROM ${table} WHERE ${whereKey} = ${extractedValue} OR ${orWhereKey} = ${extractedValue} AND isDeleted = ${true}`;
                const [result] = await db_1.default.query(query);
                return resolve(result);
            }
            catch (error) {
                return reject(error);
            }
        });
    }
}
exports.default = MessageService;
