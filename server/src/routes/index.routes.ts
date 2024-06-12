import express from "express";
const router = express.Router();

import users from './users.routes';

router.use('/users', users);

export default router;