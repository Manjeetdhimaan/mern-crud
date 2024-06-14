import express from "express";
const router = express.Router();

import JwtHelper from "../middlewares/jwt-helper";
import RoleController from "../controllers/role-controller";
const verifyJwtToken = new JwtHelper().verifyJwtToken as any;
const roleCtrl = new RoleController();

router.post('/create-role', verifyJwtToken, roleCtrl.createRole);
router.get('/get-roles', verifyJwtToken, roleCtrl.getRoles);

export default router;