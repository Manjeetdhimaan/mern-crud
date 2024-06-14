import express from "express";
const router = express.Router();

import UserController from "../controllers/user-controller";
import JwtHelper from "../middlewares/jwt-helper";
const userCtrl = new UserController();
const verifyJwtToken = new JwtHelper().verifyJwtToken as any;

router.get('/get-users', verifyJwtToken, userCtrl.getUsersWithRole);
router.get('/get-user', verifyJwtToken, userCtrl.getUserWithRole);
router.delete('/delete-user/:id', verifyJwtToken, userCtrl.softDeleteUser);
router.delete('/permanent-delete-user/:id', verifyJwtToken, userCtrl.permanentDeleteUser);
router.get('/login', userCtrl.userLogin);
router.post('/sign-up', userCtrl.userSignup);

export default router;