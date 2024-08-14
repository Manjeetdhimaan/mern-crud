// import { NextFunction, Request, Response } from 'express';
import { createServer } from "http";

import app from "./app";
import db from "./config/db";
// import RoleController from "./controllers/role.controller";
import SocketServer from "./socket";

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

(function server(port: number) {
  const httpServer = createServer(app);
  new SocketServer(httpServer);

  // const roleCtrl = new RoleController();
  httpServer.listen(port, async () => {
    try {
      console.log(`Node express server running on port ${port}`);
      await db.getConnection();
      // console.log('Resigtering permissions...')
      // await roleCtrl.registerRoles(mockReq, mockRes, mockNext);
      console.log("Database connection succeeded");
    } catch (error) {
      console.log("Error connecting to mysql database =>", error);
    }
  });
})(Number(process.env["SERVER_PORT"] || 4002));
