import BadRequestError from '../Errors/BadRequestError';
import Message from '../Models/messageModel';
import { Request, Response } from 'express';
import StatusCodes from 'http-status-codes';
import Chat from '../Models/chatModel';
const { CREATED, OK } = StatusCodes;
const createMesage = async (req: any, res: Response) => {
  const { chatId, message, imageUrl, recipient } = req.body;
  if (!chatId || !recipient || (!message && !imageUrl))
    throw new BadRequestError('please provide chatId, recipient and message');
  const newMessage = await Message.create({
    chat: chatId,
    sender: req.user.userId,
    recipient,
    text: message,
    imageUrl,
  });
  const chat = await Chat.findById(chatId);
  if (!chat) throw new BadRequestError('chat not found');
  chat.unreadMessages.set(
    recipient,
    (chat.unreadMessages.get(recipient) || 0) + 1
  );
  await chat.save();
  res.status(CREATED).json({ message: newMessage });
};

const getMessages = async (req: any, res: Response) => {
  const { chatId } = req.params;
  const messages = await Message.find({
    chat: chatId,
    $or: [{ sender: req.user.userId }, { recipient: req.user.userId }],
  }).sort('createdAt');
  // refactor this
  const chat = await Chat.findById(chatId);
  if (!chat) throw new BadRequestError('chat not found');
  chat.unreadMessages.set(req.user.userId, 0);
  await chat.save();
  res.status(OK).json({ messages });
};
export { createMesage, getMessages };
