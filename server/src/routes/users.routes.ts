import express from "express";
const router = express.Router();

import UserController from "../controllers/user-controller";
import JwtHelper from "../middlewares/jwt-helper";
const userCtrl = new UserController();
const verifyJwtToken = new JwtHelper().verifyJwtToken as any;

router.get('/', verifyJwtToken, userCtrl.getUsers);
router.get('/login', userCtrl.userLogin);
router.post('/sign-up', userCtrl.userSignup);

export default router;