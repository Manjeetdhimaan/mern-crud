"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const jwt_helper_1 = __importDefault(require("../middlewares/jwt-helper"));
const role_controller_1 = __importDefault(require("../controllers/role.controller"));
const verifyJwtToken = new jwt_helper_1.default().verifyJwtToken;
const roleCtrl = new role_controller_1.default();
router.post('/create-role', verifyJwtToken, roleCtrl.createRole);
router.get('/get-roles', verifyJwtToken, roleCtrl.getRoles);
router.delete('/permanent-delete-role/:id', verifyJwtToken, roleCtrl.permanentDeleteRole);
exports.default = router;
