"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// import os from "os";
// import cluster from "cluster";
const http_1 = require("http");
// import { NextFunction, Request, Response } from 'express';
const app_1 = __importDefault(require("./app"));
const db_1 = __importDefault(require("./config/db"));
const socket_1 = __importDefault(require("./socket"));
// import RoleController from "./controllers/role.controller";
// const mockReq = {
//     query: { page: '1', perPage: '100' }
// } as unknown as Request;
// const mockRes = {
//     status: (statusCode: number) => ({
//         json: <T>(data: T) => {
//             console.log(`Response Status: ${statusCode}`, data);
//         }
//     })
// } as Response;
// const mockNext: NextFunction = <T>(err?: T) => {
//     if (err) {
//         console.error('Error in getRolesInitially:', err);
//     } else {
//         console.log('Permissions registered successfully');
//     }
// };
(function server(port) {
    const httpServer = (0, http_1.createServer)(app_1.default);
    new socket_1.default(httpServer);
    httpServer.listen(port, async () => {
        try {
            console.log(`Node express server running on port ${port}`);
            await db_1.default.getConnection();
            // console.log('Resigtering permissions...')
            // await roleCtrl.registerRoles(mockReq, mockRes, mockNext);
            console.log("Database connection succeeded");
        }
        catch (error) {
            console.log("Error connecting to mysql database =>", error);
        }
    });
    // if (cluster.isPrimary) {
    //   console.log('Master has been started...');
    //   const NUM_WORKERS = os.cpus().length;
    //   for (let i = 0; i < NUM_WORKERS; i++) {
    //     cluster.fork();
    //   }
    // } else {
    //   console.log('Worker process started.');
    //   httpServer.listen(port, async () => {
    //     try {
    //       console.log(`Node express server running on port ${port}`);
    //       await db.getConnection();
    //       // console.log('Resigtering permissions...')
    //       // await roleCtrl.registerRoles(mockReq, mockRes, mockNext);
    //       console.log("Database connection succeeded");
    //     } catch (error) {
    //       console.log("Error connecting to mysql database =>", error);
    //     }
    //   });
    // }
    // const roleCtrl = new RoleController();
})(Number(process.env["SERVER_PORT"] || 4002));
