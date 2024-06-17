"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../config/db"));
class DatabaseService {
    async isUserExist(emailOrUsername) {
        return new Promise(async function (resolve, reject) {
            try {
                // const query = 'SELECT COUNT(*) as count FROM Users WHERE email = ? OR username = ?';
                const query = 'SELECT COUNT(*) as count FROM Users WHERE email = ?';
                const [rows] = await db_1.default.query(query, [emailOrUsername]);
                const count = rows[0].count;
                return resolve(count > 0);
            }
            catch (error) {
                return reject(error);
            }
        });
    }
    async insertData(data, table) {
        return new Promise(async function (resolve, reject) {
            try {
                //* Getting all the keys to insert as fields into table
                if (!data || typeof data !== 'object') {
                    return reject('Invalid data provided');
                }
                const keys = Object.keys(data).map((key) => {
                    if (!data[key] || data[key] === '' || (typeof data[key] === 'string' && data[key].trim() === '')) {
                        return null;
                    }
                    return key;
                }).join(', ');
                //* Getting all the values to insert as values into table
                const values = Object.values(data).map(value => typeof value === 'string' ? `'${value}'` : value).join(', ');
                const query = `INSERT INTO ${table} (${keys}) VALUES (${values})`;
                const [result] = await db_1.default.query(query);
                return resolve(result);
            }
            catch (error) {
                return reject(error);
            }
        });
    }
    // common api service to get data dynamically from table.
    async getAll(table, fields = "*", page = 1, limit = 1000, getDeleted) {
        return new Promise(async (resolve, reject) => {
            try {
                const offset = (page - 1) * limit;
                let query = `SELECT ${fields} FROM ${table} LIMIT ${limit} OFFSET ${offset}`;
                if (getDeleted === false)
                    query = `SELECT ${fields} FROM ${table} WHERE isDeleted = ${false} LIMIT ${limit} OFFSET ${offset}`;
                if (getDeleted)
                    query = `SELECT ${fields} FROM ${table} WHERE isDeleted = ${true} LIMIT ${limit} OFFSET ${offset}`;
                const [result] = await db_1.default.query(query);
                return resolve(result);
            }
            catch (error) {
                return reject(error);
            }
        });
    }
    // common api service to get single( or can be multiple ) data dynamically from table.
    async getData(table, whereKey, whereValue, fields = "*", getDeleted) {
        return new Promise(async (resolve, reject) => {
            try {
                const extractedValue = typeof whereValue === 'string' ? `'${whereValue}'` : whereValue;
                let query = `SELECT ${fields} FROM ${table} WHERE ${whereKey} = ${extractedValue}`;
                if (getDeleted === false)
                    query = `SELECT ${fields} FROM ${table} WHERE ${whereKey} = ${extractedValue} AND isDeleted = ${false}`;
                if (getDeleted === true)
                    query = `SELECT ${fields} FROM ${table} WHERE ${whereKey} = ${extractedValue} AND isDeleted = ${true}`;
                const [result] = await db_1.default.query(query);
                return resolve(result);
            }
            catch (error) {
                return reject(error);
            }
        });
    }
    async softDelete(table, whereKey, whereValue) {
        return new Promise(async (resolve, reject) => {
            try {
                const value = typeof whereValue === 'string' ? `${whereValue}` : whereValue;
                const query = `UPDATE ${table} SET isDeleted = ${true} WHERE ${whereKey} = ${value}`;
                const [result] = await db_1.default.query(query);
                return resolve(result);
            }
            catch (error) {
                return reject(error);
            }
        });
    }
    async permanentDelete(table, whereKey, whereValue) {
        return new Promise(async (resolve, reject) => {
            try {
                const value = typeof whereValue === 'string' ? `${whereValue}` : whereValue;
                const query = `DELETE FROM ${table} WHERE ${whereKey} = ${value}`;
                const [result] = await db_1.default.query(query);
                return resolve(result);
            }
            catch (error) {
                return reject(error);
            }
        });
    }
}
exports.default = DatabaseService;
