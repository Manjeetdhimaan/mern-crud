"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.poolPromise = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
const mysql2_1 = __importDefault(require("mysql2"));
const pool = promise_1.default.createPool({
    host: process.env.SQL_HOST,
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    database: process.env.SQL_DATABASE,
    port: Number(process.env.SQL_PORT)
});
const poolPromise = mysql2_1.default.createPool({
    host: process.env.SQL_HOST,
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    database: process.env.SQL_DATABASE,
    port: Number(process.env.SQL_PORT)
});
exports.poolPromise = poolPromise;
exports.default = pool;
