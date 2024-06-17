"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../config/db"));
class UserService {
    async getUsersWithRole(userId, getDeleted = false) {
        return new Promise(async (resolve, reject) => {
            try {
                // to get multiple 
                let query = `SELECT Users.id, Users.fullName, Users.email, Users.createdAt, Users.updatedAt, Users.isDeleted, Users.roleId, 
                Roles.id AS roleId, 
                Roles.name AS roleName, 
                Roles.normalized AS roleNormalized, 
                Roles.description AS roleDescription, 
                Roles.grants AS roleGrants 
                FROM Users JOIN Roles ON Users.roleId = Roles.id WHERE isDeleted = ${getDeleted}
            `;
                if (userId) { // to get single user
                    query = `SELECT Users.id, Users.fullName, Users.email, Users.createdAt, Users.updatedAt, Users.isDeleted, Users.roleId, 
                Roles.id AS roleId, 
                Roles.name AS roleName, 
                Roles.normalized AS roleNormalized, 
                Roles.description AS roleDescription, 
                Roles.grants AS roleGrants 
                FROM Users JOIN Roles ON Users.roleId = Roles.id WHERE Users.id = ${userId} AND isDeleted = ${getDeleted}
            `;
                }
                const [result] = await db_1.default.query(query);
                return resolve(result);
            }
            catch (error) {
                return reject(error);
            }
        });
    }
}
exports.default = UserService;
