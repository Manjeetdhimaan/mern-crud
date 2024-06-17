"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const db_1 = __importDefault(require("./config/db"));
(function server() {
    const port = process.env['SERVER_PORT'] || 4002;
    app_1.default.listen(port, async () => {
        try {
            console.log(`Node server running on port ${port}`);
            await db_1.default.getConnection();
            // const query = `
            // DESCRIBE Users`;
            // const res = await db.query(query);
            // console.log(res);
            console.log('Database connection succeeded');
        }
        catch (error) {
            console.log('Error connecting to mysql database', error);
        }
    });
})();
