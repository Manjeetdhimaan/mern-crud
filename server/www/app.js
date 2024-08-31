"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const body_parser_1 = __importDefault(require("body-parser"));
const index_routes_1 = __importDefault(require("./routes/index.routes"));
const error_handler_1 = require("./middlewares/error-handler");
// Read file "readme.txt" to learn about migrations used in this project.
exports.default = (function app() {
    const app = (0, express_1.default)();
    const UPLOAD_FOLDER = process.env.UPLOAD_FOLDER || 'uploads';
    app.use(body_parser_1.default.json());
    app.use(body_parser_1.default.urlencoded({ extended: true }));
    // set headers
    app.use((req, res, next) => {
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
        res.header("Access-Control-Allow-Headers", "Content-type,Accept,X-Access-Token,X-Key,If-Modified-Since,Authorization");
        res.header("Access-Control-Allow-Credentials", "true");
        return next();
    });
    app.use(express_1.default.urlencoded({ extended: true }));
    app.use(express_1.default.json());
    app.use("/" + UPLOAD_FOLDER, express_1.default.static(path_1.default.join(__dirname, '..', UPLOAD_FOLDER)));
    app.use("/api/v1", index_routes_1.default);
    app.use(error_handler_1.errorHandler);
    app.use(express_1.default.static(path_1.default.join(__dirname, '.', 'dist')));
    app.get('*', (req, res) => {
        res.sendFile(path_1.default.join(__dirname, '.', 'dist/index.html'));
    });
    return app;
})();
