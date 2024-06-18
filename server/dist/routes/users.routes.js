"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = __importDefault(require("../controllers/user-controller"));
const jwt_helper_1 = __importDefault(require("../middlewares/jwt-helper"));
const permissions_1 = require("../middlewares/permissions");
const router = express_1.default.Router();
const userCtrl = new user_controller_1.default();
const verifyJwtToken = new jwt_helper_1.default().verifyJwtToken;
router.get('/get-users', verifyJwtToken, (0, permissions_1.canUser)('user:view'), userCtrl.getUsersWithRole);
router.get('/get-user', verifyJwtToken, (0, permissions_1.canUser)('user:view'), userCtrl.getUserWithRole);
router.delete('/delete-user/:id', verifyJwtToken, (0, permissions_1.canUser)('user:delete'), userCtrl.softDeleteUser);
router.delete('/permanent-delete-user/:id', verifyJwtToken, (0, permissions_1.canUser)('user:delete'), userCtrl.permanentDeleteUser);
router.get('/login', userCtrl.userLogin);
router.post('/sign-up', userCtrl.userSignup);
exports.default = router;
