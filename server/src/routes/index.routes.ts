import express from "express";
const router = express.Router();

import users from './users.routes';
import roles from './roles.routes';
import messages from './messages.routes';

router.use('/users', users);
router.use('/roles', roles);
router.use('/messages', messages);

export default router;