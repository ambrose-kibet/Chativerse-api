import express from 'express';
const router = express.Router();
import {
  getAllMyChats,
  getSingleChat,
  createChat,
  markMessagesAsRead,
} from '../Controllers/chatController';

router.route('/').post(createChat).get(getAllMyChats);
router.route('/:chatId').get(getSingleChat).patch(markMessagesAsRead);

export default router;
