import express from 'express';
const router = express.Router();
import { createMesage, getMessages } from '../Controllers/messageController';
router.route('/').post(createMesage);
router.route('/:chatId').get(getMessages);
export default router;
