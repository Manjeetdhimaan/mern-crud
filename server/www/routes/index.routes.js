"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const users_routes_1 = __importDefault(require("./users.routes"));
const roles_routes_1 = __importDefault(require("./roles.routes"));
const messages_routes_1 = __importDefault(require("./messages.routes"));
router.use('/users', users_routes_1.default);
router.use('/roles', roles_routes_1.default);
router.use('/messages', messages_routes_1.default);
exports.default = router;
