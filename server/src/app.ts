import dotenv from "dotenv"; dotenv.config();
import express, { NextFunction, Request, Response } from "express";
import path from "path";
import bodyParser from "body-parser";

import routes from './routes/index.routes';
import { errorHandler } from "./middlewares/error-handler";
// Read file "readme.txt" to learn about migrations used in this project.

export default (function app() {
    const app = express();

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    // set headers
    app.use((req: Request, res: Response, next: NextFunction): void => {
        const allowedOrigins = [
            "http://127.0.0.1:5173",
            "http://localhost:5173",
            "https://yourdomain.com",
        ];
        const origin = String(req.headers.origin);
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

    app.use(express.static(path.join(__dirname, '..', 'dist')));

    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '..', 'dist/index.html'));
    });
    return app;
})();

