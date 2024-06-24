"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const db_1 = __importDefault(require("./config/db"));
const role_controller_1 = __importDefault(require("./controllers/role-controller"));
const mockReq = {
    query: { page: '1', perPage: '100' }
};
const mockRes = {
    status: (statusCode) => ({
        json: (data) => {
            console.log(`Response Status: ${statusCode}`, data);
        }
    })
};
const mockNext = (err) => {
    if (err) {
        console.error('Error in getRolesInitially:', err);
    }
    else {
        console.log('Permissions registered successfully');
    }
};
(function server(port) {
    const roleCtrl = new role_controller_1.default();
    app_1.default.listen(port, async () => {
        try {
            console.log(`Node server running on port ${port}`);
            await db_1.default.getConnection();
            console.log('Resigtering permissions...');
            await roleCtrl.registerRoles(mockReq, mockRes, mockNext);
            console.log('Database connection succeeded');
        }
        catch (error) {
            console.log('Error connecting to mysql database =>', error);
        }
    });
})(Number(process.env['SERVER_PORT'] || 4002));
