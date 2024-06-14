import dotenv from "dotenv"; dotenv.config();
import express, { NextFunction, Request, Response } from "express";
import bodyParser from "body-parser";

import db from './config/db';
import routes from './routes/index.routes';
import { errorHandler } from "./middlewares/error-handler";
// Read file "readme.txt" file to learn about migrations used in this project.

(function main() {
    const app = express();
    const port = process.env.SERVER_PORT || 4002;
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    // set headers
    app.use((req: Request, res: Response, next: NextFunction): void => {
        const allowedOrigins = [
            "http://127.0.0.1:4200",
            "http://localhost:4200",
            "https://yourdomain.com",
        ];
        const origin = req.headers.origin as string;
        if (allowedOrigins.includes(origin)) {
            res.setHeader("Access-Control-Allow-Origin", origin);
        }
        res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, OPTIONS");
        res.header(
            "Access-Control-Allow-Headers",
            "Content-type,Accept,X-Access-Token,X-Key,If-Modified-Since,Authorization"
        );
        res.header("Access-Control-Allow-Credentials", "true");
        return next();
    });

    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
    app.use("/api/v1", routes);
    app.use(errorHandler);
    app.listen(port, async () => {
        try {
            console.log(`Node server running on port ${port}`);
            await db.getConnection();
            // const query = `
            // DESCRIBE Users`;
            // const res = await db.query(query);
            // console.log(res)
            console.log('Database connection succeeded');
        } catch (error) {
            console.log('Error connecting to mysql database', error);
        }
    });
})();

