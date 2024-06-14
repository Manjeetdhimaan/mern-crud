import express from "express";
const router = express.Router();

import users from './users.routes';
import roles from './roles.routes';

router.use('/users', users);
router.use('/roles', roles);

export default router;