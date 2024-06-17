"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateUUID = void 0;
const crypto_1 = __importDefault(require("crypto"));
const uuid_1 = require("uuid");
function generateObjectId() {
    return crypto_1.default.randomBytes(12).toString('hex');
}
exports.default = generateObjectId;
function generateUUID() {
    return (0, uuid_1.v4)();
}
exports.generateUUID = generateUUID;
// let id;
// let isUnique = false;
// while (!isUnique) {
//     id = generateUUID();
//     const [rows] = await db.query('SELECT COUNT(*) AS count FROM Messages WHERE id = ?', [id]);
//     if (rows[0].count === 0) {
//         isUnique = true;
//     }
// }
