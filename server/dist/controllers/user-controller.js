"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_service_1 = __importDefault(require("../services/db-service"));
const user_service_1 = __importDefault(require("../services/user-service"));
const jwt_helper_1 = __importDefault(require("../middlewares/jwt-helper"));
const response_1 = require("../utils/response");
const database_tables_1 = require("../utils/database-tables");
class UserController {
    constructor() {
        this.databaseService = new db_service_1.default();
        this.userService = new user_service_1.default();
        this.jwtHelper = new jwt_helper_1.default();
        this.getUpdatedUserWithRole = (user) => {
            const userWithRole = {
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                password: user.password,
                isDeleted: user.isDeleted,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                role: {
                    id: Number(user.roleId),
                    name: String(user.roleName),
                    normalized: String(user.roleNormalized),
                    description: String(user.roleDescription),
                    grants: user.roleGrants || [],
                    isSupport: false,
                    isAdmin: false,
                },
                token: ""
            };
            const isAdmin = userWithRole.role.grants.includes('admin:*');
            const isSupport = userWithRole.role.grants.includes('support:*');
            userWithRole.role.isAdmin = isAdmin;
            userWithRole.role.isSupport = isSupport;
            return userWithRole;
        };
        this.userSignup = async (req, res, next) => {
            try {
                const payload = req.body;
                if (await this.userService.isUserExist(payload.email)) {
                    return res.status(422).json((0, response_1.failAction)("Account with this email exists already, Please try again with different one."));
                }
                if (!payload.password || !payload.password.trim()) {
                    return res.status(422).json((0, response_1.failAction)("Password is required."));
                }
                payload.password = await bcryptjs_1.default.hash(payload.password, 10);
                const data = await this.databaseService.insertData(payload, database_tables_1.USERS);
                return res.status(200).json((0, response_1.successAction)(data, "Account created successfully!"));
            }
            catch (error) {
                return next(error);
            }
        };
        this.userLogin = async (req, res, next) => {
            try {
                const { email, password } = req.body;
                const { getDeleted } = req.query;
                // const data = await this.databaseService.getData(USERS, "email", email) as IUser[];
                const data = await this.userService.getUsersWithRole(undefined, email, getDeleted === "true" ? true : false);
                if (data && data.length > 0) {
                    const user = data[0];
                    if (user && await bcryptjs_1.default.compare(password, user.password)) {
                        const userWithRole = this.getUpdatedUserWithRole(user);
                        userWithRole.token = await this.jwtHelper.generateJwt(userWithRole.id, userWithRole.email, userWithRole.role);
                        const { password, ...userWithoutPassword } = userWithRole;
                        return res.status(200).json((0, response_1.successAction)(userWithoutPassword, "User fetched successfully"));
                    }
                }
                return res.status(404).json((0, response_1.failAction)("Incorrect email or password"));
            }
            catch (error) {
                console.log(error);
                return next(error);
            }
        };
        //! Not in use for now
        this.getUsers = async (req, res, next) => {
            try {
                const { page, perPage, getDeleted } = req.query;
                const fields = 'id, fullName, email, createdAt, updatedAt, isDeleted roleId';
                // const fields = '*'
                const data = await this.databaseService.getAll(database_tables_1.USERS, fields, (Number(page) || 1), (Number(perPage) || 10), getDeleted === "true" ? true : false);
                // const modifiedData = (data as { [key: string]: string }[]).map((ob) => {
                //     const { password, ...rest } = ob;
                //     return rest;
                // })
                if (!data || data.length <= 0)
                    return res.status(200).json((0, response_1.successAction)(null, "No users found!"));
                return res.status(200).json((0, response_1.successAction)({ users: data }, "Users fetched successfully!"));
            }
            catch (error) {
                return next(error);
            }
        };
        //! Not in use for now
        this.getUser = async (req, res, next) => {
            try {
                const id = req.query.id || req._id; //* if sending id through query, it will find user with that id otherwise it will return the logged in user through token
                const { getDeleted } = req.query;
                const fields = 'id, fullName, email, createdAt, updatedAt, isDeleted, roleId';
                const data = await this.databaseService.getData(database_tables_1.USERS, 'id', Number(id), fields, getDeleted === "true" ? true : false);
                if (data && data.length > 0) {
                    // const { password, ...rest } = data[0];
                    return res.status(200).json((0, response_1.successAction)({ user: data[0] }, "User fetched successfully!"));
                }
                return res.status(200).json((0, response_1.successAction)(null, "No user found"));
            }
            catch (error) {
                console.log(error);
                return next(error);
            }
        };
        this.getUserWithRole = async (req, res, next) => {
            try {
                const id = req.query.id || req._id; //* if sending id through query, it will find user with that id otherwise it will return the logged in user through token
                const { getDeleted } = req.query;
                // const fields = 'id, fullName, email, createdAt, updatedAt, isDeleted, roleId'
                const data = await this.userService.getUsersWithRole(Number(id), undefined, getDeleted === "true" ? true : false);
                if (data && data.length > 0) {
                    // const { password, ...rest } = data[0];
                    const user = data[0];
                    const userWithRole = this.getUpdatedUserWithRole(user);
                    const { password, ...userWithoutPassword } = userWithRole;
                    return res.status(200).json((0, response_1.successAction)({ user: userWithoutPassword }, "User fetched successfully!"));
                }
                return res.status(200).json((0, response_1.successAction)(null, "No user found"));
            }
            catch (error) {
                console.log(error);
                return next(error);
            }
        };
        this.getUsersWithRole = async (req, res, next) => {
            try {
                const { getDeleted } = req.query;
                // const fields = 'id, fullName, email, createdAt, updatedAt, isDeleted, roleId'
                const data = await this.userService.getUsersWithRole(undefined, undefined, getDeleted === "true" ? true : false);
                if (data && data.length > 0) {
                    // const { password, ...rest } = data[0];
                    const users = data.map(user => {
                        const userWithRole = this.getUpdatedUserWithRole(user);
                        const { password, ...userWithoutPassword } = userWithRole;
                        return userWithoutPassword;
                    });
                    return res.status(200).json((0, response_1.successAction)({ user: users }, "User fetched successfully!"));
                }
                return res.status(200).json((0, response_1.successAction)(null, "No user found"));
            }
            catch (error) {
                console.log(error);
                return next(error);
            }
        };
        this.softDeleteUser = async (req, res, next) => {
            try {
                const { id } = req.params;
                const data = await this.databaseService.softDelete(database_tables_1.USERS, "id", Number(id));
                if (data) {
                    if (data && data.affectedRows > 0) {
                        return res.status(200).json((0, response_1.successAction)(null, "User deleted successfully"));
                    }
                }
                return res.status(404).json((0, response_1.failAction)("No user found with this ID"));
            }
            catch (error) {
                console.log(error);
                return next(error);
            }
        };
        this.permanentDeleteUser = async (req, res, next) => {
            try {
                const { id } = req.params;
                const data = await this.databaseService.permanentDelete(database_tables_1.USERS, "id", Number(id));
                if (data) {
                    if (data.affectedRows > 0) {
                        return res.status(200).json((0, response_1.successAction)(null, "User deleted permanently"));
                    }
                }
                return res.status(404).json((0, response_1.failAction)("No user found with this ID"));
            }
            catch (error) {
                console.log(error);
                return next(error);
            }
        };
    }
}
exports.default = UserController;
