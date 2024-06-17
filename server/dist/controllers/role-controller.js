"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_service_1 = __importDefault(require("../services/db-service"));
const database_tables_1 = require("../utils/database-tables");
const response_1 = require("../utils/response");
class RoleController extends db_service_1.default {
    constructor() {
        super();
        this.createRole = async (req, res, next) => {
            const payload = req.body;
            const normalized = payload.name.trim().toLowerCase().split(' ').join('-');
            payload.normalized = normalized;
            payload.grants = JSON.stringify(payload.grants);
            try {
                const data = await this.insertData(payload, database_tables_1.ROLES);
                return res.status(200).json((0, response_1.successAction)(data, "Role created successfully!"));
            }
            catch (error) {
                return next(error);
            }
        };
        this.getRoles = async (req, res, next) => {
            try {
                const { page, perPage } = req.query;
                // const fields = '*'
                const data = await this.getAll(database_tables_1.ROLES, undefined, (Number(page) || 1), (Number(perPage) || 10));
                if (!data || data.length <= 0)
                    return res.status(200).json((0, response_1.successAction)(null, "No roles found!"));
                return res.status(200).json((0, response_1.successAction)({ users: data }, "Roles fetched successfully!"));
            }
            catch (error) {
                return next(error);
            }
        };
        this.getRole = async (req, res, next) => {
            try {
                // const fields = '*';              
                const data = await this.getData(database_tables_1.ROLES, "id", req.query.id);
                if (!data || data.length <= 0)
                    return res.status(200).json((0, response_1.successAction)(null, "No roles found!"));
                return res.status(200).json((0, response_1.successAction)({ users: data }, "Roles fetched successfully!"));
            }
            catch (error) {
                return next(error);
            }
        };
    }
}
exports.default = RoleController;
