import { NextFunction, Request, Response } from 'express';
import app from './app';
import db from './config/db';
import RoleController from "./controllers/role-controller";

const mockReq = {
    query: { page: '1', perPage: '100' }
} as unknown as Request;

const mockRes = {
    status: (statusCode: number) => ({
        json: <T>(data: T) => {
            console.log(`Response Status: ${statusCode}`, data);
        }
    })
} as Response;

const mockNext: NextFunction = <T>(err?: T) => {
    if (err) {
        console.error('Error in getRolesInitially:', err);
    } else {
        console.log('Permissions registered successfully');
    }
};

(function server() {
    const port = process.env['SERVER_PORT'] || 4002;
    const roleCtrl = new RoleController();
    app.listen(port, async () => {
        try {
            console.log(`Node server running on port ${port}`);
            await db.getConnection();
            // const query = `
            // DESCRIBE Users`;
            // const res = await db.query(query);
            // console.log(res);
            console.log('Resigtering permissions...')
            await roleCtrl.registerRoles(mockReq, mockRes, mockNext);
            console.log('Database connection succeeded');

        } catch (error) {
            console.log('Error connecting to mysql database', error);
        }
    });
})();